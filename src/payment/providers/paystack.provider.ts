// src/payment/providers/paystack.provider.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PaymentProvider } from '../interfaces/payment-provider.interface';
import { InitiatePaymentDto } from '../dto/initiate-payment.dto';

@Injectable()
export class PaystackProvider implements PaymentProvider {
  private readonly paystackBaseUrl = 'https://api.paystack.co';
  private readonly paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

  async initializePayment(
    initiatePaymentDto: InitiatePaymentDto,
  ): Promise<any> {
    const paymentData = {
      ...initiatePaymentDto,
      amount: initiatePaymentDto.amount * 100,
    };
    const response = await axios.post(
      `${this.paystackBaseUrl}/transaction/initialize`,
      paymentData,
      {
        headers: { Authorization: `Bearer ${this.paystackSecretKey}` },
      },
    );
    return response.data;
  }

  async verifyPayment(reference: string): Promise<any> {
    const response = await axios.get(
      `${this.paystackBaseUrl}/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${this.paystackSecretKey}` },
      },
    );
    return response.data;
  }

  async handleWebhook(data: any): Promise<void> {
    // Handle Paystack webhook logic here
    console.log(data);
  }
}
