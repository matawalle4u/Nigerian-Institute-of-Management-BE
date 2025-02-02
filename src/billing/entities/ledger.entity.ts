import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ledger')
export class Ledger {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'payer_id', nullable: false })
  payer_id: number;

  @Column({ name: 'description', nullable: false })
  description: string;

  @Column('decimal', { name: 'amount', precision: 10, scale: 2 })
  amount: number;

  @Column({
    name: 'debit',
    type: 'enum',
    enum: ['yes', 'no'],
    default: 'no',
  })
  debit: 'yes' | 'no';

  @Column({
    name: 'paid',
    type: 'enum',
    enum: ['yes', 'no'],
    default: 'no',
  })
  paid: 'yes' | 'no';

  @Column({
    name: 'credit',
    type: 'enum',
    enum: ['yes', 'no'],
    default: 'no',
  })
  credit: 'yes' | 'no';

  @Column({ name: 'fee', default: null })
  fee: number;

  @Column({ name: 'date' })
  date: Date;

  @Column({ name: 'year' })
  year: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
