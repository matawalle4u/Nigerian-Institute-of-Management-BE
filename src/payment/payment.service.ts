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
import { Bill } from 'src/billing/entities/bill.entity';
import { PaystackProvider } from './providers/paystack.provider';
import { InterswitchProvider } from './providers/interswitch.provider';
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
    @InjectRepository(Bill)
    private billRepository: Repository<Bill>,

    private readonly paystackProvider: PaystackProvider,
    private readonly interswitchProvider: InterswitchProvider,
  ) {}

  async initiatePayment(
    provider: 'paystack' | 'interswitch',
    initiatePaymentDto: InitiatePaymentDto,
  ): Promise<any> {
    switch (provider) {
      case 'paystack':
        return this.paystackProvider.initializePayment(initiatePaymentDto);
      case 'interswitch':
        return this.interswitchProvider.initializePayment(initiatePaymentDto);
      default:
        throw new Error('Invalid payment provider');
    }
  }
  async interSwitchAuth(): Promise<any> {
    return this.interswitchProvider.authenticate();
  }
  async getOutstandingPayments(userId: number): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { payers: { id: userId }, status: null },
      relations: ['payers'],
      select: ['date', 'other_info', 'amount'],
    });
  }
  async getMemberUnpaidBills(userId: number) {
    return this.billRepository.find({
      where: { user: { id: userId }, paid: false },
    });
  }
  async getPaymentHistory(userId: number): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { payers: { id: userId } },
      relations: ['payers'],
      select: ['date', 'other_info', 'amount', 'status'],
    });
  }

  async getMemberOutstandingPayments(
    userId: number,
  ): Promise<{ year: number; description: string; amount: number }[]> {
    const currentYear = new Date().getFullYear();
    const baseYear = 2025;
    const requiredDescription = 'License';
    const requiredAmount = 10000;
    const kwanan_wata = new Date();

    const yearsToCheck = Array.from(
      { length: currentYear - baseYear + 1 },
      (_, i) => baseYear + i,
    );
    console.log('ggggg', yearsToCheck[0]);
    const outstandingYears = [];

    for (const year of yearsToCheck) {
      const paymentExists = await this.paymentRepository.findOne({
        where: {
          payers: { id: userId },
          other_info: requiredDescription,
          date: Between(new Date(`${year}-01-01`), new Date(`${year}-12-31`)),
        },
        relations: ['payers'],
      });
      if (!paymentExists) {
        const outstanding = {
          year,
          description: requiredDescription,
          amount: requiredAmount,
          date: kwanan_wata,
        };
        outstandingYears.push(outstanding);
      }
    }

    return outstandingYears;
  }

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
      where: { payment_id: reference },
      relations: ['payers'],
    });

    console.log('Payment record:', payment);
    if (!payment) {
      throw new Error('Payment not found');
    }

    payment.status = status;
    if (payment.other_info === 'License' && payment.status === 'success') {
      // const licenceRecord = this.licenceRepository.create({
      //   license_no: reference,
      //   login: payment.payers,
      // });
      //await this.licenceRepository.save(licenceRecord);
      //TODO SMELLED RAT HERE TOOOOOO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      await Promise;
    }

    await this.paymentRepository.save(payment);
  }

  async getAll() {
    return this.paymentRepository.find();
  }
}
