---
name: git_push
description: Git workflow automation - groups changed files by feature, generates detailed conventional commit messages, handles conflicts, and pushes to GitHub. Use when user says "commit", "push", "subir cambios", "git push", "guardar cambios", or "push to github".
---

# Git Feature Push

Automates git workflow: detects changes, groups by feature path, generates detailed conventional commit messages based on inspectable diffs/context, handles upstream conflicts, and pushes to GitHub.

## Trigger Phrases

Activate this skill when the user says any of:

- "commit", "commit y push", "push", "push to github"
- "subir cambios", "subir a github", "subir los cambios", "guardar"
- "git feature", "git push", "guardar cambios", "hacer commit"

## Step-by-Step Workflow

### Step 1: Pre-flight & Remote Verification

1. **Check if Git repo is initialized**:
   - `git rev-parse --is-inside-work-tree`
   - If not initialized: run `git init` and `git branch -M main`.
2. **Check if it is the first commit**:
   - `git rev-parse --verify HEAD` (fails / non-zero exit if repository has no commits yet -> `is_first_commit = true`).
3. **Check Remote URL (`origin`)**:
   - `git remote get-url origin`
   - **If no remote is configured (or if it's the first commit and remote is missing)**:
     - Ask the user: *"Es el primer commit / no se detectó repositorio remoto. Por favor proporciona la URL del repositorio (ej. https://github.com/usuario/repo.git):"*
     - Wait for user input.
     - Once provided: `git remote add origin <url>` (or `git remote set-url origin <url>` if it already existed).
4. `git branch --show-current` — get current branch (defaults to `main` if unset).
5. `git status --porcelain` — detect all changed files.
6. If not first commit: `git log --oneline -5` — recent commits for style reference.

If no changes (empty porcelain), tell user "No hay cambios para commitear" and stop.

### Step 2: Conflict check & pull (Skip if First Commit)

**If `is_first_commit` is true or remote branch does not exist yet:**
- Skip pull and rebase, proceed directly to Step 3.

**Otherwise:**
1. `git fetch origin`
2. `git status` — check if behind remote
3. If behind: `git pull --rebase origin <branch>`
   - Success → continue
   - Conflict → `git rebase --abort`, tell user "Hay conflictos con el remoto. Resuelve manualmente con git pull." and stop.

### Step 3: Analyze & group changes

Parse each line of `git status --porcelain`:

**Porcelain format:** `XY <filepath>`

- `X` = index status (staging area)
- `Y` = working tree status
- `??` = untracked file

**A) Feature group** by path (dynamic scope extraction - generic for Web, Mobile, and Backend):

| Path Pattern                                                                                                   | Scope / Group Name                    | Description / Examples |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ---------------------- |
| `src/features/<feature>/...`, `lib/features/<feature>/...`, `app/(routes)/<feature>/...`, `modules/<feature>/...` | `<feature>`                           | Feature modules (e.g. `auth`, `checkout`, `chat_import`) |
| `src/components/<component>/...`, `components/...`, `lib/widgets/...`                                         | `<component>` or `ui`                 | Reusable UI components or widgets |
| `src/pages/<page>/...`, `pages/<page>/...`, `app/<route>/page.*`, `lib/screens/<screen>/...`                   | `<page>` or `views`                   | Route pages, screens, or views |
| `src/core/...`, `lib/core/...`, `core/...`                                                                     | `core`                                | Core utilities, base classes, network engine |
| `src/shared/...`, `lib/shared/...`, `shared/...`, `utils/...`, `helpers/...`, `common/...`                     | `shared`                              | Common utilities, constants, shared types |
| `src/services/...`, `lib/services/...`, `api/...`, `src/api/...`                                               | `services` or `api`                   | Backend services, API clients, endpoints |
| `src/store/...`, `lib/bloc/...`, `state/...`, `context/...`, `stores/...`                                      | `state` or `store`                    | State management (Zustand, Redux, Riverpod, Bloc) |
| `src/App.*`, `src/main.*`, `pages/_app.*`, `app/layout.*`, `lib/main.dart`                                     | `app`                                 | Main application entry point & root layout |
| `prisma/...`, `supabase/...`, `db/...`, `migrations/...`, `.database/`, `models/...`                           | `database`                            | DB schemas, migrations, seeds, or ORM models |
| `assets/...`, `public/...`, `static/...`, `res/...`                                                            | `assets`                              | Static assets, images, icons, fonts |
| `tests/...`, `test/...`, `__tests__/...`, `*.test.*`, `*.spec.*`, `*_test.*`                                   | `test`                                | Unit, component, or E2E tests |
| Config files (`package.json`, `pubspec.yaml`, `tsconfig.*`, `vite.config.*`, `next.config.*`, `Dockerfile`, etc.) | `config` or `deps`                    | Project config, build tools, package manifests |
| Markdown docs (`README.md`, `docs/...`)                                                                        | `docs`                                | Documentation files |
| Everything else                                                                                                | Top-level directory or `config`       | Fallback |

