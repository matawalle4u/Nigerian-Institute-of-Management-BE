import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('criteria')
export class Criteria {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'json' })
  requirements: any;
}
