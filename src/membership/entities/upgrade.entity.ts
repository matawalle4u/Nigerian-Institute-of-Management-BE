import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Members } from './membership.entity';

@Entity('upgrade')
export class Upgrade {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Members, { nullable: false, onDelete: 'CASCADE' })
  member: Members;

  @Column()
  currentGrade: string;

  @Column({ nullable: true })
  nextGrade: string;

  @Column({ type: 'boolean', default: false })
  isUpgradeEligible: boolean;

  @Column({ type: 'boolean', default: false })
  hasPaid: boolean;
}
