import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { newDb } from 'pg-mem';
import * as crypto from 'crypto';
import { UserEntity } from '../modules/users/entities/user.entity';
import { StudentEntity } from '../modules/students/entities/student.entity';
import { SubjectEntity } from '../modules/subjects/entities/subject.entity';
import { CourseEntity } from '../modules/courses/entities/course.entity';
import { EnrollmentEntity } from '../modules/enrollments/entities/enrollment.entity';
import { GradeEntity } from '../modules/grades/entities/grade.entity';
import { AuditLogEntity } from '../modules/audit/entities/audit-log.entity';

export const ENTITIES = [
  UserEntity,
  StudentEntity,
  SubjectEntity,
  CourseEntity,
  EnrollmentEntity,
  GradeEntity,
  AuditLogEntity,
];

export class DataSourceConfigFactory {
  static createOptions(): TypeOrmModuleOptions {
    const useInMemory =
      process.env.USE_IN_MEMORY_DB === 'true' ||
      process.env.NODE_ENV === 'test' ||
      !process.env.DB_HOST;

    if (useInMemory) {
      return {
        type: 'postgres',
        entities: ENTITIES,
        synchronize: true,
      };
    }

    return {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || 'unicen_user',
      password: process.env.DB_PASSWORD || 'unicen_pass_2026',
      database: process.env.DB_NAME || 'unicen_academico',
      entities: ENTITIES,
      synchronize: true,
      logging: process.env.DB_LOGGING === 'true',
    };
  }

  static async createDataSource(options?: DataSourceOptions): Promise<DataSource> {
    const useInMemory =
      process.env.USE_IN_MEMORY_DB === 'true' ||
      process.env.NODE_ENV === 'test' ||
      !process.env.DB_HOST;

    if (useInMemory) {
      const db = newDb({ autoCreateForeignKeyIndices: true });

      db.public.registerFunction({
        name: 'version',
        implementation: () => 'PostgreSQL 16.0 (pg-mem in-memory fallback)',
      });

      db.public.registerFunction({
        name: 'current_database',
        implementation: () => 'unicen_academico',
      });

      db.public.registerFunction({
        name: 'uuid_generate_v4',
        implementation: () => crypto.randomUUID(),
      });

      db.registerExtension('uuid-ossp', (schema) => {
        schema.registerFunction({
          name: 'uuid_generate_v4',
          implementation: () => crypto.randomUUID(),
        });
      });

      const ds: DataSource = await db.adapters.createTypeormDataSource({
        type: 'postgres',
        entities: ENTITIES,
      });

      await ds.initialize();
      await ds.synchronize();
      return ds;
    }

    const ds = new DataSource(options as DataSourceOptions);
    await ds.initialize();
    return ds;
  }
}
