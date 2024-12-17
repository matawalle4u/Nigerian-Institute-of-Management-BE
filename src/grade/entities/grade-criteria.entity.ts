// src/grade/entities/grade-criteria.entity.ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('grade_criteria')
export class GradeCriteria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'int' })
  required_value: number;

  @Column({ length: 32 })
  grade: string;
}
