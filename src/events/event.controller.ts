import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import { NimEventsService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Controller('events')
export class NimEventsController {
  constructor(private readonly nimEventsService: NimEventsService) {}

  @Post()
  create(@Body() createEventDto: CreateEventDto) {
    return this.nimEventsService.create(createEventDto);
  }

  @Get()
  findAll() {
    return this.nimEventsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.nimEventsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateEventDto: UpdateEventDto) {
    return this.nimEventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.nimEventsService.delete(id);
  }
}
