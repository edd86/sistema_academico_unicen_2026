import { GradeCondition } from '@unicen/shared';

export interface GradeInput {
  partial1?: number | null;
  partial2?: number | null;
  labs?: number | null;
  finalExam?: number | null;
  attendancePercentage?: number | null;
}

export interface CalculatedGradeResult {
  finalGrade: number | null;
  condition: GradeCondition;
}

export const GRADING_STRATEGY = 'GRADING_STRATEGY';

export interface IGradingStrategy {
  calculate(input: GradeInput): CalculatedGradeResult;
}
