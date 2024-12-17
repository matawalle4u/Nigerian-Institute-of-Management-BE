import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('login')
export class Login {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ length: 32 })
  username: string;
  @Column({ length: 64 })
  email: string;
  @Column({ length: 128, select: false }) // Password should not be selected by default
  password: string;
  @Column({ type: 'enum', enum: ['no', 'yes'], default: 'no' })
  default_password: 'no' | 'yes';
  @Column({
    type: 'enum',
    enum: ['admin', 'member', 'viewer', 'updater', 'logger'],
    default: 'member',
  })
  authority: 'admin' | 'member' | 'viewer' | 'updater' | 'logger';
  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: 'active' | 'inactive';
  @Column({ nullable: true, length: 16 })
  reset_token: string | null;
  @Column({ nullable: true, length: 16 })
  activation_token: string | null;
  @CreateDateColumn()
  date: Date;
}
