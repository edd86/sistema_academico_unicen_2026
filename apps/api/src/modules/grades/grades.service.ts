import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GradeCondition } from '@unicen/shared';
import { GradesRepository } from './grades.repository';
import {
  IGradingStrategy,
  GRADING_STRATEGY,
} from './strategies/grading.strategy.interface';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { GradeEntity } from './entities/grade.entity';
import { EnrollmentsRepository } from '../enrollments/enrollments.repository';
import { StudentsRepository } from '../students/students.repository';

@Injectable()
export class GradesService {
  constructor(
    private readonly gradesRepo: GradesRepository,
    private readonly enrollmentsRepo: EnrollmentsRepository,
    private readonly studentsRepo: StudentsRepository,
    @Inject(GRADING_STRATEGY)
    private readonly gradingStrategy: IGradingStrategy,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getCourseGrades(courseId: string) {
    const grades = await this.gradesRepo.findByCourseId(courseId);

    let totalSum = 0;
    let gradedCount = 0;
    let passingCount = 0;
    let atRiskCount = 0;

    for (const g of grades) {
      if (g.finalGrade != null) {
        totalSum += g.finalGrade;
        gradedCount++;
        if (g.finalGrade >= 51) {
          passingCount++;
        } else {
          atRiskCount++;
        }
      }
    }

    const courseAverage =
      gradedCount > 0 ? Math.round((totalSum / gradedCount) * 10) / 10 : 0;
    const projectedPassPercentage =
      gradedCount > 0
        ? Math.round((passingCount / gradedCount) * 1000) / 10
        : 0;

    return {
      courseId,
      metrics: {
        courseAverage,
        projectedPassPercentage,
        atRiskCount,
        totalStudents: grades.length,
      },
      records: grades.map((g) => ({
        id: g.id,
        enrollmentId: g.enrollmentId,
        studentId: g.enrollment?.studentId,
        studentName: g.enrollment?.student?.user?.fullName || 'Estudiante',
        ru: g.enrollment?.student?.ru || 'RU-PENDIENTE',
        career: g.enrollment?.student?.career || 'Ingeniería de Sistemas',
        partial1: g.partial1,
        partial2: g.partial2,
        labs: g.labs,
        finalExam: g.finalExam,
        finalGrade: g.finalGrade,
        attendancePercentage: g.attendancePercentage,
        condition: g.condition,
        isClosed: g.isClosed,
      })),
    };
  }

  async updateGrade(
    enrollmentId: string,
    updateDto: UpdateGradeDto,
  ): Promise<GradeEntity> {
    let grade = await this.gradesRepo.findByEnrollmentId(enrollmentId);
    if (!grade) {
      throw new NotFoundException(
        `Registro de notas para la matrícula ${enrollmentId} no encontrado`,
      );
    }

    if (grade.isClosed) {
      throw new BadRequestException(
        'El acta ya se encuentra cerrada y firmada digitalmente; no se permiten más modificaciones.',
      );
    }

    // Actualiza campos provistos
    if (updateDto.partial1 !== undefined) grade.partial1 = updateDto.partial1;
    if (updateDto.partial2 !== undefined) grade.partial2 = updateDto.partial2;
    if (updateDto.labs !== undefined) grade.labs = updateDto.labs;
    if (updateDto.finalExam !== undefined)
      grade.finalExam = updateDto.finalExam;
    if (updateDto.attendancePercentage !== undefined)
      grade.attendancePercentage = updateDto.attendancePercentage;

    // Calcular nota final y condición mediante Strategy Pattern
    const { finalGrade, condition } = this.gradingStrategy.calculate({
      partial1: grade.partial1,
      partial2: grade.partial2,
      labs: grade.labs,
      finalExam: grade.finalExam,
      attendancePercentage: grade.attendancePercentage,
    });

    grade.finalGrade = finalGrade;
    grade.condition = condition;

    const updated = await this.gradesRepo.save(grade);

    this.eventEmitter.emit('grade.updated', {
      gradeId: updated.id,
      enrollmentId: updated.enrollmentId,
      finalGrade: updated.finalGrade,
      condition: updated.condition,
    });

    return updated;
  }

  async closeActa(courseId: string) {
    const grades = await this.gradesRepo.findByCourseId(courseId);
    if (!grades.length) {
      throw new NotFoundException(
        `No se encontraron registros de notas para el curso ${courseId}`,
      );
    }

    for (const g of grades) {
      g.isClosed = true;
      await this.gradesRepo.save(g);
    }

    this.eventEmitter.emit('acta.closed', {
      courseId,
      closedAt: new Date(),
      totalRecords: grades.length,
    });

    return {
      message: 'Acta de calificaciones cerrada y firmada digitalmente con éxito',
      courseId,
      totalRecords: grades.length,
    };
  }

  async getAcademicHistory(studentId: string) {
    const student = await this.studentsRepo.findById(studentId);
    if (!student) {
      throw new NotFoundException(`Estudiante ${studentId} no encontrado`);
    }

    const enrollments = await this.enrollmentsRepo.findByStudentId(studentId);

    const recordsByTerm: Record<string, any[]> = {};
    let totalGradeSum = 0;
    let gradedCount = 0;
    let totalCreditsApproved = 0;

    for (const enr of enrollments) {
      const term = enr.term || '2026-I';
      if (!recordsByTerm[term]) {
        recordsByTerm[term] = [];
      }

      const grade = enr.grade;
      const subject = enr.course?.subject;
      const credits = subject?.credits || 4;

      if (grade?.finalGrade != null) {
        totalGradeSum += grade.finalGrade;
        gradedCount++;
        if (grade.finalGrade >= 51) {
          totalCreditsApproved += credits;
        }
      }

      recordsByTerm[term].push({
        id: enr.id,
        term,
        subjectCode: subject?.code || 'SIS-XXX',
        subjectName: subject?.name || 'Materia',
        credits,
        parallel: enr.course?.parallel || 'Paralelo Único',
        teacherName: enr.course?.teacherName || 'Docente Titular',
        finalGrade: grade?.finalGrade ?? null,
        condition: grade?.condition || GradeCondition.PENDIENTE,
        attendancePercentage: grade?.attendancePercentage ?? 100,
        isClosed: grade?.isClosed ?? false,
      });
    }

    const overallGpa =
      gradedCount > 0
        ? Math.round((totalGradeSum / gradedCount) * 10) / 10
        : student.cumulativeGpa;

    return {
      student: {
        id: student.id,
        ru: student.ru,
        fullName: student.user?.fullName,
        career: student.career,
        studyPlan: student.studyPlan,
        currentSemester: student.currentSemester,
        academicStanding: student.academicStanding,
        cumulativeGpa: overallGpa,
        completedCredits: totalCreditsApproved || student.completedCredits,
        totalCreditsRequired: student.totalCreditsRequired,
      },
      overallGpa,
      totalCreditsApproved: totalCreditsApproved || student.completedCredits,
      recordsByTerm,
    };
  }
}
