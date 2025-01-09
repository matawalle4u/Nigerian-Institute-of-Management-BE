import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { BillingService } from './billing.service';
import { CreateBillDto } from './dto/create-billing.dto';
import { CreateGeneralBillDto } from './dto/create-general-bill.dto';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('create/single')
  async createBillForUser(@Body() dto: CreateBillDto) {
    return this.billingService.createBillForUser(dto);
  }

  @Post('create/all')
  async createBillForAllUsers(@Body() generalBillDto: CreateGeneralBillDto) {
    return this.billingService.createBillForAllUsers(generalBillDto);
  }

  @Post('pay/:billId')
  async processPayment(@Param('billId') billId: string) {
    return this.billingService.processPayment(billId);
  }

  @Get('all')
  async getAll() {
    return this.billingService.getAll();
  }
}
