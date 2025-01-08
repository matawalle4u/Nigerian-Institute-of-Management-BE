// src/billing/billing.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateBillDto } from './dto/create-billing.dto';

@Injectable()
export class BillingService {
  // Simulate a database
  private users = [
    { id: 'user1', name: 'Alice' },
    { id: 'user2', name: 'Bob' },
  ];

  private bills = []; // Store generated bills

  async createBillForUser(dto: CreateBillDto) {
    const user = this.users.find((u) => u.id === dto.userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const bill = {
      ...dto,
      createdAt: new Date(),
      paid: false,
    };
    this.bills.push(bill);
    return bill;
  }

  async createBillForAllUsers(description: string, amount: number) {
    const createdBills = [];
    for (const user of this.users) {
      const dto = { userId: user.id, description, amount };
      const bill = await this.createBillForUser(dto);
      createdBills.push(bill);
    }
    return createdBills;
  }

  async processPayment(userId: string, billId: string, paymentData: any) {
    const bill = this.bills.find((b) => b.userId === userId && b.id === billId);
    if (!bill) {
      throw new BadRequestException('Bill not found');
    }

    // Simulate payment processing
    const paymentResult = await this.simulatePayment(paymentData);

    if (paymentResult.success) {
      bill.paid = true;
      bill.paidAt = new Date();
      return { message: 'Payment successful', bill };
    }

    throw new BadRequestException('Payment failed');
  }

  private async simulatePayment(paymentData: any) {
    // Mock payment processing logic
    return { success: true, transactionId: '12345' };
  }
}
