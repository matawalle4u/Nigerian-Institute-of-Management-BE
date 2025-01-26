import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';
import { PaymentProvider } from '../interfaces/payment-provider.interface';
import { InitiatePaymentDto } from '../dto/initiate-payment.dto';
import { PaystackResponse, PaymentData } from '../dto/paystack.dto';
import { Payment } from '../entities/payment.entity';
import { Login } from 'src/account/entities/login.entity';
import { AxiosResponse } from 'src/types/axios-response.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PaystackProvider implements PaymentProvider {
  private readonly paystackBaseUrl = 'https://api.paystack.co';
  private readonly paystackSecretKey = process.env.PAYSTACK_SECRET_KEY_TEST;

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Login)
    private userRepository: Repository<Login>,
  ) {}

  async initializePayment(
    initiatePaymentDto: InitiatePaymentDto,
  ): Promise<PaymentData> {
    const paymentPayload = {
      ...initiatePaymentDto,
      amount: initiatePaymentDto.amount * 100,
    };

    const response: AxiosResponse<PaystackResponse<PaymentData>> =
      await axios.post(
        `${this.paystackBaseUrl}/transaction/initialize`,
        paymentPayload,
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
          },
        },
      );
    if (!response.data.status) {
      throw new Error(response.data.message);
    }

    const paymentData = response.data.data;

    // Find the user based on the email address
    const loginUser = await this.userRepository.findOne({
      where: { email: initiatePaymentDto.email },
    });
    if (!loginUser) {
      throw new Error('User not found');
    }

    // Create a new payment record
    console.log(paymentData);
    const payment = this.paymentRepository.create({
      paymentId: paymentData.reference,
      payers: { id: loginUser.id },
      amount: initiatePaymentDto.amount,
      status: null,
      otherInfo: initiatePaymentDto.description || null,
    });

    try {
      await this.paymentRepository.save(payment);
    } catch (error) {
      // Log the error for debugging and tracking
      console.error('Error saving payment to database:', error);
      throw new Error(
        'Payment was initiated but failed to save in the database. Please contact support.',
      );
    }
    return paymentData;
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

  async handleWebhook(): Promise<void> {
    // Handle Paystack webhook logic here
    console.log('done');
  }
}
