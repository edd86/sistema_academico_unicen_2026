import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@unicen/shared';

@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  async findAll(
    @Query('term') term?: string,
    @Query('semester') semester?: number,
    @Query('capacityStatus') capacityStatus?: string,
    @Query('search') search?: string,
  ) {
    return this.coursesService.findAll({
      term,
      semester,
      capacityStatus,
      search,
    });
  }

  @Get('metrics')
  async getMetrics(@Query('term') term?: string) {
    return this.coursesService.getMetrics(term);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.coursesService.findById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }
}
