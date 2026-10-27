import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { CourseModality } from '@unicen/shared';
import { SubjectEntity } from '../../subjects/entities/subject.entity';
import { EnrollmentEntity } from '../../enrollments/entities/enrollment.entity';

@Entity('courses')
export class CourseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  subjectId: string;

  @Column({ default: '2026-I' })
  term: string;

  @Column()
  parallel: string;

  @Column()
  classroom: string;

  @Column('int', { default: 45 })
  physicalCapacity: number;

  @Column('int', { default: 40 })
  maxCapacity: number;

  @Column('int', { default: 0 })
  enrolledCount: number;

  @Column({
    type: 'varchar',
    default: CourseModality.PRESENCIAL,
  })
  modality: CourseModality;

  @Column({ nullable: true })
  teacherId: string;

  @Column({ nullable: true })
  teacherName: string;

  @Column({ nullable: true })
  teacherTitle: string;

  @Column({ default: 'Lun - Mié' })
  days: string;

  @Column({ default: '08:00' })
  startTime: string;

  @Column({ default: '10:00' })
  endTime: string;

  @ManyToOne(() => SubjectEntity, (subject) => subject.courses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subjectId' })
  subject: SubjectEntity;

  @OneToMany(() => EnrollmentEntity, (enrollment) => enrollment.course)
  enrollments: EnrollmentEntity[];
}
