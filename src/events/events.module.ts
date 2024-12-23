// nim-events.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { NimEventsService } from './event.service';
import { NimEventsController } from './event.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Event])],
  providers: [NimEventsService],
  controllers: [NimEventsController],
})
export class NimEventsModule {}
