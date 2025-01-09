// src/billing/billing.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bill } from './entities/bill.entity';
import { CreateBillDto } from './dto/create-billing.dto';
import { Login } from 'src/account/entities/login.entity';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(Bill) private readonly billRepository: Repository<Bill>,
    @InjectRepository(Login) private readonly userRepository: Repository<Login>,
  ) {}

  async createBillForUser(dto: CreateBillDto) {
    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const bill = this.billRepository.create({
      user,
      description: dto.description,
      amount: dto.amount,
    });
    return this.billRepository.save(bill);
  }

  async createBillForAllUsers(description: string, amount: number) {
    const users = await this.userRepository.find();
    if (!users.length) {
      throw new BadRequestException('No users found');
    }

    const bills = users.map((user) =>
      this.billRepository.create({
        user,
        description,
        amount,
      }),
    );

    return this.billRepository.save(bills);
  }

  async getAll() {
    const bills = await this.billRepository.find();
    return bills;
  }
  async processPayment(billId: string) {
    const bill = await this.billRepository.findOne({ where: { id: billId } });
    if (!bill) {
      throw new BadRequestException('Bill not found');
    }

    if (bill.paid) {
      throw new BadRequestException('Bill is already paid');
    }

    // Simulate payment processing
    const paymentResult = await this.simulatePayment();

    if (paymentResult.success) {
      bill.paid = true;
      bill.paidAt = new Date();
      return this.billRepository.save(bill);
    }

    throw new BadRequestException('Payment failed');
  }

  private async simulatePayment() {
    // Mock payment processing logic
    return { success: true };
  }
}