**B) Commit type** by change content & intent:

| Condition                                               | Type             |
| ------------------------------------------------------- | ---------------- |
| New feature, screen, component, or capability           | `feat`           |
| Bug fix or correction                                   | `fix`            |
| Code restructuring, cleanup, or removal                 | `refactor`       |
| Performance improvements                                | `perf`           |
| Package manifests (`package.json`, `pubspec.yaml`, etc.) | `chore` or `deps`|
| Database migrations or SQL schemas                      | `fix` / `feat`   |
| Test files or test suites                               | `test`           |
| Markdown docs (`.md`)                                   | `docs`           |
| CI/CD, build configs, tool scripts                      | `ci` / `chore`   |
| Default                                                 | `chore`          |

**C) Detailed Message Generation (CRITICAL)**

Before generating the message for a group, **inspect the actual diff** using `git diff <files>` or review the session context to understand **what** changed and **why**.

#### Rules for Commit Messages:
1. **NEVER use generic descriptions** like `update <group> module`, `fix files`, `changes`, or `work in progress`.
2. **Be specific and descriptive**: Specify exact components, widgets, methods, fields, hooks, or UI elements modified.
3. **Structure**: `<type>(<scope>): <detailed action & context>`
4. **Multi-line Body (Optional for complex changes)**: If a group has multiple distinct changes, add a second `-m` argument detailing key points.

#### Patterns & Examples:

- **Web / UI Component Update:**
  `feat(auth): add google sign-in button and oauth callback handler in login form`
- **Mobile / Screen & State Update:**
  `feat(chat_import): add whatsapp export instructions without media in upload dropzone`
- **Domain & UI Refactoring:**
  `refactor(dashboard): remove audio count statistics and replace audio king card with top writer`
- **Fixing Logic / API Parsers:**
  `fix(api): correct regex parsing for exported timestamps and handle null payload edge case`
- **Adding Tests:**
  `test(chat_import): add unit test coverage for zip extractor edge cases`
- **Dependencies / Config:**
  `chore(deps): update react-router and tailwindcss dependencies to latest version`

#### Complex Change Example with Body:
```bash
git commit -m "refactor(chat_dashboard): remove audio statistics and update social roles UI" -m "- Remove audioCount and totalAudios from MessageAnalysis model
- Replace Audio vs Writer card with dedicated Writer card in social roles section
- Update Chat Wrapped dialog to feature El Mas Popular instead of Rey del Audio"
```

### Step 4: Stage & commit by group

Process groups in logical dependency order (e.g. `core`, `database`, `shared`, `ui`, feature groups in alphabetical order, `app`, `config`).

For each group:

1. `git add <file1> <file2> ...`
2. Run `git diff --staged` or inspect diff if detail needs verification.
3. `git commit -m "<type>(<scope>): <detailed_subject>" [-m "<optional_body_bullet_points>"]`

### Step 5: Push

1. **If first commit or branch has no upstream set**:
   - `git push -u origin <branch>`
2. **Normal push**:
   - `git push origin <branch>`
3. **If push fails with non-fast-forward**:
   - `git pull --rebase origin <branch>`
   - Success → `git push origin <branch>`
   - Conflict → `git rebase --abort`, tell user "Push rechazado. Resuelve los conflictos manualmente."

### Step 6: Report

Show concise summary:

```
✅ N commits pushed to origin/<branch>

  1. <type>(<scope>): <detailed_description>
  2. <type>(<scope>): <detailed_description>
  ...
```

## Rules

- NEVER use `git push --force` or `git push -f`
- NEVER commit `.env`, secrets, or API keys
- ALWAYS ask for the repository remote URL if no remote is configured or if it's the first commit without remote
- ALWAYS use conventional commit format (`<type>(<scope>): <message>`)
- ALWAYS create **detailed, specific** commit messages explaining the change (NO generic "update module" text)
- ALWAYS show the push summary
- If user provides a custom message, use their detail while maintaining conventional commit format
- Skip empty groups (no files to add)
- One commit per feature group, never mix features in the same commit
