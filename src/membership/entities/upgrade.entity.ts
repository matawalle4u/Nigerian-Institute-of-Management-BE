import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Members } from './membership.entity';
import { Grade } from './grade.entity';

@Entity('upgrade')
export class Upgrade {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Members, { nullable: false, onDelete: 'CASCADE' })
  member: Members;

  @ManyToOne(() => Grade, { nullable: false, onDelete: 'CASCADE' })
  currentGrade: Grade;

  @ManyToOne(() => Grade, { nullable: false, onDelete: 'CASCADE' })
  nextGrade: Grade;

  @Column({ type: 'boolean', default: false })
  isUpgradeEligible: boolean;

  @Column({ type: 'boolean', default: false })
  hasPaid: boolean;
}
