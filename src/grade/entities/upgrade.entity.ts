import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Members } from 'src/membership/entities/membership.entity';
import { Grade } from './grade.entity';

@Entity('upgrade')
export class Upgrade {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Members, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'member_id' })
  member: Members;

  @ManyToOne(() => Grade, { nullable: false, onDelete: 'CASCADE' })
  currentGrade: Grade;

  @ManyToOne(() => Grade, { nullable: false, onDelete: 'CASCADE' })
  nextGrade: Grade;

  @Column({ type: 'boolean', default: false })
  isUpgradeEligible: boolean;

  @Column({ type: 'boolean', default: false })
  hasPaid: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
