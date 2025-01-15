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
import { ChangePasswordDto } from './dto/change-password.dto';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import axios from 'axios';
import { Otp } from './entities/otp.entity';
import {
  RequestOtpDto,
  ResetPasswordDto,
  VerifyOtpDto,
} from './dto/request-otp';
import { MailerService } from '@nestjs-modules/mailer';

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
    private mailerService: MailerService,
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
    const token = this.jwtService.sign(payload, { expiresIn: '30m' });
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

  async signup(token: string, signupDto: SignupDto): Promise<any> {
    console.log(token);
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

    //sign a jwt token for use
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
          memberNo: member.memberNo,
          firstName: member.firstName,
          lastName: member.lastName,
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
    // Send OTP via email
    await this.mailerService.sendMail({
      to: dto.email,
      subject: 'Your Password Reset OTP',
      text: `Your OTP is ${otpCode}`,
    });

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

    // const otp = await this.otpRepository.findOne({
    //   where: { user, otp: dto.otp, verified: 0 },
    // });

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
    /*
    TODO
    Set reset_token on the login creadentials
    */
    //user.reset_token = accessToken;

    user.reset_token = accessToken;
    await this.loginRepository.save(user);
    return {
      accessToken,
      user,
    };
  }
  async resetPassword(
    dto: ResetPasswordDto,
    authToken: string,
  ): Promise<string> {
    /*/
    TODO catch token expiration error
    */
    const payload = this.jwtService.verify(authToken);
    console.log(payload);
    const user = await this.loginRepository.findOne({
      where: { email: payload.email, status: 'active' },
      relations: ['member'],
    });

    if (!user)
      throw new BadRequestException('User with this email does not exist.');

    const newHashedPassword = await bcrypt.hash(dto.newPassword, 10);
    user.password = newHashedPassword;
    await this.loginRepository.save(user);

    // Optionally delete OTP after use
    await this.otpRepository.delete({ user });

    return 'Password reset successfully.';
  }
  async login(
    signinDto: SigninDto,
  ): Promise<{ accessToken: string; user: Login }> {
    const loginDetails = await this.loginRepository.findOne({
      where: { email: signinDto.email },
      relations: ['member'],
    });
    if (!loginDetails) {
      throw new NotFoundException('User not found');
    }
    const isMatch = await bcrypt.compare(
      signinDto.password,
      loginDetails.password,
    );

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
  }

  async fetchUserInfo(authToken: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(authToken);
      const user = await this.loginRepository.findOne({
        where: { email: payload.email, status: 'active' }, //this has no payload.email if you use the validate token
        relations: ['member'],
      });
      console.log(payload, user);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return {
        id: user.id,
        email: user.email,
        username: user.username,
        member: {
          ...user.member,
        },
      };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
  async changePassword(
    authToken: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<any> {
    const payload = this.jwtService.verify(authToken);
    const user = await this.loginRepository.findOne({
      where: { email: payload.email },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const newHashedPassword = await bcrypt.hash(
      changePasswordDto.newPassword,
      10,
    );
    user.password = newHashedPassword;
    this.loginRepository.save(user);
    return user;
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
      // .toPromise();

      return response.data;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        error.response?.data,
        error.response?.status || 500,
      );
    }
  }
}
