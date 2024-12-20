import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('grade')
export class Grade {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ['graduate', 'associate', 'member', 'fellow', 'companion'],
    nullable: false,
  })
  name: 'graduate' | 'associate' | 'member' | 'fellow' | 'companion';
}
