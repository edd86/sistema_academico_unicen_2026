import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogEntity } from './entities/audit-log.entity';
import { CourseEntity } from '../courses/entities/course.entity';
import { AcademicEventsObserver } from './observers/academic-events.observer';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLogEntity, CourseEntity])],
  controllers: [AuditController],
  providers: [AcademicEventsObserver, AuditService],
  exports: [AcademicEventsObserver, AuditService],
})
export class AuditModule {}
