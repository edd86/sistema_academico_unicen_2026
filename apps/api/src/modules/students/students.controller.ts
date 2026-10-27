import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@unicen/shared';

@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DOCENTE)
  async findAll() {
    return this.studentsService.findAll();
  }

  @Get('me')
  async getMyProfile(@CurrentUser() user: any) {
    return this.studentsService.findByUserId(user.id);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.studentsService.findById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }
}
