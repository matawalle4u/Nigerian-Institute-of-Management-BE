import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bill } from './entities/bill.entity';
import { CreateBillDto } from './dto/create-billing.dto';
import { CreateGeneralBillDto } from './dto/create-general-bill.dto';
import { Login } from 'src/account/entities/login.entity';
import { Ledger } from './entities/ledger.entity';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(Bill) private readonly billRepository: Repository<Bill>,
    @InjectRepository(Login) private readonly userRepository: Repository<Login>,
    @InjectRepository(Ledger) private readonly ledgerRepo: Repository<Ledger>,
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

  async createBillForAllUsers(generalBillDto: CreateGeneralBillDto) {
    const users = await this.userRepository.find();
    if (!users.length) {
      throw new BadRequestException('No users found');
    }

    const bills = users.map((user) =>
      this.billRepository.create({
        user,
        description: generalBillDto.description,
        amount: generalBillDto.amount,
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

  async getUserPaymentsSummary(userId: number): Promise<{
    entries: Ledger[];
    totalCreditNo: number;
    totalCreditYes: number;
    balance: number;
  }> {
    // Get sum of amounts where credit = 'no'
    const creditNoSum = await this.ledgerRepo
      .createQueryBuilder('ledger')
      .select('SUM(ledger.amount)', 'total')
      .where('ledger.payer_id = :userId', { userId })
      .andWhere("ledger.credit = 'no'")
      .getRawOne();

    // Get sum of amounts where credit = 'yes'
    const creditYesSum = await this.ledgerRepo
      .createQueryBuilder('ledger')
      .select('SUM(ledger.amount)', 'total')
      .where('ledger.payer_id = :userId', { userId })
      .andWhere("ledger.credit = 'yes'")
      .getRawOne();

    // Get all records for this user
    const entries = await this.ledgerRepo.find({ where: { payer_id: userId } });

    // Convert sums to numbers (if null, default to 0)
    const totalCreditNo = parseFloat(creditNoSum.total) || 0;
    const totalCreditYes = parseFloat(creditYesSum.total) || 0;

    // Calculate deduction
    const balance = totalCreditNo - totalCreditYes;

    return {
      entries,
      totalCreditNo,
      totalCreditYes,
      balance,
    };
  }
  private async simulatePayment() {
    // Mock payment processing logic
    return { success: true };
  }
}
