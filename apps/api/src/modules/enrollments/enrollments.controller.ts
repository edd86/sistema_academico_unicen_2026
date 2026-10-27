import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@unicen/shared';

@Controller('enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DOCENTE)
  async findAll() {
    return this.enrollmentsService.findAll();
  }

  @Get('my')
  @Roles(UserRole.ESTUDIANTE)
  async getMyEnrollments(
    @CurrentUser() user: any,
    @Query('term') term?: string,
  ) {
    if (!user.student) {
      return [];
    }
    return this.enrollmentsService.findByStudentId(user.student.id, term);
  }

  @Get('student/:studentId')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.ESTUDIANTE)
  async findByStudentId(
    @Param('studentId') studentId: string,
    @Query('term') term?: string,
  ) {
    return this.enrollmentsService.findByStudentId(studentId, term);
  }

  @Get('course/:courseId')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE)
  async findByCourseId(@Param('courseId') courseId: string) {
    return this.enrollmentsService.findByCourseId(courseId);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.enrollmentsService.findById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ESTUDIANTE)
  async enroll(
    @Body() createEnrollmentDto: CreateEnrollmentDto,
    @CurrentUser() user: any,
  ) {
    // Si es estudiante, asegura que no pueda inscribir a otro estudiante
    if (user.role === UserRole.ESTUDIANTE && user.student) {
      createEnrollmentDto.studentId = user.student.id;
    }
    return this.enrollmentsService.enroll(createEnrollmentDto);
  }
}
