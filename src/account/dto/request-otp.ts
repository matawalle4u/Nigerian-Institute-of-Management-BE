import { ApiProperty } from '@nestjs/swagger';

export class RequestOtpDto {
  @ApiProperty({
    description: 'email',
    example: 'adam.mustapha@byteflow.com.ng',
  })
  email: string;
}

export class VerifyOtpDto {
  @ApiProperty({
    description: 'email',
    example: 'adam.mustapha@byteflow.com.ng',
  })
  email: string;
  @ApiProperty({
    description: 'OTP',
    example: '1234',
  })
  otp: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'email',
    example: 'adam.mustapha@byteflow.com.ng',
  })
  email: string;

  @ApiProperty({
    description: 'New password',
    example: 'Password1234',
  })
  newPassword: string;
}
