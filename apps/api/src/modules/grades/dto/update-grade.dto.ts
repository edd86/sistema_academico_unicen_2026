import {
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class UpdateGradeDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(25)
  partial1?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(25)
  partial2?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(20)
  labs?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(30)
  finalExam?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  attendancePercentage?: number | null;
}
