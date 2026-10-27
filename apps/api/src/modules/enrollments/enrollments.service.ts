import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EnrollmentStatus, GradeCondition } from '@unicen/shared';
import { EnrollmentsRepository } from './enrollments.repository';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { EnrollmentEntity } from './entities/enrollment.entity';
import { StudentEntity } from '../students/entities/student.entity';
import { CourseEntity } from '../courses/entities/course.entity';
import { GradeEntity } from '../grades/entities/grade.entity';
import { QueryRunnerFactory } from '../../database/query-runner.factory';

@Injectable()
export class EnrollmentsService {
  constructor(
    private readonly enrollmentsRepo: EnrollmentsRepository,
    private readonly queryRunnerFactory: QueryRunnerFactory,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(): Promise<EnrollmentEntity[]> {
    return this.enrollmentsRepo.findAll();
  }

  async findById(id: string): Promise<EnrollmentEntity> {
    const enrollment = await this.enrollmentsRepo.findById(id);
    if (!enrollment) {
      throw new NotFoundException(`Inscripción con ID ${id} no encontrada`);
    }
    return enrollment;
  }

  async findByStudentId(studentId: string, term?: string): Promise<EnrollmentEntity[]> {
    return this.enrollmentsRepo.findByStudentId(studentId, term);
  }

  async findByCourseId(courseId: string): Promise<EnrollmentEntity[]> {
    return this.enrollmentsRepo.findByCourseId(courseId);
  }

  async enroll(createEnrollmentDto: CreateEnrollmentDto): Promise<EnrollmentEntity> {
    const queryRunner =
      await this.queryRunnerFactory.createTransactionalRunner();

    try {
      const studentRepo = queryRunner.manager.getRepository(StudentEntity);
      const courseRepo = queryRunner.manager.getRepository(CourseEntity);
      const enrollmentRepo =
        queryRunner.manager.getRepository(EnrollmentEntity);
      const gradeRepo = queryRunner.manager.getRepository(GradeEntity);

      const student = await studentRepo.findOne({
        where: { id: createEnrollmentDto.studentId },
      });
      if (!student) {
        throw new NotFoundException(
          `Estudiante con ID ${createEnrollmentDto.studentId} no encontrado`,
        );
      }

      const course = await courseRepo.findOne({
        where: { id: createEnrollmentDto.courseId },
      });
      if (!course) {
        throw new NotFoundException(
          `Oferta de curso con ID ${createEnrollmentDto.courseId} no encontrada`,
        );
      }

      // Caso 2: Debe lanzar ConflictException si el estudiante ya está registrado en el curso
      const existingEnrollment = await enrollmentRepo.findOne({
        where: {
          studentId: createEnrollmentDto.studentId,
          courseId: createEnrollmentDto.courseId,
          status: EnrollmentStatus.CONFIRMADA,
        },
      });

      if (existingEnrollment) {
        throw new ConflictException(
          `El estudiante ya se encuentra matriculado en este curso (Gestión ${course.term})`,
        );
      }

      // Caso 3: Debe lanzar BadRequestException si las inscripciones activas alcanzan el cupo_maximo
      if (course.enrolledCount >= course.maxCapacity) {
        throw new BadRequestException(
          `No hay cupos disponibles en este paralelo (${course.enrolledCount}/${course.maxCapacity})`,
        );
      }

      // Caso 1: Inscripción exitosa cuando hay cupo disponible y no hay duplicidad
      const enrollment = enrollmentRepo.create({
        studentId: createEnrollmentDto.studentId,
        courseId: createEnrollmentDto.courseId,
        term: createEnrollmentDto.term || course.term,
        status: EnrollmentStatus.CONFIRMADA,
      });

      const savedEnrollment = await enrollmentRepo.save(enrollment);

      // Crear registro inicial de calificaciones en estado PENDIENTE
      const initialGrade = gradeRepo.create({
        enrollmentId: savedEnrollment.id,
        condition: GradeCondition.PENDIENTE,
        attendancePercentage: 100,
        isClosed: false,
      });
      await gradeRepo.save(initialGrade);

      // Incrementar cupos del curso
      await courseRepo.increment({ id: course.id }, 'enrolledCount', 1);

      await queryRunner.commitTransaction();

      // Emitir evento para Observer de Auditoría y Saturación
      this.eventEmitter.emit('enrollment.created', {
        enrollmentId: savedEnrollment.id,
        studentId: savedEnrollment.studentId,
        courseId: savedEnrollment.courseId,
        term: savedEnrollment.term,
      });

      return savedEnrollment;
    } catch (error) {
      // Caso 4: Verificar rollback de la transacción en caso de fallo en BD
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
