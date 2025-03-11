import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Instruction } from './instruction.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Pin {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'Unique identifier for the pin' })
  id: number;

  @Column()
  @ApiProperty({ description: 'Pin number associated with the instruction' })
  pin: number;

  @Column()
  @ApiProperty({ description: 'State of the pin (e.g., 1 for ON, 0 for OFF)' })
  state: number;

  @ManyToOne(() => Instruction, (instruction) => instruction.pins)
  @ApiProperty({ description: 'Reference to the associated instruction' })
  instruction: Instruction;
}
