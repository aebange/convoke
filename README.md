# Convoke

Convoke is an open-source group event coordination tool built for friend groups who are tired of
juggling texts across five different apps to plan a single hangout. No accounts, no logins — just
a shared group board behind a password where everyone can propose events, vote on dates, and RSVP.

---

## Features

- **Password-gated group boards** — share a URL and password with your group, no accounts required
- **Trust-based identity** — pick your name from the group roster or add yourself; no auth overhead
- **Event proposals** — anyone can propose an event with a description and candidate dates
- **Date voting** — members vote on proposed dates; the app surfaces who is free and who isn't
- **RSVP tracking** — once an event is confirmed, track who's coming, who can't make it, and who hasn't responded
- **Comments** — flat comment threads on each event for coordination chatter
- **Persistent sessions** — your group and identity are remembered per device via local storage

---

## Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Frontend    | Angular 16.2, Tailwind CSS, ag-Grid |
| Backend     | Spring Boot (Java 17)             |
| Database    | PostgreSQL, Flyway migrations     |
| Build       | Maven (single executable JAR)     |

---

## Prerequisites

| Tool        | Version      |
|-------------|--------------|
| Java JDK    | 17           |
| Maven       | 3.6.3+       |
| Node        | 18.17.0      |
| npm         | 9.6.7        |
| Angular CLI | 16.2.2       |
| PostgreSQL  | 14+          |

### Install Node via NVM

```bash
nvm install 18.17.0
nvm use 18.17.0
nvm alias default 18.17.0
```

### Install Angular CLI

```bash
npm uninstall -g @angular/cli
npm install -g @angular/cli@16.2.2
ng version  # verify
```

---

## Environment Configuration

Convoke is configured via environment variables. Create a local `.env` file or export these in
your shell before running. Do not commit real credentials to the repository.

| Variable                  | Description                        | Example                                      |
|---------------------------|------------------------------------|----------------------------------------------|
| `DB_URL`                  | JDBC connection URL                | `jdbc:postgresql://localhost:5432/convoke_db` |
| `DB_USERNAME`             | Database username                  | `convoke_user`                                |
| `DB_PASSWORD`             | Database password                  | `secret`                                      |
| `SERVER_PORT`             | Port the app listens on            | `8080`                                       |
| `CONVOKE_CONTEXT_PATH`    | App context path                   | `/convoke`                                   |

---

## Database Setup

**1. Open a psql session as the postgres superuser:**

Windows:
```cmd
psql -U postgres
```

Unix:
```bash
sudo -u postgres psql
```

**2. Create the database and user:**

```sql
CREATE DATABASE convoke_db;
CREATE USER convoke_user WITH PASSWORD 'secret';
GRANT ALL PRIVILEGES ON DATABASE convoke_db TO convoke_user;
\c convoke_db
GRANT ALL ON SCHEMA public TO convoke_user;
\q
```

**3. Verify the connection:**

```bash
psql -U convoke_user -d convoke_db -h localhost
```

You should get a `convoke_db=>` prompt. Type `\q` to exit.

Flyway migrations run automatically on startup and will build the full schema. No manual table creation required.

---

## Build

```bash
git clone https://github.com/your-org/convoke.git
cd convoke
mvn clean package -Pprod
```

The build compiles the Angular frontend and packages it inside the Spring Boot JAR. The output
is a single self-contained executable at `backend/target/backend-1.0-SNAPSHOT-exec.jar`.

---

## Run

```bash
java -jar backend/target/backend-1.0-SNAPSHOT-exec.jar
```

Then open your browser to `http://localhost:8080/convoke`.

To override config at runtime:

```bash
java -jar backend/target/backend-1.0-SNAPSHOT-exec.jar \
  --DB_URL=jdbc:postgresql://localhost:5432/convoke_db \
  --DB_USERNAME=convoke_user \
  --DB_PASSWORD=secret
```

---

## Deployment

Convoke is designed to run on a single cheap VPS behind an nginx reverse proxy with SSL.

A basic systemd service and nginx config are provided in `docs/deployment/`. See
`docs/deployment/README.md` for the full walkthrough including SSL setup via Certbot.

---

## Project Structure

```
convoke/
├── backend/          # Spring Boot application (REST API, Flyway, embedded frontend)
├── frontend/         # Angular 16.2 application
├── docs/             # Architecture notes, deployment guides, DB setup
├── LICENSE
└── README.md
```

---

## Contributing

Convoke is open source under the MIT license. Issues and pull requests are welcome.
There are no formal contribution requirements at this time — just keep it clean and document
what you changed.

---

## License

MIT — see [LICENSE](LICENSE) for details.
