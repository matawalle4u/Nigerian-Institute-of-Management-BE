import { EntityRepository, Repository } from 'typeorm';
import { GradeHistory } from '../entities/grade-history.entity';

@EntityRepository(GradeHistory)
export class GradeHistoryRepository extends Repository<GradeHistory> {}
