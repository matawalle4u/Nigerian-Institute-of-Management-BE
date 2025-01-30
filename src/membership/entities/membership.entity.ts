import {
  Entity,
  Column,
  OneToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Login } from 'src/account/entities/login.entity';
@Entity('members')
export class Members {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'Unique identifier for the member' })
  id: number;

  @OneToOne(() => Login, (login) => login.member, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'login_id' })
  login_id: Login;

  @Column({ name: 'member_no' })
  @ApiProperty({ example: 'MEM12345', description: 'Unique member number' })
  member_no: string;

  @Column()
  @ApiProperty({ example: 'John', description: 'First name of the member' })
  first_name: string;

  @Column()
  @ApiProperty({ example: 'Doe', description: 'Last name of the member' })
  last_name: string;

  @Column({ nullable: true })
  @ApiProperty({
    example: 'Michael',
    description: 'Other name of the member',
    required: false,
  })
  other_name?: string;

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
  date_of_birth: string;

  @Column({ name: 'date_of_election' })
  @ApiProperty({
    example: '2022-12-01',
    description: 'Date of election for the member',
  })
  date_of_election: string;

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

  @Column({ name:'cumulative_cp', nullable: true })
  @ApiProperty({
    example: 25,
    description: 'Cumulative CP points of the member',
    required: false,
  })
  cumulative_cp?: number;

  @Column({ name: 'state_of_residence', nullable: true })
  @ApiProperty({
    example: 'Abuja',
    description: 'State of residence of the member',
    required: false,
  })
  state_of_residence?: string;

  @Column()
  @ApiProperty({
    example: 'yes',
    enum: ['yes', 'no'],
    description: 'License status',
  })
  license: 'yes' | 'no';

  @Column({ name: 'license_no', nullable: true })
  @ApiProperty({
    example: 'LIC2023-0001',
    description: 'License number of the member',
    required: false,
  })
  license_no?: string;

  @Column({ name: 'submission_date', nullable: true })
  @ApiProperty({
    example: '2023-11-01T12:00:00Z',
    description: 'Submission date for induction',
    required: false,
  })
  submission_date?: string;

  @Column({ name: 'upgrade_application_status', nullable: true })
  @ApiProperty({
    example: 'yes',
    enum: ['yes', 'no'],
    description: 'Upgrade application status',
    required: false,
  })
  upgrade_application_status?: 'yes' | 'no';

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

  @Column({ name: 'reject_msg', nullable: true })
  @ApiProperty({
    example: 'Missing documents',
    description: 'Reason for rejection',
    required: false,
  })
  reject_msg?: string;

  @Column({ nullable: true })
  @ApiProperty({
    example: 'passport.jpg',
    description: 'Member passport',
    required: false,
  })
  passport?: string;

  @Column({
    name: 'license_status',
    type: 'enum',
    enum: ['active', 'expired'],
    nullable: true,
    default: 'expired',
  })
  license_status: 'active' | 'expired';
}
