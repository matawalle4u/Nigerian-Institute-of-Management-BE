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
  Query,
  UseGuards,
  Put,
  Req,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { ValidateMembershipDto } from './dto/validate-membership.dto';
import { ApiBody, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import {
  RequestOtpDto,
  ResetPasswordDto,
  VerifyOtpDto,
} from './dto/request-otp';
import { PaginationDto } from 'src/general-dtos/pagination.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

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
  @Get('logins')
  async logins(@Query() paginationDto: PaginationDto) {
    return this.accountService.logins(paginationDto.page, paginationDto.limit);
  }
  @ApiBearerAuth()
  @Post('signup')
  @HttpCode(201)
  async signup(
    @Headers('Authorization') authToken: string,
    @Body() signupDto: SignupDto,
  ) {
    if (!authToken) {
      throw new HttpException(
        'Authorization token is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const { email, password } = signupDto;
    return this.accountService.signup(authToken, email, password);
  }

  @Post('request-otp')
  async requestOtp(@Body() dto: RequestOtpDto) {
    const { email } = dto;
    return this.accountService.requestOtp(email);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    const { email, otp } = dto;
    return this.accountService.verifyOtp(email, otp);
  }

  @Post('reset-password')
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @Headers('Authorization') authToken: string,
  ) {
    const { newPassword } = dto;
    return this.accountService.resetPassword(newPassword, authToken);
  }
  @Post('create-user')
  @HttpCode(201)
  async createAccount(@Body() createUserDto: CreateUserDto) {
    const { username, email, password } = createUserDto;
    return this.accountService.createUser(username, email, password);
  }

  @Post('login')
  @HttpCode(201)
  async login(@Body() signinDto: SigninDto) {
    const { email, password } = signinDto;
    return this.accountService.login(email, password);
  }

  @Get('fetch-info')
  async fetchUserInfo(@Headers('Authorization') authToken: string) {
    if (!authToken) {
      throw new HttpException(
        'Authorization token is required',
        HttpStatus.BAD_REQUEST,
      );
    }

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

    const token = authToken.startsWith('Bearer ')
      ? authToken.slice(7)
      : authToken;

    const { newPassword } = changePasswordDto;
    const user = await this.accountService.changePassword(token, newPassword);

    return {
      success: true,
      message: 'Password changed successfully',
      data: user,
    };
  }

  @Put('profile/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update member profile using loginId' })
  async updateProfile(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const login_id = Number(id);
    return await this.accountService.updateProfile(login_id, updateProfileDto);
  }

  @Post('verify-nin/:nin')
  async verifyNIN(@Param('nin') nin: string) {
    return this.accountService.verifyNIN(nin);
  }
}
