import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Pin } from './pin.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Instruction {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'Unique identifier for the instruction' })
  id: number;

  @Column()
  @ApiProperty({ description: 'Node ID associated with the instruction' })
  nodeId: number;

  @OneToMany(() => Pin, (pin) => pin.instruction, {
    cascade: true,
    eager: true,
  })
  @ApiProperty({
    type: () => [Pin],
    description: 'List of pins associated with this instruction',
  })
  pins: Pin[];
}
