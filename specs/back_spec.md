Rol: Senior Backend Architect experto en NestJS, TypeScript, PostgreSQL y Testing automatizado con Jest y Supertest.

Objetivo:
Construir la API REST modular para el Sistema Académico UNICEN 2026 utilizando NestJS bajo el patrón MVC, PostgreSQL en Docker y una suite de pruebas obligatoria que valide la lógica de negocio y seguridad.

Requerimiento Obligatorio de Testing:
El proyecto debe incluir tests automatizados ejecutables con `npm run test` y `npm run test:e2e`:

1. Unit Tests críticos (`enrollments.service.spec.ts`):
   - Probar con mocks del Repository/QueryRunner:
     * Caso 1: Inscripción exitosa cuando hay cupo disponible y no hay duplicidad.
     * Caso 2: Debe lanzar `ConflictException` si el estudiante ya está registrado en el curso.
     * Caso 3: Debe lanzar `BadRequestException` si las inscripciones activas alcanzan el `cupo_maximo`.
     * Caso 4: Verificar rollback de la transacción en caso de fallo en BD.
2. Unit Tests de Seguridad (`roles.guard.spec.ts`):
   - Verificar que un usuario con rol `ESTUDIANTE` reciba `ForbiddenException` al intentar acceder a rutas restringidas para `DOCENTE` o `ADMIN` (ej. registro de notas).
3. Test E2E funcional (`auth-enrollment.e2e-spec.ts`):
   - Flujo básico: Login con usuario semilla -> obtención de token -> petición `POST /enrollments` validando código HTTP 201 y posterior 409 al reintentar la misma inscripción.

Entregables:
- Controladores, servicios, DTOs y entidades TypeORM/Prisma.
- Archivos `.spec.ts` unitarios y `.e2e-spec.ts`.
- `docker-compose.yml` funcional y script de base de datos con seeds.