import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Login } from './entities/login.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as moment from 'moment';
import { SignupDto } from './dto/signup.dto';
import { Members } from 'src/membership/entities/membership.entity';

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

    const newUser = this.loginRepository.create({
      username,
      email,
      password: hashedPassword,
      default_password: 'no',
      status: 'active',
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
    const user = await this.loginRepository.findOne({
      where: { reset_token: authToken, status: 'active' },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const userInfo = {
      membershipId: user.id,
      membershipGrade: user.authority, // Mapping authority to grade
      membershipChapter: 'Default Chapter', // Replace with actual logic
      outstandingDue: 0, // Replace with actual logic
      name: user.username,
      email: user.email,
      status: user.status,
    };

    return userInfo;
  }
}
