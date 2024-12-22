import {
  Controller,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Get,
  Query,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { SearchNewsDto } from './dto/search-news.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('News')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post()
  async addNews(@Body() createNewsDto: CreateNewsDto) {
    return this.newsService.addNews(createNewsDto);
  }

  @Put(':id')
  async updateNews(
    @Param('id') id: number,
    @Body() updateNewsDto: UpdateNewsDto,
  ) {
    return this.newsService.updateNews(id, updateNewsDto);
  }

  @Delete(':id')
  async deleteNews(@Param('id') id: number) {
    await this.newsService.deleteNews(id);
    return { message: 'News deleted successfully' };
  }

  @Get()
  async searchNews(@Query() searchNewsDto: SearchNewsDto) {
    return this.newsService.searchNews(searchNewsDto);
  }
}
