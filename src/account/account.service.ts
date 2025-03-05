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
import { Members } from 'src/membership/entities/membership.entity';
import axios from 'axios';
import { Otp } from './entities/otp.entity';
import { MailerService as EmailService } from 'src/mailer/mailer.service';
// import { error } from 'console';

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

  async createUser(
    username: string,
    email: string,
    password: string,
  ): Promise<Login> {
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

  logins(page, limit): Promise<{ data: Login[]; total: number }> {
    return this.loginRepository
      .findAndCount({
        relations: ['member'],
        select: {
          id: true,
          email: true,
          member: {
            first_name: true,
            last_name: true,
          },
          date: true,
        },
        skip: (page - 1) * limit,
        take: limit,
      })
      .then(([data, total]) => {
        if (!data.length) {
          throw new NotFoundException('No user login');
        }
        return { data, total };
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  signup(token: string, email: string, password: string): Promise<any> {
    return (
      Promise.resolve()
        // Step 1: Verify JWT token
        .then(() => this.jwtService.verify(token))
        .catch((error) => {
          throw new UnauthorizedException('Invalid token: ' + error.message);
        })

        // Step 2: Check if user is already registered with this token
        .then((payload) => {
          return this.loginRepository
            .findOne({
              where: { member: { member_no: payload.memberNo } },
            })
            .then((registeredUser) => {
              if (registeredUser) {
                throw new NotFoundException(
                  'A user already registered with the provided token',
                );
              }
              return payload;
            });
        })

        // Step 3: Find the member
        .then((payload) => {
          return this.memberRepository
            .findOne({
              where: { id: payload.memberId },
            })
            .then((member) => {
              if (!member) {
                throw new UnauthorizedException(
                  'Invalid token: member not found',
                );
              }
              return { member, memberNo: payload.memberNo };
            });
        })

        // Step 4: Hash password and create login record
        .then(({ member, memberNo }) => {
          return bcrypt.hash(password, 10).then((hashedPassword) => {
            const login = new Login();
            login.member = member;
            login.password = hashedPassword;
            login.username = memberNo;
            login.email = email;

            return this.loginRepository
              .save(login)
              .then((savedLogin) => ({ member, savedLogin }))
              .catch(() => {
                throw new InternalServerErrorException(
                  'Failed to save login details',
                );
              });
          });
        })

        // Step 5: Update member with login reference
        .then(({ member, savedLogin }) => {
          member.login_id = savedLogin;

          return this.memberRepository
            .save(member)
            .then(() => savedLogin)
            .catch(() => {
              throw new InternalServerErrorException('Failed to save member');
            });
        })

        // Step 6: Generate access token and prepare response
        .then((savedLogin) => {
          return Promise.resolve(
            this.jwtService.sign({
              sub: savedLogin.id,
              email: savedLogin.email,
            }),
          )
            .then((accessToken) => {
              const member = savedLogin.member;
              return {
                accessToken,
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
            })
            .catch((error) => {
              throw new InternalServerErrorException(
                'Failed to generate token: ' + error.message,
              );
            });
        })
    );
  }

  requestOtp(email: string): Promise<string> {
    return this.loginRepository
      .findOne({
        where: { email },
      })
      .then((user) => {
        if (!user)
          throw new BadRequestException('User with this email does not exist.');
        const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
        const otp = this.otpRepository.create({ user, otp: otpCode });
        return this.otpRepository
          .save(otp)
          .then(() => {
            const template_path = process.cwd() + '/templates/';
            this.mailerService.sendEmail(
              email,
              'Password Reset',
              `Your OTP is ${otpCode}`,
              `${template_path}/MAILER_TEMPLATE`,
            );
            console.log(`Your OTP is ${otpCode}`);
            return 'OTP sent to email.';
          })
          .catch((error) => {
            throw new Error(error);
          });
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  verifyOtp(
    email: string,
    otp: string,
  ): Promise<{ accessToken: string; user: Login }> {
    return this.loginRepository
      .findOne({
        where: { email },
      })
      .then((user) => {
        if (!user) {
          throw new BadRequestException('User with this email does not exist.');
        }

        return this.otpRepository
          .createQueryBuilder('otp')
          .where('otp.userId = :userId', { userId: user.id })
          .andWhere('otp.otp = :otp', { otp: otp })
          .andWhere('otp.verified = :verified', { verified: 0 })
          .getOne()
          .then((user_otp) => {
            if (!user_otp)
              throw new BadRequestException('Invalid or expired OTP.');

            user_otp.verified = true;
            return this.otpRepository.save(user_otp).then(() => {
              const accessToken = this.jwtService.sign({ email: email });
              user.reset_token = accessToken;
              return this.loginRepository.save(user).then(() => {
                return {
                  accessToken,
                  user,
                };
              });
            });
          });
      });
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

  updateProfile(
    loginId: number,
    updateData: Partial<Members>,
  ): Promise<Members> {
    console.log('Getting the ID ', loginId);
    console.log('update Data', updateData);
    return this.memberRepository
      .findOne({ where: { login_id: { id: loginId } } })
      .then((member) => {
        console.log('logging=>', member);
        if (!member) {
          throw new Error('Member not found');
        }
        Object.assign(member, updateData);
        return this.memberRepository.save(member);
      })
      .then((updatedMember) => {
        return updatedMember;
      })
      .catch((err) => {
        throw new Error(`Failed to update member ${err}`);
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
