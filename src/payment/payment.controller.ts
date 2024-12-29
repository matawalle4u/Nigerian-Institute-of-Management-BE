import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { PaymentService } from './payment.service';
import {
  PaymentHistoryDto,
  OutstandingPaymentDto,
} from './dto/payment-history.dto';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { createHmac } from 'crypto';
import { Response } from 'express';

interface PaystackEvent {
  event: string;
  data: {
    reference: string;
    status: string;
  };
}
@Controller('payment')
export class PaymentController {
  paystackWebhookSecret: any;
  constructor(private readonly paymentService: PaymentService) {}

  @Get('outstanding/:userId')
  async getOutstandingPayments(
    @Param('userId') userId: number,
  ): Promise<OutstandingPaymentDto[]> {
    const payments = await this.paymentService.getOutstandingPayments(userId);
    return payments.map((payment) => ({
      date: payment.createdAt,
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
      date: payment.createdAt,
      billName: payment.otherInfo || 'Unknown Bill',
      description: payment.status || 'No Status',
      amount: payment.amount,
    }));
  }

  @Post('initialize')
  async initializePayment(@Body() initiatePaymentDto: InitiatePaymentDto) {
    return this.paymentService.initiatePayment(initiatePaymentDto);
  }

  @Post('verify')
  async verifyPayment(@Body() verifyPaymentDto: VerifyPaymentDto) {
    return this.paymentService.verifyPayment(verifyPaymentDto.reference);
  }
  @Post('/webhook')
  async handlePaystackWebhook(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const secret = process.env.PAYSTACK_SECRET_KEY;

    // Verify the webhook signature
    const signature = req.headers['x-paystack-signature'] as string;
    const expectedSignature = createHmac('sha512', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      res.status(400).send('Invalid signature');
    }
    const event = req.body as unknown as PaystackEvent;
    //const event = req.body;

    // Process the event
    if (event.event === 'charge.success') {
      const paymentReference = event.data.reference;
      const paymentStatus = 'success'; // 'success'

      // Update the payment record in the database
      await this.paymentService.updatePaymentStatus(
        paymentReference,
        paymentStatus,
      );
    }

    res.status(200).send('Webhook received');
  }
}
