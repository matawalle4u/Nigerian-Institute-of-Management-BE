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

@Injectable()
export class AccountService {
  userRepository: any;
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
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await this.userRepository.save(user);
  }
  decodeToken(token: string): string {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
      return decoded.userId;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
