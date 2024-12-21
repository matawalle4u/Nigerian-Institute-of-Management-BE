import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Login } from './entities/login.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/signup.dto';
import { Members } from 'src/membership/entities/membership.entity';
import * as jwt from 'jsonwebtoken';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Login)
    private readonly loginRepository: Repository<Login>,

    @InjectRepository(Members)
    private readonly memberRepository: Repository<Members>,
    private readonly jwtService: JwtService,
  ) {}

  async validateMembership(
    membership: string,
    nameOrDob: string,
  ): Promise<Members> {
    const nameParts = nameOrDob.split(' ');
    const isFullName = nameParts.length > 1;

    const user = await this.memberRepository.findOne({
      where: [
        {
          memberNo: membership,
          ...(isFullName
            ? {
                firstName: nameParts[0],
                lastName: nameParts.slice(1).join(' '),
              }
            : { dateOfBirth: nameOrDob }),
        },
      ],
    });

    if (!user) {
      throw new UnauthorizedException(
        `Invalid membership or personal details: ${membership}`,
      );
    }

    return user;
  }

  async createUser(signupDto: SignupDto): Promise<Login> {
    const { username, email, password } = signupDto;

    const existingUser = await this.loginRepository.findOne({
      where: { email: email },
    });
    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const payload = { sub: username, email: email };
    const accessToken = this.jwtService.sign(payload);

    const newUser = this.loginRepository.create({
      username,
      email,
      password: hashedPassword,
      default_password: 'no',
      status: 'active',
      reset_token: accessToken,
    });

    try {
      // Save the user in the database
      return await this.loginRepository.save(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string; user: Login }> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.loginRepository.findOne({
      where: [{ email: email }, { password: hashedPassword }],
    });

    if (!user) {
      throw new InternalServerErrorException('Invalid Credentials');
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken, user };
  }

  async fetchUserInfo(authToken: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(authToken);
      const user = await this.loginRepository.findOne({
        where: { email: payload.email, status: 'active' },
      });
      if (!user) {
        throw new UnauthorizedException('Invalid or expired token');
      }
      const userInfo = {
        membershipId: user.id,
        membershipGrade: user.authority,
        membershipChapter: 'Default Chapter', // Replace with actual logic
        outstandingDue: 0, // TODO Replace with actual logic
        name: user.username,
        email: user.email,
        status: user.status,
      };
      return userInfo;
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  async changePassword(
    changePasswordDto: ChangePasswordDto,
    authorizationHeader: string,
  ): Promise<void> {
    const { newPassword } = changePasswordDto;
    // Ensure the Authorization header is provided
    if (!authorizationHeader) {
      throw new BadRequestException('Authorization header is missing');
    }
    // Extract the token from the Authorization header
    const token = authorizationHeader.split(' ')[1]; // Assuming 'Bearer <token>'
    if (!token) {
      throw new BadRequestException('Invalid Authorization header format');
    }
    // Decode the token to get the user ID
    const decoded = this.decodeToken(token);
    const userId = parseInt(decoded.userId, 10); // Convert userId to a number
    //const userId = decoded.userId;
    // Find the user by ID
    const user = await this.loginRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    // Save the updated user
    await this.loginRepository.save(user);
  }
  decodeToken(token: string): { userId: string } {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
      return { userId: decoded.sub }; // Assuming `sub` contains the user ID
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
