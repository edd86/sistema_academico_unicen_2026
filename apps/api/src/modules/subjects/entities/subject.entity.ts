import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { CourseEntity } from '../../courses/entities/course.entity';

@Entity('subjects')
export class SubjectEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column('int')
  credits: number;

  @Column('int')
  semester: number;

  @Column()
  area: string;

  @Column()
  department: string;

  @Column('simple-array', { nullable: true })
  prerequisites: string[];

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => CourseEntity, (course) => course.subject)
  courses: CourseEntity[];
}
