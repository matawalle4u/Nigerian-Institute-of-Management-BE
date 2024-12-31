import { HttpException, HttpStatus } from '@nestjs/common';

export class LicenseException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.PAYMENT_REQUIRED);
  }
}
