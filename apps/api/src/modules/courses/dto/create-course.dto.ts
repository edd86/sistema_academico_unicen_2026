import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { CourseModality } from '@unicen/shared';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty({ message: 'El ID de la materia es requerido' })
  subjectId: string;

  @IsString()
  @IsNotEmpty({ message: 'La gestión es requerida (ej. 2026-I)' })
  term: string;

  @IsString()
  @IsNotEmpty({ message: 'El paralelo es requerido (ej. Paralelo A)' })
  parallel: string;

  @IsString()
  @IsNotEmpty({ message: 'El aula es requerida' })
  classroom: string;

  @IsInt()
  @Min(1)
  physicalCapacity: number;

  @IsInt()
  @Min(1)
  maxCapacity: number;

  @IsEnum(CourseModality)
  modality: CourseModality;

  @IsOptional()
  @IsString()
  teacherId?: string;

  @IsOptional()
  @IsString()
  teacherName?: string;

  @IsOptional()
  @IsString()
  teacherTitle?: string;

  @IsString()
  @IsNotEmpty({ message: 'Los días son requeridos (ej. Lun - Mié)' })
  days: string;

  @IsString()
  @IsNotEmpty({ message: 'La hora de inicio es requerida (ej. 08:00)' })
  startTime: string;

  @IsString()
  @IsNotEmpty({ message: 'La hora de finalización es requerida (ej. 10:00)' })
  endTime: string;
}
