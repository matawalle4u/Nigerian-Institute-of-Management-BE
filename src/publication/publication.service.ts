// src/publication/publication.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Publication } from './entities/publication.entity';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';

@Injectable()
export class PublicationService {
  constructor(
    @InjectRepository(Publication)
    private readonly publicationRepository: Repository<Publication>,
  ) {}

  async create(
    createPublicationDto: CreatePublicationDto,
  ): Promise<Publication> {
    const publication = this.publicationRepository.create(createPublicationDto);
    return await this.publicationRepository.save(publication);
  }

  async findAll(): Promise<Publication[]> {
    return await this.publicationRepository.find();
  }

  async findOne(id: number): Promise<Publication> {
    const publication = await this.publicationRepository.findOne({
      where: { id },
    });
    if (!publication) {
      throw new NotFoundException(`Publication with ID ${id} not found`);
    }
    return publication;
  }

  async update(
    id: number,
    updatePublicationDto: UpdatePublicationDto,
  ): Promise<Publication> {
    const publication = await this.findOne(id);
    Object.assign(publication, updatePublicationDto);
    return await this.publicationRepository.save(publication);
  }

  async remove(id: number): Promise<void> {
    const publication = await this.findOne(id);
    await this.publicationRepository.remove(publication);
  }
}
