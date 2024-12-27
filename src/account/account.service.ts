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
import { CreateUserDto } from './dto/create-user.dto';
import { Members } from 'src/membership/entities/membership.entity';
import * as jwt from 'jsonwebtoken';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';

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
  ): Promise<{ accessToken: string; user: Members }> {
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

    const payload = { memberId: user.id, memberNo: user.memberNo };
    const token = this.jwtService.sign(payload, { expiresIn: '15m' });
    return {
      accessToken: token,
      user: {
        ...user,
      },
    };
  }

  async createUser(signupDto: CreateUserDto): Promise<Login> {
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

  async signup(token: string, signupDto: SignupDto): Promise<void> {
    const { email } = signupDto;

    const payload = this.jwtService.verify(token);
    const { memberId, memberNo } = payload;
    const member = await this.memberRepository.findOne({
      where: { id: memberId },
    });
    if (!member) {
      throw new UnauthorizedException('Invalid token');
    }

    const hashedPassword = await bcrypt.hash(signupDto.password, 10);
    const login = new Login();
    login.member = member;
    login.password = hashedPassword;
    login.username = memberNo; // Use the member number from the token payload
    login.email = email;
    const savedLogin = await this.loginRepository.save(login);
    member.loginId = savedLogin;
    await this.memberRepository.save(member);
  }

  async login(
    signinDto: SigninDto,
  ): Promise<{ accessToken: string; user: Login }> {
    const hashedPassword = await bcrypt.hash(signinDto.password, 10);
    console.log(signinDto.password, hashedPassword);
    const loginDetails = await this.loginRepository.findOne({
      where: { email: signinDto.email },
      relations: ['member'],
    });

    if (!loginDetails) {
      throw new InternalServerErrorException('Invalid Credentials');
    }
    // const isMatch = await bcrypt.compare(signinDto.password, user.password);

    // if (!isMatch) {
    //   throw new InternalServerErrorException('Invalid Credentials');
    // }
    const payload = { sub: loginDetails.id, email: loginDetails.email };
    const accessToken = this.jwtService.sign(payload);
    return {
      accessToken,
      user: {
        ...loginDetails,
        member: loginDetails.member,
      },
    };
  }

  async fetchUserInfo(authToken: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(authToken);
      const user = await this.loginRepository.findOne({
        where: { email: payload.email, status: 'active' },
        relations: ['member'],
      });
      console.log(user);
      if (!user) {
        throw new UnauthorizedException('Invalid or expired token');
      }
      return user.member;
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  async changePassword(
    changePasswordDto: ChangePasswordDto,
    authorizationHeader: string,
  ): Promise<void> {
    const { newPassword } = changePasswordDto;
    if (!authorizationHeader) {
      throw new BadRequestException('Authorization header is missing');
    }
    const token = authorizationHeader.split(' ')[1]; // Assuming 'Bearer <token>'
    if (!token) {
      throw new BadRequestException('Invalid Authorization header format');
    }
    const decoded = this.decodeToken(token);
    const userId = parseInt(decoded.userId, 10);
    const user = await this.loginRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
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
