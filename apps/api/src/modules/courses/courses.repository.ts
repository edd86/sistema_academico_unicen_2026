import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CourseEntity } from './entities/course.entity';

export interface CourseFilterOptions {
  term?: string;
  semester?: number;
  capacityStatus?: string;
  search?: string;
}

export interface ICoursesRepository {
  findAll(filters?: CourseFilterOptions): Promise<CourseEntity[]>;
  findById(id: string): Promise<CourseEntity | null>;
  create(courseData: Partial<CourseEntity>): Promise<CourseEntity>;
  incrementEnrolledCount(courseId: string, delta: number): Promise<void>;
  getMetrics(term?: string): Promise<{
    totalCoursesOffered: number;
    totalAvailableSeats: number;
    totalEnrolledSeats: number;
    occupancyPercentage: number;
    criticalCoursesCount: number;
  }>;
}

@Injectable()
export class CoursesRepository implements ICoursesRepository {
  constructor(
    @InjectRepository(CourseEntity)
    private readonly repo: Repository<CourseEntity>,
  ) {}

  async findAll(filters?: CourseFilterOptions): Promise<CourseEntity[]> {
    const qb = this.repo
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.subject', 'subject')
      .orderBy('subject.semester', 'ASC')
      .addOrderBy('subject.code', 'ASC');

    if (filters?.term) {
      qb.andWhere('course.term = :term', { term: filters.term });
    }

    if (filters?.semester) {
      qb.andWhere('subject.semester = :semester', {
        semester: Number(filters.semester),
      });
    }

    if (filters?.search) {
      const search = `%${filters.search.toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(subject.code) LIKE :search OR LOWER(subject.name) LIKE :search OR LOWER(course.teacherName) LIKE :search)',
        { search },
      );
    }

    const courses = await qb.getMany();

    if (filters?.capacityStatus) {
      if (filters.capacityStatus === 'DISPONIBLE') {
        return courses.filter((c) => c.enrolledCount < c.maxCapacity * 0.85);
      } else if (filters.capacityStatus === 'CASI_LLENO') {
        return courses.filter(
          (c) =>
            c.enrolledCount >= c.maxCapacity * 0.85 &&
            c.enrolledCount < c.maxCapacity,
        );
      } else if (filters.capacityStatus === 'LLENO') {
        return courses.filter((c) => c.enrolledCount >= c.maxCapacity);
      }
    }

    return courses;
  }

  async findById(id: string): Promise<CourseEntity | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['subject'],
    });
  }

  async create(courseData: Partial<CourseEntity>): Promise<CourseEntity> {
    const course = this.repo.create(courseData);
    return this.repo.save(course);
  }

  async incrementEnrolledCount(courseId: string, delta: number): Promise<void> {
    await this.repo.increment({ id: courseId }, 'enrolledCount', delta);
  }

  async getMetrics(term = '2026-I') {
    const courses = await this.repo.find({
      where: { term },
      relations: ['subject'],
    });

    const totalCoursesOffered = courses.length;
    let totalAvailableSeats = 0;
    let totalEnrolledSeats = 0;
    let criticalCoursesCount = 0;

    for (const c of courses) {
      totalAvailableSeats += c.maxCapacity;
      totalEnrolledSeats += c.enrolledCount;
      if (c.enrolledCount / c.maxCapacity >= 0.9) {
        criticalCoursesCount++;
      }
    }

    const occupancyPercentage =
      totalAvailableSeats > 0
        ? Math.round((totalEnrolledSeats / totalAvailableSeats) * 1000) / 10
        : 0;

    return {
      totalCoursesOffered,
      totalAvailableSeats,
      totalEnrolledSeats,
      occupancyPercentage,
      criticalCoursesCount,
    };
  }
}
