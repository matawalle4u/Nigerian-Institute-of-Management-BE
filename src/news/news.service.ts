import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from './entities/news.entity';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { SearchNewsDto } from './dto/search-news.dto';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private readonly newsRepository: Repository<News>,
  ) {}

  async addNews(createNewsDto: CreateNewsDto): Promise<News> {
    const news = this.newsRepository.create(createNewsDto);
    return this.newsRepository.save(news);
  }

  async updateNews(id: number, updateNewsDto: UpdateNewsDto): Promise<News> {
    const news = await this.newsRepository.findOne({ where: { id } });
    if (!news) {
      throw new NotFoundException(`News with ID ${id} not found`);
    }
    Object.assign(news, updateNewsDto);
    return this.newsRepository.save(news);
  }

  async deleteNews(id: number): Promise<void> {
    const result = await this.newsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`News with ID ${id} not found`);
    }
  }

  async searchNews(searchNewsDto: SearchNewsDto): Promise<News[]> {
    const { title, author } = searchNewsDto;
    const query = this.newsRepository.createQueryBuilder('news');

    if (title) {
      query.andWhere('news.title LIKE :title', { title: `%${title}%` });
    }
    if (author) {
      query.andWhere('news.author LIKE :author', { author: `%${author}%` });
    }

    return query.getMany();
  }
}
