import { EntityRepository, Repository } from 'typeorm';
import { GradeCriteria } from '../entities/grade-criteria.entity';

@EntityRepository(GradeCriteria)
export class GradeCriteriaRepository extends Repository<GradeCriteria> {}
