export class RequestOtpDto {
  email: string;
}

export class VerifyOtpDto {
  email: string;
  otp: string;
}

export class ResetPasswordDto {
  email: string;
  newPassword: string;
}
