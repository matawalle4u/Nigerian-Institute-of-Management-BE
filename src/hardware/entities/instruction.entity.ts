import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Pin } from './pin.entity';

@Entity()
export class Instruction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nodeId: number;

  @OneToMany(() => Pin, (pin) => pin.instruction, {
    cascade: true,
    eager: true,
  })
  pins: Pin[];
}
