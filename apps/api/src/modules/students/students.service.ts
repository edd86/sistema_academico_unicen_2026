import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '@unicen/shared';
import { StudentsRepository } from './students.repository';
import { UsersRepository } from '../users/users.repository';
import { CreateStudentDto } from './dto/create-student.dto';
import { StudentEntity } from './entities/student.entity';

@Injectable()
export class StudentsService {
  constructor(
    private readonly studentsRepo: StudentsRepository,
    private readonly usersRepo: UsersRepository,
  ) {}

  async findAll(): Promise<StudentEntity[]> {
    return this.studentsRepo.findAll();
  }

  async findById(id: string): Promise<StudentEntity> {
    const student = await this.studentsRepo.findById(id);
    if (!student) {
      throw new NotFoundException(`Estudiante con ID ${id} no encontrado`);
    }
    return student;
  }

  async findByUserId(userId: string): Promise<StudentEntity> {
    const student = await this.studentsRepo.findByUserId(userId);
    if (!student) {
      throw new NotFoundException(
        `Perfil estudiantil para usuario ${userId} no encontrado`,
      );
    }
    return student;
  }

  async create(dto: CreateStudentDto): Promise<StudentEntity> {
    const existingUser = await this.usersRepo.findByEmail(dto.email.trim());
    if (existingUser) {
      throw new ConflictException(
        `Ya existe un usuario registrado con el correo ${dto.email}`,
      );
    }

    const existingRu = await this.studentsRepo.findByRu(dto.ru.trim());
    if (existingRu) {
      throw new ConflictException(
        `Ya existe un estudiante registrado con el RU ${dto.ru}`,
      );
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(
      dto.password || 'Unicen2026*',
      salt,
    );

    const user = await this.usersRepo.create({
      email: dto.email.trim(),
      fullName: dto.fullName.trim(),
      password: passwordHash,
      role: UserRole.ESTUDIANTE,
      department: dto.career,
    });

    return this.studentsRepo.create({
      userId: user.id,
      ru: dto.ru.trim(),
      career: dto.career,
      studyPlan: dto.studyPlan,
      currentSemester: dto.currentSemester,
      academicStanding: 'Alumno Regular',
      cumulativeGpa: 80.0,
      completedCredits: 0,
      totalCreditsRequired: 210,
    });
  }
}
