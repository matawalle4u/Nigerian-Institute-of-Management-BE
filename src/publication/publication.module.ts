import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicationService } from './publication.service';
import { PublicationController } from './publication.controller';
import { Publication } from './entities/publication.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Publication])],
  controllers: [PublicationController],
  providers: [PublicationService],
})
export class PublicationModule {}
