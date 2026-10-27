import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { EnrollmentEntity } from '../../enrollments/entities/enrollment.entity';

@Entity('students')
export class StudentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ unique: true })
  ru: string;

  @Column({ default: 'Ingeniería de Sistemas' })
  career: string;

  @Column({ default: 'Plan Curricular 2022' })
  studyPlan: string;

  @Column({ default: 'Alumno Regular' })
  academicStanding: string;

  @Column('float', { default: 85.0 })
  cumulativeGpa: number;

  @Column('int', { default: 50 })
  completedCredits: number;

  @Column('int', { default: 210 })
  totalCreditsRequired: number;

  @Column('int', { default: 5 })
  currentSemester: number;

  @OneToOne(() => UserEntity, (user) => user.student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @OneToMany(() => EnrollmentEntity, (enrollment) => enrollment.student)
  enrollments: EnrollmentEntity[];
}
