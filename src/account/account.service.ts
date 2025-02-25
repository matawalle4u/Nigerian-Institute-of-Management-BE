import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  NotFoundException,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Login } from './entities/login.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import { Members } from 'src/membership/entities/membership.entity';
import axios from 'axios';
import { Otp } from './entities/otp.entity';
import { RequestOtpDto, VerifyOtpDto } from './dto/request-otp';
import { MailerService as EmailService } from 'src/mailer/mailer.service';

@Injectable()
export class AccountService {
  private readonly baseUrl =
    'https://api2.uverify.com.ng/v1/rest-api/verification/nin';
  private readonly apiKey = process.env.UVERIFY_API_KEY;

  constructor(
    @InjectRepository(Login)
    private readonly loginRepository: Repository<Login>,

    @InjectRepository(Members)
    private readonly memberRepository: Repository<Members>,
    private readonly jwtService: JwtService,

    @InjectRepository(Otp) private otpRepository: Repository<Otp>,
    private mailerService: EmailService,
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
          member_no: membership,
          ...(isFullName
            ? {
                first_name: nameParts[0],
                last_name: nameParts.slice(1).join(' '),
              }
            : { date_of_birth: nameOrDob }),
        },
      ],
    });

    if (!user) {
      throw new UnauthorizedException(
        `Invalid membership or personal details: ${membership}`,
      );
    }

    const payload = { memberId: user.id, memberNo: user.member_no };
    const token = this.jwtService.sign(payload);
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
      throw new InternalServerErrorException(error.message);
    }
  }

  async signup(token: string, email: string, password: string): Promise<any> {
    const payload = this.jwtService.verify(token);
    const { memberId, memberNo } = payload;
    const member = await this.memberRepository.findOne({
      where: { id: memberId },
    });
    if (!member) {
      throw new UnauthorizedException('Invalid token');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const login = new Login();
    login.member = member;
    login.password = hashedPassword;
    login.username = memberNo;
    login.email = email;
    const savedLogin = await this.loginRepository.save(login);
    member.login_id = savedLogin;

    await this.memberRepository.save(member);
    const cred = { sub: savedLogin.id, email: savedLogin.email };
    const accessToken = this.jwtService.sign(cred);

    return {
      accessToken: accessToken,
      user: {
        id: savedLogin.id,
        email: savedLogin.email,
        username: savedLogin.username,
        member: {
          id: member.id,
          member_no: member.member_no,
          first_name: member.first_name,
          last_name: member.last_name,
        },
      },
    };
  }
  async requestOtp(dto: RequestOtpDto): Promise<string> {
    const user = await this.loginRepository.findOne({
      where: { email: dto.email },
    });
    if (!user)
      throw new BadRequestException('User with this email does not exist.');

    const otpCode = Math.floor(1000 + Math.random() * 9000).toString(); // Generate 4-digit OTP
    const otp = this.otpRepository.create({ user, otp: otpCode });
    await this.otpRepository.save(otp);

    //TODO OTP should generate a token based on the crendetials to avoid having to provide the email while veryfying
    const template_path = process.cwd() + '/templates/';
    this.mailerService.sendEmail(
      dto.email,
      'Password Reset',
      `Your OTP is ${otpCode}`,
      `${template_path}/MAILER_TEMPLATE`,
    );

    console.log(`Your OTP is ${otpCode}`);
    return 'OTP sent to email.';
  }

  async verifyOtp(
    dto: VerifyOtpDto,
  ): Promise<{ accessToken: string; user: Login }> {
    const user = await this.loginRepository.findOne({
      where: { email: dto.email },
    });
    if (!user)
      throw new BadRequestException('User with this email does not exist.');

    const otp = await this.otpRepository
      .createQueryBuilder('otp')
      .where('otp.userId = :userId', { userId: user.id })
      .andWhere('otp.otp = :otp', { otp: dto.otp })
      .andWhere('otp.verified = :verified', { verified: 0 })
      .getOne();

    console.log(`otp ${otp}`);
    if (!otp) throw new BadRequestException('Invalid or expired OTP.');

    otp.verified = true;
    await this.otpRepository.save(otp);

    //Generate token after that
    const payload = { email: dto.email };
    const accessToken = this.jwtService.sign(payload);

    user.reset_token = accessToken;
    await this.loginRepository.save(user);
    return {
      accessToken,
      user,
    };
  }

  resetPassword(newPassword: string, authToken: string): Promise<string> {
    return Promise.resolve()
      .then(() => this.jwtService.verify(authToken))
      .then((payload) => {
        return this.loginRepository.findOne({
          where: { email: payload.email, status: 'active' },
          relations: ['member'],
        });
      })
      .then((user) => {
        if (!user) {
          throw new BadRequestException('User with this email does not exist.');
        }

        return bcrypt.hash(newPassword, 10).then((newHashedPassword) => {
          user.password = newHashedPassword;
          return this.loginRepository.save(user).then(() => user);
        });
      })
      .then((user) => {
        return this.otpRepository.delete({ user }).then(() => user.member);
      })
      .catch((error) => {
        throw error;
      });
  }

  login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string; user: Login }> {
    return this.loginRepository
      .findOne({
        where: { email },
        relations: ['member'],
      })
      .then((loginDetails) => {
        if (!loginDetails) {
          throw new NotFoundException('User not found');
        }

        return bcrypt
          .compare(password, loginDetails.password)
          .then((isMatch) => {
            if (!isMatch) {
              throw new InternalServerErrorException('Invalid Credentials');
            }

            const payload = { sub: loginDetails.id, email: loginDetails.email };
            const accessToken = this.jwtService.sign(payload);

            return {
              accessToken,
              user: {
                ...loginDetails,
                member: loginDetails.member,
              },
            };
          });
      })
      .catch((error) => {
        throw error;
      });
  }

  fetchUserInfo(authToken: string): Promise<any> {
    return Promise.resolve()
      .then(() => {
        return this.jwtService.verify(authToken);
      })
      .then((payload) => {
        return this.loginRepository.findOne({
          where: { email: payload.email, status: 'active' },
          relations: ['member', 'member.chapter'],
        });
      })
      .then((user) => {
        if (!user) {
          throw new NotFoundException('User not found');
        }
        return {
          id: user.id,
          email: user.email,
          username: user.username,
          member: { ...user.member },
        };
      })
      .catch((error) => {
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new UnauthorizedException(error.message);
      });
  }

  changePassword(authToken: string, newPassword: string): Promise<any> {
    return Promise.resolve(this.jwtService.verify(authToken))
      .then((payload) => {
        return this.loginRepository.findOne({
          where: { email: payload.email },
        });
      })
      .then((user) => {
        if (!user) {
          throw new NotFoundException('User not found');
        }
        return bcrypt.hash(newPassword, 10).then((newHashedPassword) => {
          user.password = newHashedPassword;
          return this.loginRepository.save(user);
        });
      })
      .then((updatedUser) => updatedUser)
      .catch((error) => {
        throw error;
      });
  }

  async verifyNIN(nin: string): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${nin}`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            apiKey: this.apiKey,
          },
        },
      );

      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data,
        error.response?.status || 500,
      );
    }
  }
}
