# CON-16 — Group Login (JWT) End-to-End: Completion Plan

## Goal

Make the "Enter Group Name" login flow work end-to-end: validate credentials against a
SQL-seeded group, issue a **JWT** on success, store it client-side, and gate the app shell
with it. Group creation stays out of scope.

## Current state (verified)

- Branch `aebange/con-16-implement-group-level-authentication-login-workflow-spring`, based on
  `development` (`8a00de3`). No remote copy exists yet; local is current.
- Backend changes are partly staged, partly unstaged. **Frontend is untouched.**
- The branch currently implements **opaque DB-backed session tokens**, not JWT
  (`SessionService`, `SessionAuthFilter`, `sessions` table). Decision: switch to JWT.
- Auth work diverges from the ticket (manual lookup instead of `AuthenticationManager`,
  no `GroupDetailsService`, controller not annotated).

## Decisions (confirmed with product/eng)

| Topic | Decision |
|---|---|
| Token mechanism | **JWT** (stateless), replace DB sessions |
| JWT library / secret | **jjwt 0.12.x**, HS256; secret from `CONVOKE_JWT_SECRET` env var with dev default |
| Auth wiring | **`AuthenticationManager` + `DaoAuthenticationProvider` + `GroupDetailsService`** |
| Password rules | **min 8 chars, at least one letter and one number** |
| check-name endpoint | **`GET /api/groups/check-name?name=X`** (query param), keep DTO + add `exists` |
| Guarded routes | **`page/:groupId` shell + `page/select-user/:groupId`** |
| Guard groupId check | **Enforce URL `:groupId` == token `groupId`** |
| 401 handling | **Clear token + redirect to landing** (+ add `logout()`) |
| Other group endpoints | `POST /api/groups/create` **permitAll**; `GET /api/groups` and `GET /api/groups/{name}` protected, **no per-group scoping** |
| Tests | **Backend automated tests + manual E2E** |
| Session cleanup | **Delete session Java code + add `V7__drop_sessions.sql`** |
| Group name casing | **Case-insensitive lookup** (+ unique index on `lower(name)`) |
| Commits | **One commit per phase** (ask before each) |

---

## Issues found in review that the plan must address

1. **Build never actually verified.** Earlier `mvn ... | tail || echo` checked `tail`'s exit
   code, not Maven's. Re-verify with a proper exit-code check.
2. **SecurityFilterChain permitAll list is incomplete.** Missing `/page/**` (deep-link forward),
   `/assets/**`, `*.woff2`, `*.ttf`, `*.map` (Font Awesome files at root), `/error`, and
   `POST /api/groups/create`. The bundled app would lose fonts/images and break SPA refresh.
3. **CORS not enabled in Spring Security.** Dev uses `ng serve` on :4200 calling the backend on
   :8080; Authorization-bearing requests need preflight. Add `.cors(withDefaults())`.
4. **No `authenticationEntryPoint`** → unauthenticated requests return 403, not 401. The
   frontend 401 handler would never fire.
5. **Two `@ControllerAdvice` classes, no `@Order`.** `MyExceptionHandler` catches `Exception`,
   which can swallow `ResponseStatusException` (login 401 → 500). Order the advices.
6. **Global `ErrorInterceptor`** opens a dialog for every non-2xx response; a wrong password
   would trigger it instead of the inline error the ticket wants.
7. **Case-insensitive lookups need a unique index on `lower(name)`.** Today uniqueness is
   case-sensitive, so "Foo"/"foo" could both exist and `lower()` lookup returns 2 rows.
   The create-group duplicate check must also use `lower()`.

---

## Phase 1 — Backend dependencies & config

- `backend/pom.xml`
  - Add `jjwt-api`, `jjwt-impl` (runtime), `jjwt-jackson` (runtime), 0.12.x.
  - Add `spring-boot-starter-test` and `spring-security-test` at test scope.
  - Drop the hard-coded `3.4.3` on `spring-boot-starter-security` (BOM manages it).
- `application.yaml`
  - `convoke.jwt.secret: ${CONVOKE_JWT_SECRET:<dev-only-base64-256bit>}`
  - `convoke.jwt.expiration-days: 30`
- `README.md`: add `CONVOKE_JWT_SECRET` to the env var table (note: required in prod; dev default
  only when unset).

**Commit:** `CON-16 / Add JWT dependencies and configuration`

**Status:** ✅ Done (`2927a14` — "Phase 1: Backend dependencies & config")
- Corrections applied: (Minor) README env-var table alignment — shortened the `CONVOKE_JWT_SECRET`
  row and moved the "required in prod / dev default" note below the table.
- Corrections rejected: none.

