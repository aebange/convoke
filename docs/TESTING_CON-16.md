# Testing CON-16 — Group Login (JWT)

Manual test procedure for the group-level authentication login flow.

## 1. Prerequisites

- Java 17, Maven 3.6+, Node 18 (only if you build the frontend yourself), PostgreSQL running.
- Database/user from the README: `convoke_db` / `convoke_user` / `secret`.
  Flyway migrates on startup automatically (applies V7 and V8).
- The default JWT secret lives in `application.yaml`; for a "real" run export
  `CONVOKE_JWT_SECRET` (Base64, at least 256-bit).

## 2. Build & run

```bash
cd /home/alex-bange/IdeaProjects/convoke
mvn -Pprod clean package          # builds Angular + backend, runs backend tests
java -jar backend/target/backend-1.0-SNAPSHOT-exec.jar
```

- Backend listens on `http://localhost:8080`; the Angular app is served same-origin from the
  jar, so open `http://localhost:8080/`.
- If your database is not at the default, override it:

  ```bash
  java -jar backend/target/backend-1.0-SNAPSHOT-exec.jar \
    --app.datasource.url=jdbc:postgresql://localhost:5432/convoke_db \
    --app.datasource.username=convoke_user \
    --app.datasource.password=secret
  ```

- Dev alternative (`ng serve`): set `frontend/src/environments/environment.development.ts`
  `baseUrl` to `http://localhost:8080` (it currently points at a LAN IP), then
  `cd frontend && npm run start`. The packaged jar path is simpler and avoids CORS entirely.

## 3. Seed a test group

Password rules are **min 8 characters, at least one letter and one number** (`abc12345` qualifies).

Option A — via the (permitAll) create endpoint:

```bash
curl -i -X POST http://localhost:8080/api/groups/create \
  -H 'Content-Type: application/json' \
  -d '{"name":"MIKES-FRIENDS","password":"abc12345"}'
# expect 201 with {"id":...}
```

Option B — via SQL (as the ticket describes):

```bash
psql -U convoke_user -d convoke_db -h localhost <<'SQL'
create extension if not exists pgcrypto;
insert into groups (name, password_hash)
values ('MIKES-FRIENDS', crypt('abc12345', gen_salt('bf')));
SQL
```

## 4. Browser / UI tests

Open `http://localhost:8080/` with DevTools → Network + Application → Local Storage.

1. **Unknown group locks password** — landing → "Enter Group Name" → type `NOPE-GROUP`.
   Expect: "No group found with that name"; the password field is disabled.
2. **Case-insensitive unlock** — replace with `mikes-friends` (lowercase).
   Expect: the password field enables; Network shows
   `GET /api/groups/check-name?name=mikes-friends` returning `exists:true`.
3. **Name format / length** — enter `bad name` → "Use letters, numbers, hyphens, or underscores";
   enter 51+ characters → length error.
4. **Password rules** — `abc` → "at least 8 characters"; `abcdefgh` → "include a number";
   `12345678` → "include a letter". Continue stays disabled.
5. **Wrong password** — valid name + `abc12345x` → Continue.
   Expect: inline "Invalid group name or password", **no** global error dialog, form values preserved.
6. **Success** — valid name + `abc12345` → Continue.
   Expect: navigates to `/page/select-user/<groupId>`, and `localStorage["convoke.jwt"]` is set.
   Decode the JWT payload (base64url) to verify claims:

   ```bash
   TOKEN=<paste the token>
   node -e "console.log(JSON.parse(Buffer.from(process.argv[1].split('.')[1],'base64url')))" "$TOKEN"
   ```

   Verify `groupId`, `groupName`, and `exp - iat ≈ 30 days`.

## 5. Route guard tests

7. **Unauthenticated shell blocked** — DevTools: `localStorage.removeItem('convoke.jwt')`, then
   visit `/page/<groupId>/events`. Expect a redirect to `/`.
8. **Wrong-group URL blocked** — log in again, then visit `/page/999999/events` (different id).
   Expect a redirect to `/page/<yourGroupId>/events`.
9. **Malformed token** — `localStorage.setItem('convoke.jwt', localStorage.getItem('convoke.jwt').slice(0,-3)+'xxx')`,
   then reload a `/page/...` URL. Expect a redirect to `/` (guard treats it as unauthenticated).

> Note: the app's feature screens do not call the API yet, so the interceptor's
> "non-login 401 → logout" branch cannot be triggered from the UI in this ticket. It is covered
> by backend 401 behavior plus the interceptor logic. Add a temporary API call (or a unit spec)
> if you want to exercise it directly.

## 6. API tests (curl)

```bash
B=http://localhost:8080

# protected without a token
curl -i $B/api/groups                                   # 401

# check-name is public and case-insensitive
curl -s "$B/api/groups/check-name?name=MIKES-FRIENDS"   # {"exists":true,"available":false,...}
curl -s "$B/api/groups/check-name?name=nope"            # {"exists":false,"available":true,...}

# login: wrong password and unknown group must be identical
curl -i -X POST $B/api/auth/login -H 'Content-Type: application/json' \
  -d '{"groupName":"MIKES-FRIENDS","password":"wrongpass1"}'   # 401 "Invalid group name or password"
curl -i -X POST $B/api/auth/login -H 'Content-Type: application/json' \
  -d '{"groupName":"ghost","password":"abc12345"}'             # same 401 body

# success + use the token
TOKEN=$(curl -s -X POST $B/api/auth/login -H 'Content-Type: application/json' \
  -d '{"groupName":"MIKES-FRIENDS","password":"abc12345"}' | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
curl -i $B/api/groups -H "Authorization: Bearer $TOKEN"        # 200
curl -i $B/api/groups -H "Authorization: Bearer garbage"       # 401 + WWW-Authenticate: Bearer

# static / SPA from the packaged jar
curl -i $B/page/1/events                                       # 200 text/html
curl -i $B/                                                   # 200 text/html
```

## 7. Database checks

```bash
psql -U convoke_user -d convoke_db -h localhost -c \
  "select version, description, success from flyway_schema_history order by installed_rank desc limit 2;"  # 8,7 success

psql -U convoke_user -d convoke_db -h localhost -c \
  "select to_regclass('sessions');"                              # NULL (dropped)

psql -U convoke_user -d convoke_db -h localhost -c \
  "select indexname from pg_indexes where tablename='groups';"   # includes uq_groups_name_lower
```

## 8. Cleanup

```bash
psql -U convoke_user -d convoke_db -h localhost -c \
  "delete from groups where lower(name)='mikes-friends';"
```

In the browser: DevTools → Application → Local Storage → remove `convoke.jwt`.
Stop the jar with Ctrl-C.

## Expected results summary

- Unknown name keeps the password field locked; the existence check is case-insensitive.
- Password strength is enforced client-side (min 8, letter + number).
- Wrong password and unknown group return the identical generic 401.
- A successful login stores a JWT with a `groupId` claim and ~30-day expiry and navigates to
  member selection.
- Guards block unauthenticated and cross-group URLs.
- `check-name` and `create` are public; everything else under `/api/**` returns 401 without a
  valid token.
- SPA deep links and static assets are served from the packaged jar.
