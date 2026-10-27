import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEnrollmentDto {
  @IsString()
  @IsNotEmpty({ message: 'El ID del estudiante es requerido' })
  studentId: string;

  @IsString()
  @IsNotEmpty({ message: 'El ID del curso es requerido' })
  courseId: string;

  @IsOptional()
  @IsString()
  term?: string;
}
