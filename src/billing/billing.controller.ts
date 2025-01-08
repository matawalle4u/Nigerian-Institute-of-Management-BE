// src/billing/billing.controller.ts
import { Controller, Post, Body, Param } from '@nestjs/common';
import { BillingService } from './billing.service';
import { CreateBillDto } from './dto/create-billing.dto';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('create/single')
  async createBillForUser(@Body() dto: CreateBillDto) {
    return this.billingService.createBillForUser(dto);
  }

  @Post('create/all')
  async createBillForAllUsers(
    @Body() { description, amount }: { description: string; amount: number },
  ) {
    return this.billingService.createBillForAllUsers(description, amount);
  }

  @Post('pay/:userId/:billId')
  async processPayment(
    @Param('userId') userId: string,
    @Param('billId') billId: string,
    @Body() paymentData: any,
  ) {
    return this.billingService.processPayment(userId, billId, paymentData);
  }
}
