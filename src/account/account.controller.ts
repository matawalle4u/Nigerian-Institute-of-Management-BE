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
import { ValidateMembershipDto } from './dto/validate-membership.dto';
import { ApiBody } from '@nestjs/swagger';

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
    return { success: true, userId: user.id };
  }

  @Post('signup')
  @HttpCode(201)
  async createAccount(@Body() signupDto: SignupDto) {
    return this.accountService.createUser(signupDto);
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
