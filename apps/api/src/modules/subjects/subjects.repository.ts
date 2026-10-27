import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubjectEntity } from './entities/subject.entity';

export interface ISubjectsRepository {
  findAll(): Promise<SubjectEntity[]>;
  findById(id: string): Promise<SubjectEntity | null>;
  findByCode(code: string): Promise<SubjectEntity | null>;
  create(subjectData: Partial<SubjectEntity>): Promise<SubjectEntity>;
}

@Injectable()
export class SubjectsRepository implements ISubjectsRepository {
  constructor(
    @InjectRepository(SubjectEntity)
    private readonly repo: Repository<SubjectEntity>,
  ) {}

  async findAll(): Promise<SubjectEntity[]> {
    return this.repo.find({
      order: { semester: 'ASC', code: 'ASC' },
      relations: ['courses'],
    });
  }

  async findById(id: string): Promise<SubjectEntity | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['courses'],
    });
  }

  async findByCode(code: string): Promise<SubjectEntity | null> {
    return this.repo.findOne({
      where: { code },
      relations: ['courses'],
    });
  }

  async create(subjectData: Partial<SubjectEntity>): Promise<SubjectEntity> {
    const subject = this.repo.create(subjectData);
    return this.repo.save(subject);
  }
}
