import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import {
  UserRole,
  CourseModality,
  EnrollmentStatus,
  GradeCondition,
} from '@unicen/shared';
import { UserEntity } from '../modules/users/entities/user.entity';
import { StudentEntity } from '../modules/students/entities/student.entity';
import { SubjectEntity } from '../modules/subjects/entities/subject.entity';
import { CourseEntity } from '../modules/courses/entities/course.entity';
import { EnrollmentEntity } from '../modules/enrollments/entities/enrollment.entity';
import { GradeEntity } from '../modules/grades/entities/grade.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap() {
    await this.seedDatabase();
  }

  async seedDatabase() {
    const userRepo = this.dataSource.getRepository(UserEntity);
    const count = await userRepo.count();
    if (count > 0) {
      this.logger.log('Base de datos ya inicializada con semillas.');
      return;
    }

    this.logger.log('Iniciando carga de semillas UNICEN 2026...');
    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('Unicen2026*', salt);

    // 1. Usuarios
    const adminUser = userRepo.create({
      email: 'coordinacion.acad@unicen.edu.bo',
      password: defaultPasswordHash,
      fullName: 'Dra. Elena Valenzuela',
      role: UserRole.ADMIN,
      department: 'Coord. Académica • Fac. Ingeniería',
    });

    const teacherMendoza = userRepo.create({
      email: 'carlos.mendoza@unicen.edu.bo',
      password: defaultPasswordHash,
      fullName: 'Dr. Carlos Mendoza S.',
      role: UserRole.DOCENTE,
      department: 'Fac. Ingeniería y Ciencias',
    });

    const teacherSiles = userRepo.create({
      email: 'andrea.siles@unicen.edu.bo',
      password: defaultPasswordHash,
      fullName: 'MSc. Andrea Siles Ramos',
      role: UserRole.DOCENTE,
      department: 'Fac. Ingeniería y Ciencias',
    });

    const teacherJustiniano = userRepo.create({
      email: 'roberto.justiniano@unicen.edu.bo',
      password: defaultPasswordHash,
      fullName: 'Ing. Roberto Justiniano',
      role: UserRole.DOCENTE,
      department: 'Fac. Ingeniería y Ciencias',
    });

    const teacherBenitez = userRepo.create({
      email: 'claudia.benitez@unicen.edu.bo',
      password: defaultPasswordHash,
      fullName: 'Dra. Claudia Benítez P.',
      role: UserRole.DOCENTE,
      department: 'Fac. Ingeniería y Ciencias',
    });

    const studentMateoUser = userRepo.create({
      email: 'mateo.morales@unicen.edu.bo',
      password: defaultPasswordHash,
      fullName: 'Mateo Andrés Morales Soliz',
      role: UserRole.ESTUDIANTE,
      department: 'Ingeniería de Sistemas',
    });

    const studentMendozaUser = userRepo.create({
      email: 'carlos.mendoza.est@unicen.edu.bo',
      password: defaultPasswordHash,
      fullName: 'Carlos Ariel Mendoza Arce',
      role: UserRole.ESTUDIANTE,
      department: 'Ingeniería de Sistemas',
    });

    const studentQuispeUser = userRepo.create({
      email: 'sofia.quispe@unicen.edu.bo',
      password: defaultPasswordHash,
      fullName: 'Sofía Luciana Quispe Mamani',
      role: UserRole.ESTUDIANTE,
      department: 'Ingeniería de Sistemas',
    });

    const studentBalderramaUser = userRepo.create({
      email: 'mateo.balderrama@unicen.edu.bo',
      password: defaultPasswordHash,
      fullName: 'Mateo Balderrama Torrico',
      role: UserRole.ESTUDIANTE,
      department: 'Ingeniería de Sistemas',
    });

    const studentFernandezUser = userRepo.create({
      email: 'daniel.fernandez@unicen.edu.bo',
      password: defaultPasswordHash,
      fullName: 'Daniel Fernández Morales',
      role: UserRole.ESTUDIANTE,
      department: 'Ingeniería de Sistemas',
    });

    const studentGutierrezUser = userRepo.create({
      email: 'gabriela.gutierrez@unicen.edu.bo',
      password: defaultPasswordHash,
      fullName: 'Gabriela Gutiérrez Vargas',
      role: UserRole.ESTUDIANTE,
      department: 'Ingeniería de Sistemas',
    });

    await userRepo.save([
      adminUser,
      teacherMendoza,
      teacherSiles,
      teacherJustiniano,
      teacherBenitez,
      studentMateoUser,
      studentMendozaUser,
      studentQuispeUser,
      studentBalderramaUser,
      studentFernandezUser,
      studentGutierrezUser,
    ]);

    // 2. Estudiantes
    const studentRepo = this.dataSource.getRepository(StudentEntity);
    const studentMateo = studentRepo.create({
      userId: studentMateoUser.id,
      ru: 'RU-2023-01984',
      career: 'Ingeniería de Sistemas',
      studyPlan: 'Plan Curricular 2022',
      academicStanding: 'Alumno Regular',
      cumulativeGpa: 88.5,
      completedCredits: 58,
      totalCreditsRequired: 210,
      currentSemester: 5,
    });

    const studentMendoza = studentRepo.create({
      userId: studentMendozaUser.id,
      ru: 'RU-2023-09418',
      career: 'Ingeniería de Sistemas',
      studyPlan: 'Plan Curricular 2022',
      academicStanding: 'Alumno Regular',
      cumulativeGpa: 92.0,
      completedCredits: 64,
      totalCreditsRequired: 210,
      currentSemester: 5,
    });

    const studentQuispe = studentRepo.create({
      userId: studentQuispeUser.id,
      ru: 'RU-2023-11204',
      career: 'Ingeniería de Sistemas',
      studyPlan: 'Plan Curricular 2022',
      academicStanding: 'Alumno Regular',
      cumulativeGpa: 84.0,
      completedCredits: 60,
      totalCreditsRequired: 210,
      currentSemester: 5,
    });

    const studentBalderrama = studentRepo.create({
      userId: studentBalderramaUser.id,
      ru: 'RU-2022-07310',
      career: 'Ingeniería de Sistemas',
      studyPlan: 'Plan Curricular 2022',
      academicStanding: 'Condicional',
      cumulativeGpa: 47.0,
      completedCredits: 32,
      totalCreditsRequired: 210,
      currentSemester: 5,
    });

    const studentFernandez = studentRepo.create({
      userId: studentFernandezUser.id,
      ru: 'RU-2023-08819',
      career: 'Ingeniería de Sistemas',
      studyPlan: 'Plan Curricular 2022',
      academicStanding: 'Alumno Regular',
      cumulativeGpa: 76.0,
      completedCredits: 55,
      totalCreditsRequired: 210,
      currentSemester: 5,
    });

    const studentGutierrez = studentRepo.create({
      userId: studentGutierrezUser.id,
      ru: 'RU-2023-14902',
      career: 'Ingeniería de Sistemas',
      studyPlan: 'Plan Curricular 2022',
      academicStanding: 'Alumno Regular',
      cumulativeGpa: 91.0,
      completedCredits: 62,
      totalCreditsRequired: 210,
      currentSemester: 5,
    });

    await studentRepo.save([
      studentMateo,
      studentMendoza,
      studentQuispe,
      studentBalderrama,
      studentFernandez,
      studentGutierrez,
    ]);

    // 3. Materias (Subjects)
    const subjectRepo = this.dataSource.getRepository(SubjectEntity);
    const subSis301 = subjectRepo.create({
      code: 'SIS-301',
      name: 'Estructuras de Datos Avanzadas',
      credits: 5,
      semester: 5,
      area: 'Algoritmos & Complejidad',
      department: 'Ingeniería de Sistemas',
      prerequisites: ['SIS-201'],
    });

    const subSis305 = subjectRepo.create({
      code: 'SIS-305',
      name: 'Bases de Datos Relacionales II',
      credits: 4,
      semester: 5,
      area: 'Gestión de Información',
      department: 'Ingeniería de Sistemas',
      prerequisites: ['SIS-205'],
    });

    const subSis308 = subjectRepo.create({
      code: 'SIS-308',
      name: 'Ingeniería de Software I',
      credits: 4,
      semester: 5,
      area: 'Metodologías Ágiles',
      department: 'Ingeniería de Sistemas',
      prerequisites: ['SIS-201'],
    });

    const subMat204 = subjectRepo.create({
      code: 'MAT-204',
      name: 'Ecuaciones Diferenciales y Series',
      credits: 5,
      semester: 4,
      area: 'Ciencias Básicas',
      department: 'Matemática y Física',
      prerequisites: ['MAT-102'],
    });

    const subSis312 = subjectRepo.create({
      code: 'SIS-312',
      name: 'Arquitectura de Servidores y Cloud',
      credits: 4,
      semester: 6,
      area: 'Infraestructura & DevOps',
      department: 'Ingeniería de Sistemas',
      prerequisites: ['SIS-305'],
    });

    const subSis302 = subjectRepo.create({
      code: 'SIS-302',
      name: 'Arquitectura de Software',
      credits: 4,
      semester: 6,
      area: 'Ingeniería de Software',
      department: 'Ingeniería de Sistemas',
      prerequisites: ['SIS-308'],
    });

    const subMat301 = subjectRepo.create({
      code: 'MAT-301',
      name: 'Métodos Numéricos',
      credits: 4,
      semester: 5,
      area: 'Ciencias Básicas',
      department: 'Matemática y Física',
      prerequisites: ['MAT-204'],
    });

    const subSis201 = subjectRepo.create({
      code: 'SIS-201',
      name: 'Algoritmos I',
      credits: 5,
      semester: 3,
      area: 'Algoritmos & Complejidad',
      department: 'Ingeniería de Sistemas',
      prerequisites: [],
    });

    await subjectRepo.save([
      subSis301,
      subSis305,
      subSis308,
      subMat204,
      subSis312,
      subSis302,
      subMat301,
      subSis201,
    ]);

    // 4. Oferta de Cursos (Courses)
    const courseRepo = this.dataSource.getRepository(CourseEntity);

    // SIS-301 Paralelo A (Dr. Carlos Mendoza, 38/40 ocupados)
    const courseSis301A = courseRepo.create({
      subjectId: subSis301.id,
      term: '2026-I',
      parallel: 'Paralelo A',
      classroom: 'Aula Magna 204 (Edif. Central)',
      physicalCapacity: 45,
      maxCapacity: 40,
      enrolledCount: 5,
      modality: CourseModality.PRESENCIAL,
      teacherId: teacherMendoza.id,
      teacherName: 'Dr. Carlos Mendoza S.',
      teacherTitle: '4 hrs/sem • Tiempo Completo',
      days: 'Lun - Mié',
      startTime: '08:00',
      endTime: '10:00',
    });

    // SIS-301 Paralelo B (MSc. Andrea Siles, 22/40 ocupados)
    const courseSis301B = courseRepo.create({
      subjectId: subSis301.id,
      term: '2026-I',
      parallel: 'Paralelo B',
      classroom: 'Lab. Cómputo 3 (Pabellón B)',
      physicalCapacity: 40,
      maxCapacity: 40,
      enrolledCount: 0,
      modality: CourseModality.PRESENCIAL,
      teacherId: teacherSiles.id,
      teacherName: 'MSc. Andrea Siles Ramos',
      teacherTitle: '4 hrs/sem • Dedicación Parcial',
      days: 'Mar - Jue',
      startTime: '14:00',
      endTime: '16:00',
    });

    // SIS-305 Paralelo A (Lleno al 100%: 40/40)
    const courseSis305A = courseRepo.create({
      subjectId: subSis305.id,
      term: '2026-I',
      parallel: 'Paralelo A',
      classroom: 'Lab. Redes & Servidores 1',
      physicalCapacity: 40,
      maxCapacity: 40,
      enrolledCount: 40,
      modality: CourseModality.HIBRIDA,
      teacherId: teacherJustiniano.id,
      teacherName: 'Ing. Roberto Justiniano',
      teacherTitle: '6 hrs/sem • Tiempo Completo',
      days: 'Lun - Vie',
      startTime: '10:00',
      endTime: '12:00',
    });

    // SIS-308 Paralelo V1 (Dra. Claudia Benítez, 15/35 ocupados)
    const courseSis308V1 = courseRepo.create({
      subjectId: subSis308.id,
      term: '2026-I',
      parallel: 'Paralelo V1',
      classroom: 'Campus Virtual / Teams Sala 12',
      physicalCapacity: 50,
      maxCapacity: 35,
      enrolledCount: 0,
      modality: CourseModality.VIRTUAL_SINCRONICA,
      teacherId: teacherBenitez.id,
      teacherName: 'Dra. Claudia Benítez P.',
      teacherTitle: '4 hrs/sem • Tiempo Completo',
      days: 'Sábados',
      startTime: '08:00',
      endTime: '12:00',
    });

    // MAT-204 Paralelo C
    const courseMat204C = courseRepo.create({
      subjectId: subMat204.id,
      term: '2026-I',
      parallel: 'Paralelo C',
      classroom: 'Aula 310 (Pabellón Tecnológico)',
      physicalCapacity: 50,
      maxCapacity: 45,
      enrolledCount: 0,
      modality: CourseModality.PRESENCIAL,
      teacherName: 'Lic. Gonzalo Rojas',
      teacherTitle: '5 hrs/sem • Horario Libre',
      days: 'Mar - Jue',
      startTime: '07:00',
      endTime: '09:30',
    });

    // SIS-312 Paralelo A (Alta demanda: 32/35)
    const courseSis312A = courseRepo.create({
      subjectId: subSis312.id,
      term: '2026-I',
      parallel: 'Paralelo A',
      classroom: 'Lab. Redes & Servidores 2',
      physicalCapacity: 35,
      maxCapacity: 35,
      enrolledCount: 0,
      modality: CourseModality.HIBRIDA,
      teacherName: 'Ing. Mauricio Paz B.',
      teacherTitle: '4 hrs/sem • Tiempo Parcial',
      days: 'Mié - Vie',
      startTime: '18:30',
      endTime: '20:30',
    });

    // SIS-302 Paralelo 1 (Mar 10:15 - 12:15)
    const courseSis302_1 = courseRepo.create({
      subjectId: subSis302.id,
      term: '2026-I',
      parallel: 'Paralelo 1',
      classroom: 'Aula 201',
      physicalCapacity: 40,
      maxCapacity: 40,
      enrolledCount: 0,
      modality: CourseModality.PRESENCIAL,
      teacherId: teacherMendoza.id,
      teacherName: 'Dr. Carlos Mendoza S.',
      teacherTitle: '4 hrs/sem',
      days: 'Mar',
      startTime: '10:15',
      endTime: '12:15',
    });

    // MAT-301 Paralelo 1 (Mar 11:30 - 13:30 -> conflicto horario con SIS-302_1)
    const courseMat301_1 = courseRepo.create({
      subjectId: subMat301.id,
      term: '2026-I',
      parallel: 'Paralelo 1',
      classroom: 'Aula 302',
      physicalCapacity: 40,
      maxCapacity: 40,
      enrolledCount: 0,
      modality: CourseModality.PRESENCIAL,
      teacherName: 'Lic. Gonzalo Rojas',
      teacherTitle: '4 hrs/sem',
      days: 'Mar',
      startTime: '11:30',
      endTime: '13:30',
    });

    // Curso histórico 2025-II (SIS-201 Algoritmos I)
    const courseSis201Hist = courseRepo.create({
      subjectId: subSis201.id,
      term: '2025-II',
      parallel: 'Paralelo A',
      classroom: 'Aula 101',
      physicalCapacity: 40,
      maxCapacity: 40,
      enrolledCount: 1,
      modality: CourseModality.PRESENCIAL,
      teacherId: teacherMendoza.id,
      teacherName: 'Dr. Carlos Mendoza S.',
      teacherTitle: '4 hrs/sem',
      days: 'Lun - Mié',
      startTime: '08:00',
      endTime: '10:00',
    });

    await courseRepo.save([
      courseSis301A,
      courseSis301B,
      courseSis305A,
      courseSis308V1,
      courseMat204C,
      courseSis312A,
      courseSis302_1,
      courseMat301_1,
      courseSis201Hist,
    ]);

    // 5. Inscripciones y Notas para SIS-301 Paralelo A
    const enrollmentRepo = this.dataSource.getRepository(EnrollmentEntity);
    const gradeRepo = this.dataSource.getRepository(GradeEntity);

    // Inscripción histórica de Mateo Morales en SIS-201
    const enrMateoHist = enrollmentRepo.create({
      studentId: studentMateo.id,
      courseId: courseSis201Hist.id,
      term: '2025-II',
      status: EnrollmentStatus.CONFIRMADA,
    });
    await enrollmentRepo.save(enrMateoHist);
    const grMateoHist = gradeRepo.create({
      enrollmentId: enrMateoHist.id,
      partial1: 23,
      partial2: 24,
      labs: 19,
      finalExam: 25,
      finalGrade: 91,
      attendancePercentage: 100,
      condition: GradeCondition.APROBADO,
      isClosed: true,
    });
    await gradeRepo.save(grMateoHist);

    // 5 alumnos en SIS-301 Paralelo A
    const studentsInSis301 = [
      {
        student: studentMendoza,
        p1: 23,
        p2: 22,
        labs: 19,
        final: 28,
        grade: 92,
        condition: GradeCondition.APROBADO,
        att: 96,
      },
      {
        student: studentQuispe,
        p1: 21,
        p2: 19,
        labs: 18,
        final: 26,
        grade: 84,
        condition: GradeCondition.APROBADO,
        att: 92,
      },
      {
        student: studentBalderrama,
        p1: 12,
        p2: 10,
        labs: 11,
        final: 14,
        grade: 47,
        condition: GradeCondition.EN_RIESGO,
        att: 64,
      },
      {
        student: studentFernandez,
        p1: 18,
        p2: 20,
        labs: 16,
        final: 22,
        grade: 76,
        condition: GradeCondition.APROBADO,
        att: 88,
      },
      {
        student: studentGutierrez,
        p1: 24,
        p2: 23,
        labs: 19,
        final: 25,
        grade: 91,
        condition: GradeCondition.APROBADO,
        att: 100,
      },
    ];

    for (const item of studentsInSis301) {
      const enr = enrollmentRepo.create({
        studentId: item.student.id,
        courseId: courseSis301A.id,
        term: '2026-I',
        status: EnrollmentStatus.CONFIRMADA,
      });
      await enrollmentRepo.save(enr);

      const gr = gradeRepo.create({
        enrollmentId: enr.id,
        partial1: item.p1,
        partial2: item.p2,
        labs: item.labs,
        finalExam: item.final,
        finalGrade: item.grade,
        attendancePercentage: item.att,
        condition: item.condition,
        isClosed: false,
      });
      await gradeRepo.save(gr);
    }

    this.logger.log('Carga de semillas completada con éxito.');
  }
}
