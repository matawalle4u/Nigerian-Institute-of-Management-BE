import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('grades')
export class Grade {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  gradeName: string;

  @Column('decimal')
  paymentAmount: number;

  @Column({ type: 'text', nullable: true })
  criteriaDescription: string;
}
