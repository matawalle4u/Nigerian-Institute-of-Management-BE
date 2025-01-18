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

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'Notification title',
    description: 'Title Of the notification',
    required: true,
  })
  title: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'Notification message',
    description: 'Content of the notification',
    required: true,
  })
  message: string;
}
