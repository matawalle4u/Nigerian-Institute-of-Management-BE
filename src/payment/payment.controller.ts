import { Controller, Get, Param } from '@nestjs/common';
import { PaymentService } from './payment.service';
import {
  PaymentHistoryDto,
  OutstandingPaymentDto,
} from './dto/payment-history.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('outstanding/:userId')
  async getOutstandingPayments(
    @Param('userId') userId: number,
  ): Promise<OutstandingPaymentDto[]> {
    const payments = await this.paymentService.getOutstandingPayments(userId);
    return payments.map((payment) => ({
      date: payment.date,
      billName: payment.otherInfo || 'Unknown Bill',
      amount: payment.amount,
    }));
  }

  @Get('history/:userId')
  async getPaymentHistory(
    @Param('userId') userId: number,
  ): Promise<PaymentHistoryDto[]> {
    const payments = await this.paymentService.getPaymentHistory(userId);
    return payments.map((payment) => ({
      date: payment.date,
      billName: payment.otherInfo || 'Unknown Bill',
      description: payment.status || 'No Status',
      amount: payment.amount,
    }));
  }
}
