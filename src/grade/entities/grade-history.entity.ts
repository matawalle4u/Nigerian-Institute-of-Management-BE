import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Login } from 'src/account/entities/login.entity';

@Entity('grade_history')
export class History {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Login, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'login_id' })
  login_id: Login;

  @Column({ name: 'grade' })
  grade: string;

  @ManyToOne(() => Login, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'poster' })
  poster: Login;

  @Column({ name: 'date', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;
}
