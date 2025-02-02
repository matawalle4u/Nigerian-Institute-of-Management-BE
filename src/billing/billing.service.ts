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

// +---------+----------+---------------------------------+----------+-------+------+--------+------+---------------------+------+----------------------------+
// | id      | payer_id | description                     | amount   | debit | paid | credit | fee  | date                | year | updatedAt                  |
// +---------+----------+---------------------------------+----------+-------+------+--------+------+---------------------+------+----------------------------+
// | 4651990 |   201332 | Branch Levy                     |  1000.00 | yes   | yes  | no     |   17 | 2023-01-10 13:17:53 | 2023 | 2025-02-02 13:35:58.403950 |
// | 4651991 |   201332 | Annual Subscription Member      | 20000.00 | yes   | yes  | no     |   19 | 2023-01-10 13:18:10 | 2023 | 2025-02-02 13:35:58.403950 |
// | 4654838 |   201332 | Branch Levy PAID                |  1000.00 | no    | no   | yes    |   17 | 2023-09-13 08:46:08 |    0 | 2025-02-02 13:36:44.039944 |
// | 4654839 |   201332 | Annual Subscription Member PAID | 20000.00 | no    | no   | yes    |   19 | 2023-09-13 08:46:08 |    0 | 2025-02-02 13:36:44.039944 |
// | 4840496 |   201332 | Branch Levy                     |  1000.00 | yes   | no   | no     |   17 | 2024-01-06 12:07:54 | 2024 | 2025-02-02 13:53:54.785841 |
// | 5019519 |   201332 | Annual Subscription Member      | 20000.00 | yes   | no   | no     |   19 | 2024-01-06 12:21:28 | 2024 | 2025-02-02 14:08:21.315299 |
// | 5207777 |   201332 | Branch Levy                     |  1000.00 | yes   | no   | no     |   17 | 2025-01-03 19:47:10 | 2025 | 2025-02-02 14:26:47.184923 |
// | 5385974 |   201332 | Annual Subscription Member      | 20000.00 | yes   | no   | no     |   19 | 2025-01-03 20:00:59 | 2025 | 2025-02-02 14:47:49.682573 |
// +---------+----------+---------------------------------+----------+-------+------+--------+------+---------------------+------+----------------------------+
