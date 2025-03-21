import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  // JoinColumn,
} from 'typeorm';
import { Login } from 'src/account/entities/login.entity';
@Entity('license')
export class License {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Login, (login_id) => login_id.id, { onDelete: 'CASCADE' })
  // @JoinColumn({ name: 'login_id' })
  login_id: Login;

  @Column({ name: 'license_no', type: 'varchar', length: 32, nullable: true })
  license_no?: string;

  @Column({
    name: 'date',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  date: Date;
}
