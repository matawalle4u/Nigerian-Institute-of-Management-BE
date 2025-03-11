import { Body, Controller, Get, Post } from '@nestjs/common';
import { PinService } from './hardware.service';

@Controller('action')
export class PinController {
  constructor(private readonly pinService: PinService) {}

  @Post('instructions')
  async createInstruction(
    @Body()
    body: {
      nodeId: number;
      override: 0 | 1;
      pins: { pin: number; state: number }[];
    },
  ) {
    return this.pinService.createInstruction(
      body.nodeId,
      body.override,
      body.pins,
    );
  }

  @Get('instructions')
  async getInstructions() {
    return this.pinService.getInstructions();
  }
}
