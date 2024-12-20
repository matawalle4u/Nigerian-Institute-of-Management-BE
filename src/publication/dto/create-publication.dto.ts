import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreatePublicationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  author: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
