import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('zone')
export class Zone {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name', length: 255 })
  name: string;

  @Column({ name: 'head', length: 255 })
  head: string;

  @Column({ name: 'info' })
  info: string;
}
