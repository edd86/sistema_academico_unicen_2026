import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import {
  CoursesRepository,
  CourseFilterOptions,
} from './courses.repository';
import { CreateCourseDto } from './dto/create-course.dto';
import { CourseEntity } from './entities/course.entity';
import { SubjectsRepository } from '../subjects/subjects.repository';

@Injectable()
export class CoursesService {
  constructor(
    private readonly coursesRepo: CoursesRepository,
    private readonly subjectsRepo: SubjectsRepository,
  ) {}

  async findAll(filters?: CourseFilterOptions): Promise<CourseEntity[]> {
    return this.coursesRepo.findAll(filters);
  }

  async findById(id: string): Promise<CourseEntity> {
    const course = await this.coursesRepo.findById(id);
    if (!course) {
      throw new NotFoundException(`Oferta de curso con ID ${id} no encontrada`);
    }
    return course;
  }

  async create(createCourseDto: CreateCourseDto): Promise<CourseEntity> {
    const subject = await this.subjectsRepo.findById(createCourseDto.subjectId);
    if (!subject) {
      throw new NotFoundException(
        `La asignatura con ID ${createCourseDto.subjectId} no existe`,
      );
    }

    const existingInTerm = await this.coursesRepo.findAll({
      term: createCourseDto.term,
    });
    const duplicate = existingInTerm.find(
      (c) =>
        c.subjectId === createCourseDto.subjectId &&
        c.parallel.toLowerCase() === createCourseDto.parallel.toLowerCase(),
    );

    if (duplicate) {
      throw new ConflictException(
        `Ya existe una oferta para la asignatura ${subject.code} en ${createCourseDto.parallel} durante la gestión ${createCourseDto.term}`,
      );
    }

    return this.coursesRepo.create(createCourseDto);
  }

  async getMetrics(term?: string) {
    return this.coursesRepo.getMetrics(term);
  }
}