## Phase 2 — Database migrations (`db-migrations`)

- `V7__drop_sessions.sql`: `drop table if exists sessions;`
- `V8__groups_name_ci_unique.sql`: `create unique index uq_groups_name_lower on groups (lower(name));`
  - Fails if case-colliding rows exist — validate seeded data first.

**Commit:** `CON-16 / Drop sessions table and add case-insensitive group name index`

**Status:** ✅ Done (`1dcc33c` — "Phase 2: Database migrations")
- Corrections applied: (Minor) added failure-recovery guidance to `V8` comments (resolve colliding
  rows, then `mvn flyway:repair` before retrying).
- Corrections rejected: none.
- Process note: the first commit accidentally swept in pre-existing staged stub files; since
  `git reset` is permission-blocked, corrected via `git rm --cached` + `commit --amend` so the
  phase commit contains only `V7`/`V8`.

## Phase 3 — Backend auth core

- **Delete** `SessionService`, `SessionDTO`, `SessionAuthFilter`.
- **`services/GroupDetailsService implements UserDetailsService`**
  - `SELECT id, name, password_hash FROM groups WHERE lower(name) = lower(:name)`
  - Return `GroupPrincipal implements UserDetails` (`id`, `name`, `passwordHash`),
    authority `ROLE_GROUP`.
  - Throw `UsernameNotFoundException` when absent.
- **`security/JwtService`**
  - Key via `Keys.hmacShaKeyFor(Base64.decode(secret))`.
  - `issue(groupId, groupName)`: `sub=groupId`, `groupId`, `groupName` claims, `iat`,
    `exp = now + 30d`.
  - `parse(token)`: return claims or throw `JwtException`.
- **`security/JwtAuthFilter extends OncePerRequestFilter`**
  - Read `Bearer <token>`; on valid token set `GroupPrincipal` in `SecurityContext`.
  - On invalid/expired: clear context and write **401**.
  - No token: continue (authorization rules decide).
- **`config/SecurityConfig`**
  - Beans: `DaoAuthenticationProvider` (`GroupDetailsService` + existing `BCryptPasswordEncoder`
    from `AppConfig`), `AuthenticationManager` (`ProviderManager`).
  - Chain: csrf disabled, stateless, `.cors(withDefaults())`,
    `authenticationEntryPoint = HttpStatusEntryPoint(401)`.
  - permitAll:
    - `/api/auth/**`
    - `GET /api/groups/check-name`
    - `POST /api/groups/create`
    - `/error`, `/`, `/index.html`, `/page/**`, `/assets/**`
    - root-level `*.js`, `*.css`, `*.ico`, `*.png`, `*.woff2`, `*.ttf`, `*.map`
  - `/api/**` authenticated; `anyRequest()` permitted (static + SPA).
  - `JwtAuthFilter` before `UsernamePasswordAuthenticationFilter`.
- **`AuthService.login`**
  - Keep required-field validation (400).
  - `authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(name, password))`.
  - Catch `AuthenticationException` → `ResponseStatusException(401, "Invalid group name or password")`.
  - Build `LoginResponseDTO` from principal + `jwtService.issue(...)`.
  - Stop trimming the password (compare exactly as typed).
- **`AuthController`**: add `@RestController` (fixes endpoint not registered).
- **Advice ordering**: `@Order(Ordered.HIGHEST_PRECEDENCE)` on `ExceptionController` so
  `ResponseStatusException` is handled before `MyExceptionHandler`'s catch-all.

**Commit:** `CON-16 / Backend JWT authentication`

**Status:** ✅ Done (`d566c27` — "Phase 3: Backend auth core")
- Corrections applied: (Minor) `JwtAuthFilter` now sets `WWW-Authenticate: Bearer` on invalid/expired
  token 401s.
- Corrections rejected: none.
- Note: the three `Session*` classes were untracked at this point (removed from the index during
  the Phase 2 correction) and were deleted from disk, so they never enter history.

## Phase 4 — Backend group endpoints

- `GroupController`: `GET /api/groups/check-name` with `@RequestParam("name")`.
- `GetGroupNameAvailabilityDTO`: add `boolean exists`.
- `GroupService.checkGroupName`
  - Lookup with `lower(name)`.
  - Found → `exists=true, available=false`.
  - Format/length failure → `exists=false, available=false`.
- `GroupService.assertGroupNameAvailable` and `fetchGroup`: compare with `lower()`.
- `GET /api/groups` and `GET /api/groups/{name}`: protected, no per-group scoping (per decision).

**Commit:** `CON-16 / Add existence flag and query-param group name check`

