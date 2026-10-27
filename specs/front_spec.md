Rol: Senior Frontend Engineer experto en React 19, TypeScript, Clean Architecture y Testing (Vitest + React Testing Library).

Objetivo:
Implementar el cliente web para el Sistema Académico UNICEN 2026 bajo Clean Architecture por Features, incluyendo una suite de pruebas automatizadas enfocada en la lógica crítica.

Reglas de Arquitectura:
Organizar en `src/features/<feature-name>/` dividiendo en `domain/`, `application/`, `infrastructure/`, y `presentation/`.

Requerimiento Obligatorio de Testing (Vitest + Testing Library):
Para asegurar la calidad en la prueba técnica, implementa obligatoriamente:
1. Unit Tests de Dominio / Casos de uso (`application/`):
   - Test para la función/hook de validación de inscripción (verificar que impida continuar si `cuposDisponibles <= 0` o si la materia ya está en la lista de seleccionadas).
2. Integration Tests de Componentes (`presentation/`):
   - Test para el formulario de login: comprobar renderizado de errores ante credenciales inválidas y redirección según rol.
   - Test para la vista de calificaciones: verificar que el input de notas solo sea editable si el rol autenticado es `DOCENTE` o `ADMIN`.
3. Configuración lista para ejecutar:
   - Incluir configuración de `vitest.config.ts`, `setupTests.ts` y script en `package.json` (`npm run test`).

Entregables:
- Código estructurado por capas y features.
- Archivos `*.test.tsx` o `*.spec.ts` ubicados junto al módulo correspondiente o en carpetas `__tests__`.
- Mocks listos para llamadas HTTP (MSW o vi.mock de Axios).