import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Login } from 'src/account/entities/login.entity';

@Entity('payment')
export class Payment {
  @PrimaryColumn({ type: 'char', length: 18 })
  paymentId: string;

  @ManyToOne(() => Login, (login) => login.payments)
  @JoinColumn({ name: 'payers' })
  payers: Login;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: ['fail', 'success'], nullable: true })
  status: 'fail' | 'success' | null;

  @Column({ type: 'text', nullable: true })
  other_info: string | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  updatedAt: Date;
}