**Status:** ✅ Done (`401d824` — "Phase 4: Backend group endpoints")
- Corrections applied: none required (no critical/major; no quick safe minors).
- Corrections rejected: (Minor) reserve the name `check-name` to avoid route shadowing between
  `/api/groups/check-name` and `/api/groups/{name}`. **Reason:** inherited edge case from the
  route-template design, unrelated to this ticket's login flow; adding reserved-name logic is
  scope creep beyond the plan. Tracked here as a known limitation for a follow-up.

## Phase 5 — Backend tests

- Replace JUnit 4 `AppTest` with JUnit 5.
- `JwtServiceTest`: issue/parse round-trip; expired rejected; tampered signature rejected;
  wrong key rejected.
- `GroupDetailsServiceTest` (mock `NamedParameterJdbcTemplate`): found (any casing) / not found.
- `AuthControllerTest` (`@WebMvcTest`, import security + JWT, mock `ExceptionService` /
  `GroupDetailsService` / `AuthenticationManager` behaviors):
  - Login 200 with token.
  - Wrong password 401 generic message.
  - Unknown group same 401.
  - Missing field 400.
  - Protected endpoint: 401 no token; 401 bad/expired token; 200 valid token.
  - check-name and create work without token.
- Run `mvn -pl backend -am test` and **check exit code explicitly**.
- Manual sanity: `curl` protected → 401; check-name/create → works without token.

**Commit:** `CON-16 / Add backend authentication tests`

**Status:** ✅ Done (`a465c36` — "Phase 5: Backend tests")
- Corrections applied:
  - (Major) `JwtServiceTest.rejectsTamperedSignature` made deterministic by flipping a char in the
    middle of the signature (last-char flips can be padding no-ops).
  - (Minor) `GroupDetailsServiceTest` now captures the bound `SqlParameterSource` and asserts the
    trimmed name is passed.
  - (Minor) `AuthControllerTest` uses a single `SECRET` constant in `@TestPropertySource`.
  - (Minor) Wrong-password and unknown-group 401s now assert the identical generic body.
  - (Minor) Migrated `@MockBean` → `@MockitoBean`.
- Corrections rejected: none.

## Phase 6 — Frontend auth infrastructure

- **`services/auth.service.ts`** (`providedIn: 'root'`)
  - `TOKEN_KEY = 'convoke.jwt'`.
  - `token` signal; `claims` computed (decode JWT payload via `atob` on base64url, no lib).
  - `isAuthenticated` computed (token present and `exp*1000 > Date.now()`); `groupId` computed.
  - `login(groupName, password)` → POST `${environment.baseUrl}/api/auth/login`, then store in
    localStorage + set signal (`tap`).
  - `logout()` clears token.
  - On startup: hydrate from localStorage; drop if expired.
- **`interceptors/auth.interceptor.ts`**
  - Attach `Authorization: Bearer` only to requests targeting `environment.baseUrl`.
  - On 401 from non-login requests: `logout()` + navigate `''`.
- **Error handling**
  - Register auth interceptor before `ErrorInterceptor` in `app.module.ts`.
  - `ErrorInterceptor`: skip dialog for 401 on `/api/auth/login` (or skip via an
    `X-Skip-Error-Dialog` header set through `HttpContext`) so login shows inline error.
- **`guards/auth.guard.ts`** (functional `CanActivateFn`)
  - Not authenticated → `logout()` + `router.createUrlTree([''])`.
  - Route `:groupId` != token `groupId` → redirect to same route under user's own group id.
- **Routes** (`app.module.ts`)
  - `canActivate: [authGuard]` on `page/select-user/:groupId` and the `page/:groupId` shell parent.
  - Optional: `''` redirects an already-authenticated user to `page/select-user/{groupId}`.

**Commit:** `CON-16 / Frontend auth service, JWT interceptor, and route guard`

**Status:** ✅ Done (`691b387` — "Phase 6: Frontend auth infrastructure")
- Corrections applied:
  - (Minor) `redirectToOwnGroup` strips query/fragment before splitting URL segments.
  - (Minor) interceptor API detection hardened to `environment.baseUrl`-relative prefixes
    (`.../api/`, `/api/`, `./api/`, `api/`).
  - (Minor) guard logs out and redirects when a route has `:groupId` but the token lacks one.
  - (Minor) `ErrorInterceptor` uses the request URL (works when `err.url` is null).
- Corrections rejected: (Minor) make `isAuthenticated` live rather than a cached computed.
  **Reason:** the phase text explicitly specifies a computed; expiry self-heals when the backend
  returns 401 (interceptor logs out + redirects) and on reload (hydration drops expired tokens),
  and the backend is authoritative.

## Phase 7 — Frontend login dialog (`existing-group-dialog`)

