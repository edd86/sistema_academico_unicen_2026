import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { SubjectsRepository } from './subjects.repository';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { SubjectEntity } from './entities/subject.entity';

@Injectable()
export class SubjectsService {
  constructor(private readonly subjectsRepo: SubjectsRepository) {}

  async findAll(): Promise<SubjectEntity[]> {
    return this.subjectsRepo.findAll();
  }

  async findById(id: string): Promise<SubjectEntity> {
    const subject = await this.subjectsRepo.findById(id);
    if (!subject) {
      throw new NotFoundException(`Materia con ID ${id} no encontrada`);
    }
    return subject;
  }

  async create(createSubjectDto: CreateSubjectDto): Promise<SubjectEntity> {
    const existing = await this.subjectsRepo.findByCode(
      createSubjectDto.code.toUpperCase().trim(),
    );
    if (existing) {
      throw new ConflictException(
        `Ya existe una materia registrada con el código ${createSubjectDto.code}`,
      );
    }

    return this.subjectsRepo.create({
      ...createSubjectDto,
      code: createSubjectDto.code.toUpperCase().trim(),
    });
  }
}
