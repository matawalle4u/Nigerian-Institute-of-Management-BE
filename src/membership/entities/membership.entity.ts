import { ApiProperty } from '@nestjs/swagger';

export class Membership {
  @ApiProperty({ example: 1, description: 'Unique identifier for the member' })
  id: number;

  @ApiProperty({
    example: 101,
    description: 'Login ID associated with the member',
  })
  loginId: number;

  @ApiProperty({ example: 'MEM12345', description: 'Unique member number' })
  memberNo: string;

  @ApiProperty({ example: 'John', description: 'First name of the member' })
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the member' })
  lastName: string;

  @ApiProperty({
    example: 'Michael',
    description: 'Other name of the member',
    required: false,
  })
  otherName?: string;

  @ApiProperty({
    example: '1234567890',
    description: 'Phone number of the member',
    required: false,
  })
  phone?: string;

  @ApiProperty({
    example: '123 Main St',
    description: 'Address of the member',
    required: false,
  })
  address?: string;

  @ApiProperty({
    example: 'male',
    enum: ['male', 'female'],
    description: 'Gender of the member',
  })
  gender: 'male' | 'female';

  @ApiProperty({
    example: '1990-01-01',
    description: 'Date of birth of the member',
  })
  dateOfBirth: string;

  @ApiProperty({
    example: '2022-12-01',
    description: 'Date of election for the member',
  })
  dateOfElection: string;

  @ApiProperty({
    example: 'Tech Corp',
    description: 'Employer of the member',
    required: false,
  })
  employer?: string;

  @ApiProperty({
    example: 2,
    description: 'Chapter ID of the member',
    required: false,
  })
  chapter?: number;

  @ApiProperty({ example: 5, description: 'Zone ID of the member' })
  zone: number;

  @ApiProperty({
    example: 'graduate',
    enum: ['graduate', 'associate', 'member', 'fellow', 'companion'],
    description: 'Grade of the member',
  })
  grade: 'graduate' | 'associate' | 'member' | 'fellow' | 'companion';

  @ApiProperty({
    example: 'yes',
    enum: ['yes', 'no'],
    description: 'Life membership status',
  })
  lifeMember: 'yes' | 'no';

  @ApiProperty({
    example: 25,
    description: 'Cumulative CP points of the member',
    required: false,
  })
  cumulativeCp?: number;

  @ApiProperty({
    example: 'Abuja',
    description: 'State of residence of the member',
    required: false,
  })
  stateOfResidence?: string;

  @ApiProperty({
    example: 'yes',
    enum: ['yes', 'no'],
    description: 'License status',
  })
  license: 'yes' | 'no';

  @ApiProperty({
    example: 'LIC2023-0001',
    description: 'License number of the member',
    required: false,
  })
  licenseNo?: string;

  @ApiProperty({
    example: '2023-11-01T12:00:00Z',
    description: 'Submission date for induction',
    required: false,
  })
  submissionDate?: string;

  @ApiProperty({
    example: 'yes',
    enum: ['yes', 'no'],
    description: 'Upgrade application status',
    required: false,
  })
  upgradeApplicationStatus?: 'yes' | 'no';

  @ApiProperty({
    example: 'yes',
    enum: ['yes', 'no'],
    description: 'Induction status',
  })
  induction: 'yes' | 'no';

  @ApiProperty({
    example: 'yes',
    enum: ['yes', 'no'],
    description: 'Acceptance status',
    required: false,
  })
  accepted?: 'yes' | 'no';

  @ApiProperty({
    example: 'Missing documents',
    description: 'Reason for rejection',
    required: false,
  })
  rejectMsg?: string;

  @ApiProperty({
    example: 'passport.jpg',
    description: 'Member passport',
    required: false,
  })
  passport?: string;
}
