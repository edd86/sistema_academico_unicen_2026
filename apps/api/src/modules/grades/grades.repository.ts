import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GradeEntity } from './entities/grade.entity';

export interface IGradesRepository {
  findById(id: string): Promise<GradeEntity | null>;
  findByEnrollmentId(enrollmentId: string): Promise<GradeEntity | null>;
  findByCourseId(courseId: string): Promise<GradeEntity[]>;
  save(grade: Partial<GradeEntity>): Promise<GradeEntity>;
}

@Injectable()
export class GradesRepository implements IGradesRepository {
  constructor(
    @InjectRepository(GradeEntity)
    private readonly repo: Repository<GradeEntity>,
  ) {}

  async findById(id: string): Promise<GradeEntity | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['enrollment', 'enrollment.student', 'enrollment.student.user'],
    });
  }

  async findByEnrollmentId(enrollmentId: string): Promise<GradeEntity | null> {
    return this.repo.findOne({
      where: { enrollmentId },
      relations: ['enrollment', 'enrollment.student', 'enrollment.student.user'],
    });
  }

  async findByCourseId(courseId: string): Promise<GradeEntity[]> {
    return this.repo
      .createQueryBuilder('grade')
      .innerJoinAndSelect('grade.enrollment', 'enrollment')
      .innerJoinAndSelect('enrollment.student', 'student')
      .innerJoinAndSelect('student.user', 'user')
      .where('enrollment.courseId = :courseId', { courseId })
      .orderBy('user.fullName', 'ASC')
      .getMany();
  }

  async save(grade: Partial<GradeEntity>): Promise<GradeEntity> {
    return this.repo.save(grade);
  }
}
