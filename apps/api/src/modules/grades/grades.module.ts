import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradeEntity } from './entities/grade.entity';
import { GradesRepository } from './grades.repository';
import { GradesService } from './grades.service';
import { GradesController } from './grades.controller';
import { GRADING_STRATEGY } from './strategies/grading.strategy.interface';
import { StandardUnicenGradingStrategy } from './strategies/standard-unicen-grading.strategy';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { StudentsModule } from '../students/students.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GradeEntity]),
    EnrollmentsModule,
    StudentsModule,
  ],
  controllers: [GradesController],
  providers: [
    GradesRepository,
    GradesService,
    StandardUnicenGradingStrategy,
    {
      provide: GRADING_STRATEGY,
      useExisting: StandardUnicenGradingStrategy,
    },
  ],
  exports: [GradesRepository, GradesService, GRADING_STRATEGY],
})
export class GradesModule {}
