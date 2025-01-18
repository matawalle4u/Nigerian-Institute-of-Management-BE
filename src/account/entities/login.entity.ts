import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Members } from 'src/membership/entities/membership.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { Bill } from 'src/billing/entities/bill.entity';
import { Otp } from './otp.entity';
import { Exclude } from 'class-transformer';

@Entity('login')
export class Login {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;
  @Column({ length: 32 })
  username: string;
  @Column({ length: 64, nullable: false, unique: true })
  email: string;
  @Exclude()
  @Column({ length: 128 }) // Password should not be selected by default
  password: string;
  @Column({ type: 'enum', enum: ['no', 'yes'], default: 'no' })
  default_password: 'no' | 'yes';
  @Column({
    type: 'enum',
    enum: ['admin', 'member', 'viewer', 'updater', 'logger'],
    default: 'member',
  })
  authority: 'admin' | 'member' | 'viewer' | 'updater' | 'logger';
  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: 'active' | 'inactive';
  @Column({ nullable: true, length: 512 })
  reset_token: string | null;
  @Column({ nullable: true, length: 512 })
  activation_token: string | null;
  @CreateDateColumn()
  date: Date;
  @OneToOne(() => Members, (member) => member.loginId, { cascade: true })
  member: Members;
  @OneToMany(() => Payment, (payment) => payment.payers)
  payments: Payment[];

  @OneToMany(() => Bill, (bill) => bill.user)
  bills: Bill[];

  @OneToMany(() => Otp, (otp) => otp.user)
  otps: Otp[];
}
