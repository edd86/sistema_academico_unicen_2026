import { Injectable } from '@nestjs/common';
import { GradeCondition, MIN_PASSING_GRADE } from '@unicen/shared';
import {
  IGradingStrategy,
  GradeInput,
  CalculatedGradeResult,
} from './grading.strategy.interface';

@Injectable()
export class StandardUnicenGradingStrategy implements IGradingStrategy {
  calculate(input: GradeInput): CalculatedGradeResult {
    const { partial1, partial2, labs, finalExam } = input;

    // Si no se ha cargado ninguna nota aún, queda PENDIENTE
    if (
      partial1 == null &&
      partial2 == null &&
      labs == null &&
      finalExam == null
    ) {
      return {
        finalGrade: null,
        condition: GradeCondition.PENDIENTE,
      };
    }

    const p1 = partial1 != null ? Number(partial1) : 0;
    const p2 = partial2 != null ? Number(partial2) : 0;
    const lb = labs != null ? Number(labs) : 0;
    const fe = finalExam != null ? Number(finalExam) : 0;

    // Suma directa ponderada de rubros (25 + 25 + 20 + 30 = 100)
    const finalGrade = Math.round(p1 + p2 + lb + fe);

    // Condición semántica
    let condition: GradeCondition;
    if (finalGrade >= MIN_PASSING_GRADE) {
      condition = GradeCondition.APROBADO;
    } else if (finalGrade >= 40) {
      condition = GradeCondition.EN_RIESGO;
    } else {
      condition = GradeCondition.REPROBADO;
    }

    return {
      finalGrade,
      condition,
    };
  }
}
