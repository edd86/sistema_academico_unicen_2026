import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsRepository } from './enrollments.repository';
import { QueryRunnerFactory } from '../../database/query-runner.factory';
import { StudentEntity } from '../students/entities/student.entity';
import { CourseEntity } from '../courses/entities/course.entity';
import { EnrollmentEntity } from './entities/enrollment.entity';
import { GradeEntity } from '../grades/entities/grade.entity';
import { EnrollmentStatus, GradeCondition } from '@unicen/shared';

describe('EnrollmentsService (Unit Tests Críticos de Negocio y Transacciones)', () => {
  let service: EnrollmentsService;
  let mockQueryRunner: any;
  let mockQueryRunnerFactory: any;
  let mockStudentRepo: any;
  let mockCourseRepo: any;
  let mockEnrollmentRepo: any;
  let mockGradeRepo: any;
  let mockEventEmitter: any;

  beforeEach(async () => {
    mockStudentRepo = {
      findOne: jest.fn(),
    };

    mockCourseRepo = {
      findOne: jest.fn(),
      increment: jest.fn(),
    };

    mockEnrollmentRepo = {
      findOne: jest.fn(),
      create: jest.fn((dto) => ({ id: 'enr-uuid-1', ...dto })),
      save: jest.fn((entity) => Promise.resolve(entity)),
    };

    mockGradeRepo = {
      create: jest.fn((dto) => ({ id: 'gr-uuid-1', ...dto })),
      save: jest.fn((entity) => Promise.resolve(entity)),
    };

    mockQueryRunner = {
      manager: {
        getRepository: jest.fn((entity) => {
          if (entity === StudentEntity) return mockStudentRepo;
          if (entity === CourseEntity) return mockCourseRepo;
          if (entity === EnrollmentEntity) return mockEnrollmentRepo;
          if (entity === GradeEntity) return mockGradeRepo;
          return null;
        }),
      },
      connect: jest.fn().mockResolvedValue(undefined),
      startTransaction: jest.fn().mockResolvedValue(undefined),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
    };

    mockQueryRunnerFactory = {
      createTransactionalRunner: jest.fn().mockResolvedValue(mockQueryRunner),
    };

    mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollmentsService,
        {
          provide: EnrollmentsRepository,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByStudentId: jest.fn(),
            findByCourseId: jest.fn(),
          },
        },
        {
          provide: QueryRunnerFactory,
          useValue: mockQueryRunnerFactory,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<EnrollmentsService>(EnrollmentsService);
  });

  const validDto = {
    studentId: 'student-uuid-123',
    courseId: 'course-uuid-456',
    term: '2026-I',
  };

  const mockStudent = {
    id: 'student-uuid-123',
    ru: 'RU-2023-01984',
    career: 'Ingeniería de Sistemas',
  };

  const mockCourseAvailable = {
    id: 'course-uuid-456',
    term: '2026-I',
    parallel: 'Paralelo A',
    maxCapacity: 40,
    enrolledCount: 38,
  };

  it('Caso 1: Inscripción exitosa cuando hay cupo disponible y no hay duplicidad', async () => {
    mockStudentRepo.findOne.mockResolvedValue(mockStudent);
    mockCourseRepo.findOne.mockResolvedValue(mockCourseAvailable);
    mockEnrollmentRepo.findOne.mockResolvedValue(null); // No duplicidad
    mockEnrollmentRepo.save.mockResolvedValue({
      id: 'enr-new-id',
      studentId: validDto.studentId,
      courseId: validDto.courseId,
      term: '2026-I',
      status: EnrollmentStatus.CONFIRMADA,
    });

    const result = await service.enroll(validDto);

    expect(result).toBeDefined();
    expect(result.id).toBe('enr-new-id');
    expect(result.status).toBe(EnrollmentStatus.CONFIRMADA);
    expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    expect(mockQueryRunner.rollbackTransaction).not.toHaveBeenCalled();
    expect(mockQueryRunner.release).toHaveBeenCalled();
    expect(mockCourseRepo.increment).toHaveBeenCalledWith(
      { id: mockCourseAvailable.id },
      'enrolledCount',
      1,
    );
    expect(mockEventEmitter.emit).toHaveBeenCalledWith(
      'enrollment.created',
      expect.objectContaining({
        studentId: validDto.studentId,
        courseId: validDto.courseId,
      }),
    );
  });

  it('Caso 2: Debe lanzar ConflictException si el estudiante ya está registrado en el curso', async () => {
    mockStudentRepo.findOne.mockResolvedValue(mockStudent);
    mockCourseRepo.findOne.mockResolvedValue(mockCourseAvailable);
    // Simula duplicidad activa
    mockEnrollmentRepo.findOne.mockResolvedValue({
      id: 'existing-enr-id',
      studentId: validDto.studentId,
      courseId: validDto.courseId,
      status: EnrollmentStatus.CONFIRMADA,
    });

    await expect(service.enroll(validDto)).rejects.toThrow(ConflictException);
    expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    expect(mockQueryRunner.commitTransaction).not.toHaveBeenCalled();
    expect(mockQueryRunner.release).toHaveBeenCalled();
  });

  it('Caso 3: Debe lanzar BadRequestException si las inscripciones activas alcanzan el cupo_maximo', async () => {
    const mockCourseFull = {
      ...mockCourseAvailable,
      enrolledCount: 40,
      maxCapacity: 40, // Sin cupos disponibles
    };

    mockStudentRepo.findOne.mockResolvedValue(mockStudent);
    mockCourseRepo.findOne.mockResolvedValue(mockCourseFull);
    mockEnrollmentRepo.findOne.mockResolvedValue(null);

    await expect(service.enroll(validDto)).rejects.toThrow(BadRequestException);
    expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    expect(mockQueryRunner.commitTransaction).not.toHaveBeenCalled();
    expect(mockQueryRunner.release).toHaveBeenCalled();
  });

  it('Caso 4: Verificar rollback de la transacción en caso de fallo en BD', async () => {
    mockStudentRepo.findOne.mockResolvedValue(mockStudent);
    mockCourseRepo.findOne.mockResolvedValue(mockCourseAvailable);
    mockEnrollmentRepo.findOne.mockResolvedValue(null);
    // Simula fallo al persistir en base de datos
    mockEnrollmentRepo.save.mockRejectedValue(
      new Error('Fallo crítico de conexión con PostgreSQL'),
    );

    await expect(service.enroll(validDto)).rejects.toThrow(
      'Fallo crítico de conexión con PostgreSQL',
    );
    expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    expect(mockQueryRunner.commitTransaction).not.toHaveBeenCalled();
    expect(mockQueryRunner.release).toHaveBeenCalled();
  });
});
