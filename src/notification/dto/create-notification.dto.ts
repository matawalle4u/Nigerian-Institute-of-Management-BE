import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateNotificationDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '1',
    description: 'Login Id of the user',
    required: true,
  })
  loginId: number;

  @ApiProperty({
    example: 'Notification title',
    description: 'Title Of the notification',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Notification message',
    description: 'Content of the notification',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  message: string;
}
