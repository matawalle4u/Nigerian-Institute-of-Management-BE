import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateGeneralNotificationDto {
  @ApiProperty({
    description: 'Notification title',
    example: 'License reneral',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Message',
    example: 'License renewal is set to commense Janaury',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
