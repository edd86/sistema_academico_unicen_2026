import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { CourseEntity } from '../src/modules/courses/entities/course.entity';
import { StudentEntity } from '../src/modules/students/entities/student.entity';
import { DataSource } from 'typeorm';

describe('Flujo E2E Autenticación e Inscripción (auth-enrollment.e2e-spec.ts)', () => {
  jest.setTimeout(45000);
  let app: INestApplication;
  let dataSource: DataSource;
  let token: string;
  let studentId: string;
  let targetCourseId: string;

  beforeAll(async () => {
    process.env.USE_IN_MEMORY_DB = 'true';
    process.env.NODE_ENV = 'test';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();

    dataSource = app.get(DataSource);

    // Obtener un estudiante semilla y un curso con vacantes que no esté ya inscrito
    const student = await dataSource.getRepository(StudentEntity).findOne({
      where: { ru: 'RU-2023-01984' }, // Mateo Morales
    });
    expect(student).toBeDefined();
    studentId = student.id;

    // Buscar curso SIS-301 Paralelo B (vacantes disponibles)
    const course = await dataSource.getRepository(CourseEntity).findOne({
      where: { parallel: 'Paralelo B' },
    });
    expect(course).toBeDefined();
    targetCourseId = course.id;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('Paso 1: Login con usuario semilla -> obtención de token JWT', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'mateo.morales@unicen.edu.bo',
        password: 'Unicen2026*',
      })
      .expect(200);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body.user).toBeDefined();
    expect(response.body.user.email).toBe('mateo.morales@unicen.edu.bo');
    token = response.body.accessToken;
  });

  it('Paso 2: Petición POST /enrollments con token validando código HTTP 201 (Created)', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/enrollments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        studentId: studentId,
        courseId: targetCourseId,
        term: '2026-I',
      })
      .expect(201);

    expect(response.body).toBeDefined();
    expect(response.body.id).toBeDefined();
    expect(response.body.studentId).toBe(studentId);
    expect(response.body.courseId).toBe(targetCourseId);
    expect(response.body.status).toBe('CONFIRMADA');
  });

  it('Paso 3: Reintento de la misma inscripción debe retornar código HTTP 409 (Conflict)', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/enrollments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        studentId: studentId,
        courseId: targetCourseId,
        term: '2026-I',
      })
      .expect(409);

    expect(response.body).toHaveProperty('statusCode', 409);
    expect(response.body.message).toMatch(/ya se encuentra matriculado/i);
  });
});
