import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Login } from 'src/account/entities/login.entity';

@Entity('grade_history')
export class GradeHistory {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'login_id', unsigned: true })
  loginId: number;

  @Column({ length: 32 })
  grade: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ name: 'poster', unsigned: true, nullable: true })
  poster: number;

  @ManyToOne(() => Login)
  @JoinColumn({ name: 'login_id' })
  user: Login;

  @ManyToOne(() => Login)
  @JoinColumn({ name: 'poster' })
  postedBy: Login;
}
