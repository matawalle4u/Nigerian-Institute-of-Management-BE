import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('zone')
export class Zone {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  head: string;

  @Column()
  info: string;
}
