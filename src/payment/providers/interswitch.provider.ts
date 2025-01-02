import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PaymentProvider } from '../interfaces/payment-provider.interface';
import { InitiatePaymentDto } from '../dto/initiate-payment.dto';

@Injectable()
export class InterswitchProvider implements PaymentProvider {
  private readonly interswitchBaseUrl = process.env.INTERSWITCH_URL;
  private readonly interswitchSecretKey = process.env.INTERSWITCH_SECRET_KEY;

  async initializePayment(
    initiatePaymentDto: InitiatePaymentDto,
  ): Promise<any> {
    const response = await axios.post(
      `${this.interswitchBaseUrl}`,
      //   { amount, email, description },
      initiatePaymentDto,
      {
        headers: { Authorization: `Bearer ${this.interswitchSecretKey}` },
      },
    );
    return response.data;
  }

  async verifyPayment(reference: string): Promise<any> {
    const response = await axios.get(
      `${this.interswitchBaseUrl}/transactions/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${this.interswitchSecretKey}` },
      },
    );
    return response.data;
  }

  async handleWebhook(data: any): Promise<void> {
    // Handle Interswitch webhook logic here
    console.log(data);
  }
}
