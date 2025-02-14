import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Login } from 'src/account/entities/login.entity';
import { Chapter } from 'src/zone/entities/chapter.entity';

export class MembershipDto {
  @ApiProperty({
    example: 101,
    description: 'Login ID associated with the member',
    required: true,
  })
  @Type(() => Login)
  login_id: Login;

  @ApiProperty({
    example: 'MEM12345',
    description: 'Unique member number',
    required: true,
  })
  @IsString()
  member_no: string;

  @ApiProperty({
    example: 'John',
    description: 'First name of the member',
    required: true,
  })
  @IsString()
  first_name: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name of the member',
    required: true,
  })
  @IsString()
  last_name: string;

  @ApiProperty({
    example: 'Michael',
    description: 'Other name of the member',
    required: false,
  })
  @IsOptional()
  @IsString()
  other_name?: string;

  @ApiProperty({
    example: '1234567890',
    description: 'Phone number of the member',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    example: '123 Main St',
    description: 'Address of the member',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    example: 'male',
    enum: ['male', 'female'],
    description: 'Gender of the member',
  })
  @IsEnum(['male', 'female'])
  gender: 'male' | 'female';

  @ApiProperty({
    example: '1990-01-01',
    description: 'Date of birth of the member',
  })
  @IsDateString()
  date_of_birth: string;

  @ApiProperty({
    example: '2022-12-01',
    description: 'Date of election for the member',
  })
  @IsDateString()
  date_of_election: string;

  @ApiProperty({
    example: 'Tech Corp',
    description: 'Employer of the member',
    required: false,
  })
  @IsOptional()
  @IsString()
  employer?: string;

  @ApiProperty({
    example: 2,
    description: 'Chapter ID of the member',
    required: false,
  })
  @IsOptional()
  @Type(() => Chapter)
  chapter?: Chapter;

  @ApiProperty({ example: 5, description: 'Zone ID of the member' })
  @IsNumber()
  zone: number;

  @ApiProperty({
    example: 'graduate',
    enum: ['graduate', 'associate', 'member', 'fellow', 'companion'],
    description: 'Grade of the member',
  })
  @IsEnum(['graduate', 'associate', 'member', 'fellow', 'companion'])
  grade: 'graduate' | 'associate' | 'member' | 'fellow' | 'companion';

  @ApiProperty({
    example: 'yes',
    enum: ['yes', 'no'],
    description: 'Life membership status',
  })
  @IsEnum(['yes', 'no'])
  life_member: 'yes' | 'no';

  @ApiProperty({
    example: 25,
    description: 'Cumulative CP points of the member',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  cumulative_cp?: number;

  @ApiProperty({
    example: 'Abuja',
    description: 'State of residence of the member',
    required: false,
  })
  @IsOptional()
  @IsString()
  state_of_residence?: string;

  @ApiProperty({
    example: 'yes',
    enum: ['yes', 'no'],
    description: 'License status',
  })
  @IsEnum(['yes', 'no'])
  license: 'yes' | 'no';

  @ApiProperty({
    example: 'LIC2023-0001',
    description: 'License number of the member',
    required: false,
  })
  @IsOptional()
  @IsString()
  license_no?: string;

  @ApiProperty({
    example: '2023-11-01T12:00:00Z',
    description: 'Submission date for induction',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  submission_date?: string;

  @ApiProperty({
    example: 'yes',
    enum: ['yes', 'no'],
    description: 'Upgrade application status',
    required: false,
  })
  @IsOptional()
  @IsEnum(['yes', 'no'])
  upgrade_application_status?: 'yes' | 'no';

  @ApiProperty({
    example: 'yes',
    enum: ['yes', 'no'],
    description: 'Induction status',
  })
  @IsEnum(['yes', 'no'])
  induction: 'yes' | 'no';

  @ApiProperty({
    example: 'yes',
    enum: ['yes', 'no'],
    description: 'Acceptance status',
    required: false,
  })
  @IsOptional()
  @IsEnum(['yes', 'no'])
  accepted?: 'yes' | 'no';

  @ApiProperty({
    example: 'Missing documents',
    description: 'Reason for rejection',
    required: false,
  })
  @IsOptional()
  @IsString()
  rejectMsg?: string;

  @ApiProperty({
    example: 'passport.jpg',
    description: 'Member passport',
    required: false,
  })
  @IsOptional()
  @IsString()
  passport?: string;
}
