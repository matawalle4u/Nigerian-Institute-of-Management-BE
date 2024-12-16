import {
  Controller,
  Post,
  Body,
  HttpCode,
  Get,
  Headers,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AccountService } from './account.service';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('validate')
  async validateMembership(
    @Body() body: { membership: string; nameOrDob: string },
  ) {
    const user = await this.accountService.validateMembership(
      body.membership,
      body.nameOrDob,
    );
    return { success: true, userId: user.id };
  }

  @Post('signup')
  @HttpCode(201)
  async createAccount(
    @Body() body: { userId: number; email: string; password: string },
  ) {
    return this.accountService.createAccount(
      body.email,
      body.password,
      body.userId,
    );
  }

  @Get('fetch-info')
  async fetchUserInfo(@Headers('Authorization') authToken: string) {
    if (!authToken) {
      throw new HttpException(
        'Authorization token is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Strip "Bearer " prefix if it exists
    const token = authToken.startsWith('Bearer ')
      ? authToken.slice(7)
      : authToken;

    const userInfo = await this.accountService.fetchUserInfo(token);
    return {
      success: true,
      data: userInfo,
    };
  }
}
