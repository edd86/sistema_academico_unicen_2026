import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DataSourceConfigFactory } from './database/data-source.factory';
import { SeedService } from './database/seed.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { CoursesModule } from './modules/courses/courses.module';
import { StudentsModule } from './modules/students/students.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { GradesModule } from './modules/grades/grades.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => DataSourceConfigFactory.createOptions(),
    }),
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      maxListeners: 20,
    }),
    UsersModule,
    AuthModule,
    SubjectsModule,
    CoursesModule,
    StudentsModule,
    EnrollmentsModule,
    GradesModule,
    AuditModule,
  ],
  providers: [SeedService],
})
export class AppModule {}
