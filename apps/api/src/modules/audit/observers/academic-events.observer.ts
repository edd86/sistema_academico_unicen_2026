import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogEntity } from '../entities/audit-log.entity';
import { CourseEntity } from '../../courses/entities/course.entity';

@Injectable()
export class AcademicEventsObserver {
  private readonly logger = new Logger(AcademicEventsObserver.name);

  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditRepo: Repository<AuditLogEntity>,
    @InjectRepository(CourseEntity)
    private readonly courseRepo: Repository<CourseEntity>,
  ) {}

  @OnEvent('enrollment.created')
  async handleEnrollmentCreated(payload: {
    enrollmentId: string;
    studentId: string;
    courseId: string;
    term: string;
  }) {
    this.logger.log(
      `[Observer] Nueva inscripción registrada: Estudiante ${payload.studentId} en Curso ${payload.courseId} (${payload.term})`,
    );

    const log = this.auditRepo.create({
      action: 'ENROLLMENT_CREATED',
      entityType: 'ENROLLMENT',
      entityId: payload.enrollmentId,
      performedBy: payload.studentId,
      details: payload,
    });
    await this.auditRepo.save(log);

    // Protocolo de Cupos Críticos: verificar saturación
    const course = await this.courseRepo.findOne({
      where: { id: payload.courseId },
      relations: ['subject'],
    });

    if (course && course.maxCapacity > 0) {
      const occupancyRate = course.enrolledCount / course.maxCapacity;
      if (occupancyRate >= 0.95) {
        this.logger.warn(
          `[Alerta de Saturación] El curso ${course.subject?.code} - ${course.parallel} ha alcanzado el ${(occupancyRate * 100).toFixed(1)}% de ocupación. Se activa protocolo de desdoble sugerido.`,
        );
      }
    }
  }

  @OnEvent('grade.updated')
  async handleGradeUpdated(payload: {
    gradeId: string;
    enrollmentId: string;
    finalGrade: number | null;
    condition: string;
  }) {
    this.logger.log(
      `[Observer] Calificación actualizada: Matrícula ${payload.enrollmentId} - Nota Final: ${payload.finalGrade} (${payload.condition})`,
    );

    const log = this.auditRepo.create({
      action: 'GRADE_UPDATED',
      entityType: 'GRADE',
      entityId: payload.gradeId,
      performedBy: 'DOCENTE',
      details: payload,
    });
    await this.auditRepo.save(log);
  }

  @OnEvent('acta.closed')
  async handleActaClosed(payload: {
    courseId: string;
    closedAt: Date;
    totalRecords: number;
  }) {
    this.logger.log(
      `[Observer] Acta oficial cerrada: Curso ${payload.courseId} con ${payload.totalRecords} estudiantes.`,
    );

    const log = this.auditRepo.create({
      action: 'ACTA_CLOSED',
      entityType: 'COURSE',
      entityId: payload.courseId,
      performedBy: 'DOCENTE/ADMIN',
      details: payload,
    });
    await this.auditRepo.save(log);
  }
}
