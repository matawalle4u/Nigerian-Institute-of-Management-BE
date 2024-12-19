import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('members')
export class Members {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'Unique identifier for the member' })
  id: number;

  @Column()
  @ApiProperty({
    example: 101,
    description: 'Login ID associated with the member',
  })
  loginId: number;

  @Column()
  @ApiProperty({ example: 'MEM12345', description: 'Unique member number' })
  memberNo: string;

  @Column()
  @ApiProperty({ example: 'John', description: 'First name of the member' })
  firstName: string;

  @Column()
  @ApiProperty({ example: 'Doe', description: 'Last name of the member' })
  lastName: string;

  @Column({ nullable: true })
  @ApiProperty({
    example: 'Michael',
    description: 'Other name of the member',
    required: false,
  })
  otherName?: string;

  @Column({ nullable: true })
  @ApiProperty({
    example: '1234567890',
    description: 'Phone number of the member',
    required: false,
  })
  phone?: string;

  @Column({ nullable: true })
  @ApiProperty({
    example: '123 Main St',
    description: 'Address of the member',
    required: false,
  })
  address?: string;

  @Column()
  @ApiProperty({
    example: 'male',
    enum: ['male', 'female'],
    description: 'Gender of the member',
  })
  gender: 'male' | 'female';

  @Column()
  @ApiProperty({
    example: '1990-01-01',
    description: 'Date of birth of the member',
  })
  dateOfBirth: string;

  @Column()
  @ApiProperty({
    example: '2022-12-01',
    description: 'Date of election for the member',
  })
  dateOfElection: string;

  @Column({ nullable: true })
  @ApiProperty({
    example: 'Tech Corp',
    description: 'Employer of the member',
    required: false,
  })
  employer?: string;

  @Column({ nullable: true })
  @ApiProperty({
    example: 2,
    description: 'Chapter ID of the member',
    required: false,
  })
  chapter?: number;

  @Column()
  @ApiProperty({ example: 5, description: 'Zone ID of the member' })
  zone: number;

  @Column()
  @ApiProperty({
    example: 'graduate',
    enum: ['graduate', 'associate', 'member', 'fellow', 'companion'],
    description: 'Grade of the member',
  })
  grade: 'graduate' | 'associate' | 'member' | 'fellow' | 'companion';

  @Column()
  @ApiProperty({
    example: 'yes',
    enum: ['yes', 'no'],
    description: 'Life membership status',
  })
  lifeMember: 'yes' | 'no';

  @Column({ nullable: true })
  @ApiProperty({
    example: 25,
    description: 'Cumulative CP points of the member',
    required: false,
  })
  cumulativeCp?: number;

  @Column({ nullable: true })
  @ApiProperty({
    example: 'Abuja',
    description: 'State of residence of the member',
    required: false,
  })
  stateOfResidence?: string;

  @Column()
  @ApiProperty({
    example: 'yes',
    enum: ['yes', 'no'],
    description: 'License status',
  })
  license: 'yes' | 'no';

  @Column({ nullable: true })
  @ApiProperty({
    example: 'LIC2023-0001',
    description: 'License number of the member',
    required: false,
  })
  licenseNo?: string;

  @Column({ nullable: true })
  @ApiProperty({
    example: '2023-11-01T12:00:00Z',
    description: 'Submission date for induction',
    required: false,
  })
  submissionDate?: string;

  @Column({ nullable: true })
  @ApiProperty({
    example: 'yes',
    enum: ['yes', 'no'],
    description: 'Upgrade application status',
    required: false,
  })
  upgradeApplicationStatus?: 'yes' | 'no';

  @Column()
  @ApiProperty({
    example: 'yes',
    enum: ['yes', 'no'],
    description: 'Induction status',
  })
  induction: 'yes' | 'no';

  @Column({ nullable: true })
  @ApiProperty({
    example: 'yes',
    enum: ['yes', 'no'],
    description: 'Acceptance status',
    required: false,
  })
  accepted?: 'yes' | 'no';

  @Column({ nullable: true })
  @ApiProperty({
    example: 'Missing documents',
    description: 'Reason for rejection',
    required: false,
  })
  rejectMsg?: string;

  @Column({ nullable: true })
  @ApiProperty({
    example: 'passport.jpg',
    description: 'Member passport',
    required: false,
  })
  passport?: string;
}
