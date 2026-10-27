import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { GradeCondition } from '@unicen/shared';
import { EnrollmentEntity } from '../../enrollments/entities/enrollment.entity';

@Entity('grades')
export class GradeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  enrollmentId: string;

  @Column('float', { nullable: true })
  partial1: number | null;

  @Column('float', { nullable: true })
  partial2: number | null;

  @Column('float', { nullable: true })
  labs: number | null;

  @Column('float', { nullable: true })
  finalExam: number | null;

  @Column('float', { nullable: true })
  finalGrade: number | null;

  @Column('float', { nullable: true, default: 100 })
  attendancePercentage: number | null;

  @Column({
    type: 'varchar',
    default: GradeCondition.PENDIENTE,
  })
  condition: GradeCondition;

  @Column({ default: false })
  isClosed: boolean;

  @OneToOne(() => EnrollmentEntity, (enrollment) => enrollment.grade, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'enrollmentId' })
  enrollment: EnrollmentEntity;
}
