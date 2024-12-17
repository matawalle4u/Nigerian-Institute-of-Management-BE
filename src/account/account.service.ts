import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Login } from './entities/login.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as moment from 'moment';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Login)
    private readonly loginRepository: Repository<Login>,
    private readonly jwtService: JwtService,
  ) {}

  async validateMembership(
    membership: string,
    nameOrDob: string,
  ): Promise<Login> {
    const user = await this.loginRepository.findOne({
      where: [{ username: membership }, { email: membership }],
    });

    if (
      !user ||
      !(
        user.username === nameOrDob ||
        moment(user.date).format('YYYY-MM-DD') === nameOrDob
      )
    ) {
      throw new UnauthorizedException('Invalid membership or personal details');
    }
    return user;
  }

  async createAccount(email: string, password: string, userId: number) {
    const hashedPassword = await bcrypt.hash(password, 10);

    await this.loginRepository.update(userId, {
      email,
      password: hashedPassword,
    });

    const user = await this.loginRepository.findOne({ where: { id: userId } });
    const payload = {
      id: user.id,
      email: user.email,
      authority: user.authority,
    };

    return {
      token: this.jwtService.sign(payload),
    };
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
