import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Zone } from './zone.entity';

@Entity('chapter')
export class Chapter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name', length: 255 })
  name: string;

  @Column({ name: 'head', length: 255 })
  head: string;

  @Column({ name: 'name', length: 255 })
  state: string;

  @ManyToOne(() => Zone, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'zone' })
  zone: Zone;

  @Column({ name: 'info' })
  info: string;

  @Column({ name: 'date' })
  date: Date;
}
