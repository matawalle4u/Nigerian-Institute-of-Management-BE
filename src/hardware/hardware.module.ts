import { Module } from '@nestjs/common';
import { PinController } from './hardware.controller';
import { PinService } from './hardware.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Instruction } from './entities/instruction.entity';
import { Pin } from './entities/pin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pin, Instruction])],
  controllers: [PinController],
  providers: [PinService],
})
export class HardwareModule {}