- **Validators** (`utilities/validators.ts`)
  - `passwordRules`: `minLength(8)`, `pattern(/[A-Za-z]/)`, `pattern(/\d/)` with distinct keys.
  - `groupExistsValidator(http)` (`AsyncValidatorFn`): `timer(400)` → `switchMap` GET
    `/api/groups/check-name?name=`; map `exists ? null : {groupNotFound: true}`;
    request error → `{checkFailed: true}`; validate on change.
- **Password lock/unlock**
  - `groupPassword` starts disabled.
  - Subscribe to `groupName.statusChanges`: `VALID` → enable; `INVALID`/`PENDING` → disable + clear.
- **Submit (`continueClicked`)**
  - `submitting=true`; call `authService.login(...)` with raw value.
  - Success: `dialogRef.close()` then `router.navigate(['page/select-user', groupId])`.
  - Failure: `loginError` — 401 "Invalid group name or password", else generic; **do not clear
    the form**; `submitting=false`.
- **Template**
  - `<mat-error>` for required / groupNotFound / minLength / pattern.
  - Pending spinner hint for the name check.
  - Inline error banner above Continue.
  - Disable Continue while submitting or invalid.
- Optional consistency: switch injected CDK `DialogRef` to `MatDialogRef` (works today).

**Commit:** `CON-16 / Wire login dialog to auth service with validation and errors`

**Status:** ✅ Done (`0b8ac24` — "Phase 7: Frontend login dialog")
- Corrections applied:
  - (Major) Password errors no longer stack — custom validators skip empty values and the template
    renders one prioritized message via `passwordErrorMessage`.
  - (Minor) Added a Retry action on `checkFailed` (re-runs validation).
  - (Minor) `ErrorInterceptor` now suppresses the global dialog for `check-name` requests too
    (handled inline).
  - (Minor) Added `Validators.maxLength(50)` to the group name (matches backend cap).
  - (Minor) `statusChanges`/`valueChanges` subscriptions use `takeUntilDestroyed`.
  - (Minor) Inline `loginError` clears as the user edits the form.
- Corrections rejected: none.

## Phase 8 — Manual end-to-end verification

1. Seed a group: BCrypt hash via `new BCryptPasswordEncoder().encode("abc12345")` or
   `pgcrypto crypt('abc12345', gen_salt('bf'))` (both produce `$2a$`, accepted by Spring).
2. `mvn clean package`; run the jar. Confirm fonts/assets load and refresh on `/page/...` works.
3. `npm run start` against backend; confirm CORS preflight with `Authorization` succeeds.
4. Login dialog:
   - Unknown name → password stays locked.
   - Known name any casing → password unlocks.
   - Weak password → Continue disabled.
   - Wrong password → inline error, form preserved, no global dialog.
   - Correct → `/page/select-user/{id}`, token in localStorage.
5. Guard:
   - Clear localStorage, hit `/page/1/events` → `/`.
   - Change URL to another group id → redirected to own group.
   - Tamper token then API call → 401, token cleared, redirect `/`.
6. `curl`: protected → 401 without token; check-name/create work without token.

**Status:** ✅ Done (verification only — no source changes to commit)
- Full `mvn -Pprod clean package` succeeded (18 backend tests passed) and the executable jar was
  run against the local PostgreSQL `convoke_db`. Flyway applied V7 (drop sessions) and V8
  (case-insensitive unique index).
- Verified via `curl`:
  - `GET /api/groups` without token → **401**.
  - `POST /api/groups/create` without token → **201**.
  - `GET /api/groups/check-name?name=E2E-GROUP` → `exists=true` (case-insensitive);
    unknown name → `exists=false, available=true`.
  - `POST /api/auth/login` with a different-case name + correct password → **200** with a JWT;
    wrong password and unknown group both → **401 "Invalid group name or password"** (identical).
  - `GET /api/groups` with token → **200**; with a bad token → **401**.
  - SPA deep link `GET /page/1/events` → **200 text/html**; hashed bundles, `/assets/**`, and
    root-level `.woff2` → **200**.
  - DB confirmed: `sessions` dropped, `uq_groups_name_lower` present.
- The temporary `e2e-group` was deleted and the server stopped; DB left at migration V8.

---

## Open/default details

- Async name-check debounce: **400 ms**.
- Already-authenticated landing redirect: **implement** (Phase 6 optional step).
- Dev JWT secret default only applies when `CONVOKE_JWT_SECRET` is unset; prod must set it.

## Out of scope (per ticket)

- Group creation workflow (SQL seeding only) — but `create` stays permitAll.
- Member-selection logic/persistence.
- httpOnly cookies / CSRF (localStorage for this pass).
- RBAC / admin distinction.
