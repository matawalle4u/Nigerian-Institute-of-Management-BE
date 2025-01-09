import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentHistoryDto } from './dto/payment-history.dto';
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
  ): Promise<any[]> {
    const payments = await this.paymentService.getMemberUnpaidBills(userId);
    return payments;
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
  async initializePayment(
    @Query('provider') provider: 'paystack' | 'interswitch',
    @Body() initiatePaymentDto: InitiatePaymentDto,
  ) {
    return this.paymentService.initiatePayment(provider, initiatePaymentDto);
  }

  @Post('verify')
  async verifyPayment(@Body() verifyPaymentDto: VerifyPaymentDto) {
    const paymentData = this.paymentService.verifyPayment(
      verifyPaymentDto.reference,
    );
    return {
      message: 'Payment verified successfully',
      payment: paymentData,
    };
  }
  @Get('callback')
  async handleCallback(
    @Query('reference') reference: string,
    @Res() res: Response,
  ) {
    try {
      const paymentData = await this.paymentService.verifyPayment(reference);
      // Redirect to a success or failure page based on the payment status
      if (paymentData.status === 'success') {
        return res.redirect(`${process.env.APP_BASE_URL}/payment/success`);
      } else {
        return res.redirect(`${process.env.APP_BASE_URL}/payment/failure`);
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      return res.redirect(`${process.env.APP_BASE_URL}/payment/failure`);
    }
  }
  @Post('/webhook')
  async handlePaystackWebhook(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const secret = process.env.PAYSTACK_SECRET_KEY_TEST;

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
      const paymentStatus = event.data.status;

      // Update the payment record in the database
      if (paymentStatus === 'success' || paymentStatus === 'fail') {
        await this.paymentService.updatePaymentStatus(
          paymentReference,
          paymentStatus,
        );
      } else {
        console.warn(`Unexpected payment status: ${paymentStatus}`);
      }
    }

    res.status(200).send('Webhook received');
  }
}
