import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('message')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'subject', type: 'text' })
  subject: string;

  @Column({ name: 'body', type: 'text' })
  body: string;

  @Column({
    type: 'enum',
    enum: ['yes', 'no'],
    default: 'no',
  })
  completed: 'yes' | 'no';

  @Column({
    name: 'date',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  date: Date;
}
