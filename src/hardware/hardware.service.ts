import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pin } from './entities/pin.entity';
import { Instruction } from './entities/instruction.entity';

@Injectable()
export class PinService {
  constructor(
    @InjectRepository(Pin)
    private readonly pinRepository: Repository<Pin>,
    @InjectRepository(Instruction)
    private readonly instructionRepository: Repository<Instruction>,
  ) {}

  async createInstruction(
    nodeId: number,
    pins: { pin: number; state: number }[],
  ) {
    const instruction = new Instruction();
    instruction.nodeId = nodeId;
    instruction.pins = pins.map((p) => Object.assign(new Pin(), p));
    return this.instructionRepository.save(instruction);
  }

  async getInstructions(): Promise<Instruction[]> {
    return this.instructionRepository.find();
  }
}
