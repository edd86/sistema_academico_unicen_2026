import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateStudentDto {
  @IsEmail({}, { message: 'Debe ser un correo institucional válido (@unicen.edu.bo)' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsString()
  @IsNotEmpty()
  ru: string;

  @IsString()
  @IsNotEmpty()
  career: string;

  @IsString()
  @IsNotEmpty()
  studyPlan: string;

  @IsInt()
  @Min(1)
  currentSemester: number;
}
