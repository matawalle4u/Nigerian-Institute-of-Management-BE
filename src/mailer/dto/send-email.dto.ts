import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class SendMailDto {
  @ApiProperty({
    description: 'Receiver Emailer',
    example: 'matawalle4u@gmail.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Subject',
    example: 'Zuwa Karaye',
  })
  @IsString()
  subject: string;

  @ApiProperty({
    description: 'Email Content',
    example: 'Zamu bi sahun manya muma',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Template path',
    example: 'MAILER_TEMPLATE',
  })
  @IsString()
  template: string;
}
