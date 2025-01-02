import {
  Controller,
  Post,
  Body,
  HttpCode,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { ValidateMembershipDto } from './dto/validate-membership.dto';
import { ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';

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

  @ApiBearerAuth()
  @Post('signup')
  @HttpCode(201)
  async signup(
    @Headers('Authorization') authToken: string,
    @Body() signupDto: SignupDto,
  ) {
    console.log(authToken);
    if (!authToken) {
      throw new HttpException(
        'Authorization token is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    console.log(authToken);
    return this.accountService.signup(authToken, signupDto);
  }

  @Post('create-user')
  @HttpCode(201)
  async createAccount(@Body() createUserDto: CreateUserDto) {
    return this.accountService.createUser(createUserDto);
  }

  @Post('login')
  @HttpCode(201)
  async login(@Body() signinDto: SigninDto) {
    return this.accountService.login(signinDto);
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
    //const userId = stringify(this.accountService.decodeToken(token));

    const user = await this.accountService.changePassword(
      token,
      changePasswordDto,
    );

    return {
      success: true,
      message: 'Password changed successfully',
      data: user,
    };
  }
  @Post('verify-nin/:nin')
  async verifyNIN(@Param('nin') nin: string) {
    return this.accountService.verifyNIN(nin);
  }
}
