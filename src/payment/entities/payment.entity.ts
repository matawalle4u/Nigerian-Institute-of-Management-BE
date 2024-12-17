// src/payment/payment.entity.ts

import { Entity, PrimaryColumn, Column, ManyToOne } from 'typeorm';
import { Login } from 'src/account/entities/login.entity';

@Entity('payment') // Table name as per your schema
export class Payment {
  @PrimaryColumn({ type: 'char', length: 18 })
  paymentId: string;

  @Column({ type: 'int', unsigned: true })
  payers: number;

  @Column({ type: 'int', unsigned: true })
  amount: number;

  @Column({ type: 'enum', enum: ['fail', 'success'], nullable: true })
  status: 'fail' | 'success' | null;

  @Column({ type: 'text', nullable: true })
  otherInfo: string | null;

  @Column({ type: 'datetime' })
  date: Date;

  @ManyToOne(() => Login, (user) => user.id)
  user: Login;
}
