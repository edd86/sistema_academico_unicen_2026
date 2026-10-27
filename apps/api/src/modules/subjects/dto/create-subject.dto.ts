import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  @IsNotEmpty({ message: 'El código de la materia es requerido (ej. SIS-301)' })
  code: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre de la asignatura es requerido' })
  name: string;

  @IsInt()
  @Min(1)
  credits: number;

  @IsInt()
  @Min(1)
  semester: number;

  @IsString()
  @IsNotEmpty()
  area: string;

  @IsString()
  @IsNotEmpty()
  department: string;

  @IsOptional()
  prerequisites?: string[];
}
