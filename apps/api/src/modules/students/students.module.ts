import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentEntity } from './entities/student.entity';
import { StudentsRepository } from './students.repository';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([StudentEntity]), UsersModule],
  controllers: [StudentsController],
  providers: [StudentsRepository, StudentsService],
  exports: [StudentsRepository, StudentsService],
})
export class StudentsModule {}
