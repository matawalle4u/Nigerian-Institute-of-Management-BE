import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Login } from 'src/account/entities/login.entity';

@Entity('payment')
export class Payment {
  @PrimaryColumn({ name: 'payment_id', type: 'char', length: 18 })
  payment_id: string;

  @ManyToOne(() => Login, (login) => login.payments)
  @JoinColumn({ name: 'payers' })
  payers: Login;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: ['fail', 'success'], nullable: true })
  status: 'fail' | 'success' | null;

  @Column({ type: 'text', nullable: true })
  other_info: string | null;

  @Column({
    name: 'date',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  date: Date;

  @Column({ type: 'timestamp', nullable: true })
  updatedAt: Date;
}
