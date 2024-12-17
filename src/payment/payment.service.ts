// src/payment/payment.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Login } from '../account/entities/login.entity';

@Injectable()
export class PaymentService {
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
}
