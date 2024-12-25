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
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { ValidateMembershipDto } from './dto/validate-membership.dto';
import { ApiBody } from '@nestjs/swagger';
import { ChangePasswordDto } from './dto/change-password.dto';
import { stringify } from 'querystring';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('validate')
  @ApiBody({ type: ValidateMembershipDto })
  async validateMembership(
    @Body() validateMembershipDto: ValidateMembershipDto,
  ) {
    const user = await this.accountService.validateMembership(
      validateMembershipDto.membership,
      validateMembershipDto.nameOrDob,
    );
    return user;
  }

  @Post('signup')
  @HttpCode(201)
  async createAccount(@Body() signupDto: SignupDto) {
    return this.accountService.createUser(signupDto);
  }

  @Post('login')
  @HttpCode(201)
  async login(@Body() signinDto: SigninDto) {
    return this.accountService.login(signinDto.email, signinDto.password);
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
  @Post('change-password')
  async changePassword(
    @Headers('Authorization') authToken: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
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

    // Extract user ID from token
    const userId = stringify(this.accountService.decodeToken(token));

    await this.accountService.changePassword(changePasswordDto, userId);

    return { success: true, message: 'Password changed successfully' };
  }
}
