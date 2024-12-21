// src/payment/payment.service.ts

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Login } from '../account/entities/login.entity';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { PaystackResponse, PaymentData } from './dto/paystack.dto';
import axios from 'axios';

@Injectable()
export class PaymentService {
  private readonly paystackBaseUrl = 'https://api.paystack.co';
  private readonly paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

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
  ) {}

  async getOutstandingPayments(userId: number): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { payers: userId, status: null },
      select: ['date', 'otherInfo', 'amount'],
    });
  }
  async getPaymentHistory(userId: number): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { payers: userId },
      select: ['date', 'otherInfo', 'amount', 'status'],
    });
  }

  async initiatePayment(
    initiatePaymentDto: InitiatePaymentDto,
  ): Promise<PaymentData> {
    const { data } = await axios.post(
      `${this.paystackBaseUrl}/transaction/initialize`,
      initiatePaymentDto,
      {
        headers: {
          Authorization: `Bearer ${this.paystackSecretKey}`,
        },
      },
    );

    if (!data.status) {
      throw new Error(data.message);
    }

    return data.data;
  }
  /**
   * Verify a payment
   * @param reference
   * @returns Paystack payment verification response
   */
  async verifyPayment(reference: string): Promise<PaymentData> {
    try {
      const { data } = await axios.get(
        `${this.paystackBaseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
          },
        },
      );

      if (!data.status) {
        throw new HttpException(
          data.message || 'Payment verification failed',
          HttpStatus.BAD_REQUEST,
        );
      }

      return data.data; // Return the verified payment data
    } catch (error) {
      throw new HttpException(
        error.response?.data?.message || 'Error verifying payment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
