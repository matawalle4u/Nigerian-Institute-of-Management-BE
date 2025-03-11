import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Instruction } from './instruction.entity';

@Entity()
export class Pin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  pin: number;

  @Column()
  state: number;

  @ManyToOne(() => Instruction, (instruction) => instruction.pins)
  instruction: Instruction;
}
