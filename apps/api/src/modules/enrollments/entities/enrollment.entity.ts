import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { EnrollmentStatus } from '@unicen/shared';
import { StudentEntity } from '../../students/entities/student.entity';
import { CourseEntity } from '../../courses/entities/course.entity';
import { GradeEntity } from '../../grades/entities/grade.entity';

@Entity('enrollments')
@Unique(['studentId', 'courseId'])
export class EnrollmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  studentId: string;

  @Column()
  courseId: string;

  @Column({ default: '2026-I' })
  term: string;

  @Column({
    type: 'varchar',
    default: EnrollmentStatus.CONFIRMADA,
  })
  status: EnrollmentStatus;

  @CreateDateColumn()
  enrolledAt: Date;

  @ManyToOne(() => StudentEntity, (student) => student.enrollments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'studentId' })
  student: StudentEntity;

  @ManyToOne(() => CourseEntity, (course) => course.enrollments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'courseId' })
  course: CourseEntity;

  @OneToOne(() => GradeEntity, (grade) => grade.enrollment)
  grade: GradeEntity;
}
