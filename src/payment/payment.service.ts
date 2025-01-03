// src/payment/payment.service.ts

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Login } from '../account/entities/login.entity';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { PaystackResponse, PaymentData } from './dto/paystack.dto';
import axios from 'axios';
import { AxiosResponse } from '../types/axios-response.type';
import { License } from 'src/license/entities/license.entity';
import { PaymentProviderFactory } from './providers/payment-provider.factory';
@Injectable()
export class PaymentService {
  private readonly paystackBaseUrl = 'https://api.paystack.co';
  private readonly paystackSecretKey = process.env.PAYSTACK_SECRET_KEY_TEST;
  //private readonly paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

  /**
   * Initialize a payment
   * @param initiatePaymentDto
   * @returns Paystack payment initialization response
   */

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Login)
    private userRepository: Repository<Login>,
    @InjectRepository(License)
    private licenceRepository: Repository<License>,
    private readonly paymentFactory: PaymentProviderFactory,
  ) {}

  async getOutstandingPayments(userId: number): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { payers: { id: userId }, status: null },
      relations: ['payers'],
      select: ['createdAt', 'otherInfo', 'amount'],
    });
  }
  async getPaymentHistory(userId: number): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { payers: { id: userId } },
      relations: ['payers'],
      select: ['createdAt', 'otherInfo', 'amount', 'status'],
    });
  }

  async getMemberOutstandingPayments(
    userId: number,
  ): Promise<{ year: number; description: string; amount: number }[]> {
    const currentYear = new Date().getFullYear();
    const baseYear = 2024;
    const requiredDescription = 'License';
    const requiredAmount = 10000;

    const yearsToCheck = Array.from(
      { length: currentYear - baseYear + 1 },
      (_, i) => baseYear + i,
    );
    const outstandingYears = [];

    for (const year of yearsToCheck) {
      const paymentExists = await this.paymentRepository.findOne({
        where: {
          payers: { id: userId },
          otherInfo: requiredDescription,
          createdAt: Between(
            new Date(`${year}-01-01`),
            new Date(`${year}-12-31`),
          ),
        },
        relations: ['payers'],
      });

      if (!paymentExists) {
        outstandingYears.push({
          year,
          description: requiredDescription,
          amount: requiredAmount,
        });
      }
    }

    return outstandingYears;
  }

  async initiatePayment(
    provider: 'paystack' | 'interswitch',
    initiatePaymentDto: InitiatePaymentDto,
  ): Promise<any> {
    const paymentProvider = this.paymentFactory.getProvider(provider);
    return paymentProvider.initializePayment(initiatePaymentDto);
    // const callbackUrl = `${process.env.APP_BASE_URL}/payment/verify`;
    // const payload = {
    //   ...initiatePaymentDto,
    //   callback_url: callbackUrl,
    // };
    // const response: AxiosResponse<PaystackResponse<PaymentData>> =
    //   await axios.post(
    //     `${this.paystackBaseUrl}/transaction/initialize`,
    //     payload,
    //     {
    //       headers: {
    //         Authorization: `Bearer ${this.paystackSecretKey}`,
    //       },
    //     },
    //   );

    // if (!response.data.status) {
    //   throw new Error(response.data.message);
    // }

    // const paymentData = response.data.data;

    // // Find the user based on the email address
    // const loginUser = await this.userRepository.findOne({
    //   where: { email: initiatePaymentDto.email },
    // });
    // if (!loginUser) {
    //   throw new Error('User not found');
    // }

    // // Create a new payment record
    // console.log(paymentData);

    // const payment = this.paymentRepository.create({
    //   paymentId: paymentData.reference,
    //   payers: { id: loginUser.id },
    //   amount: initiatePaymentDto.amount,
    //   status: null,
    //   otherInfo: initiatePaymentDto.description || null,
    // });

    // // Try to save the payment record
    // try {
    //   console.log(payment);
    //   await this.paymentRepository.save(payment);
    // } catch (error) {
    //   // Log the error for debugging and tracking
    //   console.error('Error saving payment to database:', error);
    //   // Notify or retry logic (optional)
    //   // Example: Notify admin via email, push notification, etc.

    //   // Re-throw the error if necessary
    //   throw new Error(
    //     'Payment was initiated but failed to save in the database. Please contact support.',
    //   );
    // }

    // // Return the payment data
    // return paymentData;

    //return response.data.data;
  }
  /**
   * Verify a payment
   * @param reference
   * @returns Paystack payment verification response
   */
  async verifyPayment(reference: string): Promise<PaymentData> {
    try {
      const response: AxiosResponse<PaystackResponse<PaymentData>> =
        await axios.get(
          `${this.paystackBaseUrl}/transaction/verify/${reference}`,
          {
            headers: {
              Authorization: `Bearer ${this.paystackSecretKey}`,
            },
          },
        );

      if (!response.data.status) {
        throw new HttpException(
          response.data.message || 'Payment verification failed',
          HttpStatus.BAD_REQUEST,
        );
      }

      return response.data.data; // Return the verified payment data
    } catch (error) {
      throw new HttpException(
        error.response?.data?.message || 'Error verifying payment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updatePaymentStatus(
    reference: string,
    status: 'success' | 'fail',
  ): Promise<void> {
    const payment = await this.paymentRepository.findOne({
      where: { paymentId: reference },
      relations: ['payers'],
    });

    console.log('Payment record:', payment);
    if (!payment) {
      throw new Error('Payment not found');
    }

    payment.status = status;
    if (payment.otherInfo === 'License' && payment.status === 'success') {
      const licenceRecord = this.licenceRepository.create({
        licenseNo: reference,
        login: payment.payers,
      });
      await this.licenceRepository.save(licenceRecord);
    }

    await this.paymentRepository.save(payment);
  }
}
