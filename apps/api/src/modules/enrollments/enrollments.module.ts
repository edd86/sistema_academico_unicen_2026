import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrollmentEntity } from './entities/enrollment.entity';
import { EnrollmentsRepository } from './enrollments.repository';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';
import { QueryRunnerFactory } from '../../database/query-runner.factory';

@Module({
  imports: [TypeOrmModule.forFeature([EnrollmentEntity])],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsRepository, EnrollmentsService, QueryRunnerFactory],
  exports: [EnrollmentsRepository, EnrollmentsService],
})
export class EnrollmentsModule {}
