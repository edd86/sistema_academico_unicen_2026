import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentEntity } from './entities/student.entity';

export interface IStudentsRepository {
  findAll(): Promise<StudentEntity[]>;
  findById(id: string): Promise<StudentEntity | null>;
  findByUserId(userId: string): Promise<StudentEntity | null>;
  findByRu(ru: string): Promise<StudentEntity | null>;
  create(studentData: Partial<StudentEntity>): Promise<StudentEntity>;
}

@Injectable()
export class StudentsRepository implements IStudentsRepository {
  constructor(
    @InjectRepository(StudentEntity)
    private readonly repo: Repository<StudentEntity>,
  ) {}

  async findAll(): Promise<StudentEntity[]> {
    return this.repo.find({
      relations: ['user'],
      order: { ru: 'ASC' },
    });
  }

  async findById(id: string): Promise<StudentEntity | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['user', 'enrollments', 'enrollments.course', 'enrollments.course.subject'],
    });
  }

  async findByUserId(userId: string): Promise<StudentEntity | null> {
    return this.repo.findOne({
      where: { userId },
      relations: ['user', 'enrollments', 'enrollments.course', 'enrollments.course.subject'],
    });
  }

  async findByRu(ru: string): Promise<StudentEntity | null> {
    return this.repo.findOne({
      where: { ru },
      relations: ['user'],
    });
  }

  async create(studentData: Partial<StudentEntity>): Promise<StudentEntity> {
    const student = this.repo.create(studentData);
    return this.repo.save(student);
  }
}
