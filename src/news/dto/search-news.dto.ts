import { IsOptional, IsString } from 'class-validator';

export class SearchNewsDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  author?: string;
}
