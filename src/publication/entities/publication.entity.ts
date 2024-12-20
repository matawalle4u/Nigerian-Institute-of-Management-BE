import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('publication')
export class Publication {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 500 })
  description: string;

  @Column({ length: 255 })
  author: string;

  @CreateDateColumn()
  publishedAt: Date;

  @Column({ default: true })
  isActive: boolean;
}
