import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnrollmentEntity } from './entities/enrollment.entity';

export interface IEnrollmentsRepository {
  findAll(): Promise<EnrollmentEntity[]>;
  findById(id: string): Promise<EnrollmentEntity | null>;
  findByStudentId(studentId: string, term?: string): Promise<EnrollmentEntity[]>;
  findByCourseId(courseId: string): Promise<EnrollmentEntity[]>;
}

@Injectable()
export class EnrollmentsRepository implements IEnrollmentsRepository {
  constructor(
    @InjectRepository(EnrollmentEntity)
    private readonly repo: Repository<EnrollmentEntity>,
  ) {}

  async findAll(): Promise<EnrollmentEntity[]> {
    return this.repo.find({
      relations: ['student', 'student.user', 'course', 'course.subject', 'grade'],
    });
  }

  async findById(id: string): Promise<EnrollmentEntity | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['student', 'student.user', 'course', 'course.subject', 'grade'],
    });
  }

  async findByStudentId(
    studentId: string,
    term?: string,
  ): Promise<EnrollmentEntity[]> {
    const where: any = { studentId };
    if (term) {
      where.term = term;
    }
    return this.repo.find({
      where,
      relations: ['course', 'course.subject', 'grade'],
      order: { enrolledAt: 'DESC' },
    });
  }

  async findByCourseId(courseId: string): Promise<EnrollmentEntity[]> {
    return this.repo.find({
      where: { courseId },
      relations: ['student', 'student.user', 'grade'],
      order: { enrolledAt: 'ASC' },
    });
  }
}
