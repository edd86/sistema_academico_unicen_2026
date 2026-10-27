import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { GradesService } from './grades.service';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@unicen/shared';

@Controller('grades')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Get('course/:courseId')
  @Roles(UserRole.DOCENTE, UserRole.ADMIN)
  async getCourseGrades(@Param('courseId') courseId: string) {
    return this.gradesService.getCourseGrades(courseId);
  }

  @Put('enrollment/:enrollmentId')
  @Roles(UserRole.DOCENTE, UserRole.ADMIN)
  async updateGrade(
    @Param('enrollmentId') enrollmentId: string,
    @Body() updateGradeDto: UpdateGradeDto,
  ) {
    return this.gradesService.updateGrade(enrollmentId, updateGradeDto);
  }

  @Post('course/:courseId/close-acta')
  @Roles(UserRole.DOCENTE, UserRole.ADMIN)
  async closeActa(@Param('courseId') courseId: string) {
    return this.gradesService.closeActa(courseId);
  }

  @Get('history/me')
  @Roles(UserRole.ESTUDIANTE)
  async getMyAcademicHistory(@CurrentUser() user: any) {
    if (!user.student) {
      throw new UnauthorizedException('No tiene perfil de estudiante asociado');
    }
    return this.gradesService.getAcademicHistory(user.student.id);
  }

  @Get('history/:studentId')
  @Roles(UserRole.DOCENTE, UserRole.ADMIN, UserRole.ESTUDIANTE)
  async getAcademicHistory(@Param('studentId') studentId: string) {
    return this.gradesService.getAcademicHistory(studentId);
  }
}
