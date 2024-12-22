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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { News } from './entities/news.entity';

@ApiTags('News')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post()
  async addNews(@Body() createNewsDto: CreateNewsDto) {
    return this.newsService.addNews(createNewsDto);
  }
  @Get()
  findAll() {
    return this.newsService.findAll();
  }
  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a single news by ID' })
  @ApiResponse({ status: 200, description: 'Member details', type: News })
  @ApiResponse({ status: 404, description: 'Member not found' })
  findOne(@Param('id') id: number) {
    return this.newsService.findOne(id);
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

  //   @Get()
  //   async searchNews(@Query() searchNewsDto: SearchNewsDto) {
  //     return this.newsService.searchNews(searchNewsDto);
  //   }
}
