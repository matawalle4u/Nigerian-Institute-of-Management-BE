import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Login } from 'src/account/entities/login.entity';
@Entity('license')
export class License {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Login, (login) => login.id, { onDelete: 'CASCADE' })
  @JoinColumn()
  login: Login;

  @Column({ name: 'license_no', type: 'varchar', length: 32, nullable: true })
  license_no?: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
