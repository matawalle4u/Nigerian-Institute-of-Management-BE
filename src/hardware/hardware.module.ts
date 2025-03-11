import { Module } from '@nestjs/common';
import { PinController } from './hardware.controller';
import { PinService } from './hardware.service';

@Module({
  controllers: [PinController],
  providers: [PinService],
})
export class HardwareModule {}
