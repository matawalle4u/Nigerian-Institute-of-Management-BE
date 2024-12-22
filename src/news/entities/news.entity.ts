import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
@Entity('news')
export class News {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @ApiProperty({
    example: 'NIM News title',
    description: 'Title Of the news post',
    required: true,
  })
  title: string;

  @Column('text')
  @ApiProperty({
    example: 'News content',
    description: 'Content of the News',
    required: true,
  })
  content: string;

  @Column()
  @ApiProperty({
    example: 'Adam Mustapha',
    description: 'Name of the news author',
    required: false,
  })
  author: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
