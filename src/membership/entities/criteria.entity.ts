import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('criteria')
export class Criteria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  grade: string;

  @Column({ type: 'json' })
  requirements: any; // Define structure for criteria (e.g., minimum points, completed activities, etc.)
}
