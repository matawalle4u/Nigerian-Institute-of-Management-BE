import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Criteria } from './criteria.entity';

@Entity('grades')
export class Grade {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  gradeName: string;

  @Column('decimal')
  paymentAmount: number;

  @Column({ unique: true })
  priority: number; //Priority number 1 next priority is 2

  @ManyToOne(() => Criteria, { nullable: false, onDelete: 'CASCADE' })
  criteria: Criteria;
}
