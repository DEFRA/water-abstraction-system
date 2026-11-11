# AGENTS.md

## Project overview

A Node.js web app for a UK government digital service managing water abstraction licences, delivered and maintained by DEFRA.

It is the internal-facing app for the Water Resource Licencing service.

It's partner is the external-facing app [water-abstraction-external](https://github.com/DEFRA/water-abstraction-external), which is used by external users to manage their licences and submit abstraction returns.

Both are powered by the shared functionality contained in the [water-abstraction-engine](https://github.com/DEFRA/water-abstraction-engine).

## Technology

The project is a single web service using server-side rendering.

- **Runtime**: Node.js v24
- **Language**: Vanilla JavaScript (ESM modules)
- **Framework**: Hapi
- **Templating**: Nunjucks with GOV.UK Frontend
- **Validation**: Joi
- **ORM**: Objection.js
- **Custom SQL and migrations**: Knex.js
- **Database**: PostgreSQL v15
- **HTTP requests**: Got

## Project paths quick reference

```text
.github/
├── workflows         # GitHub workflows
.vscode/              # VSCode settings and tasks. Ignored by git
bin/                  # Bash scripts including our build script
client/               # Our SASS files for custom styling
src/                  # Primary source code folder
├── config/           # Feature configuration
├── controllers/      # Handlers for Hapi routes
├── dal/              # Data Access Layer. Logic that interacts with the database are isolated as DAL modules
├── plugins/          # The router plugin, and any that are only required by the external app
├── presenters/       # Used to transform data received from the database or a web request into a format and content needed elsewhere
├── public/           # Static assets served by the web server
├── routes/           # Route handlers — one file per route group
├── services/         # Business logic — called by controllers
├── views/            # Nunjucks base layouts and error pages held in the root of the folder
│   └── includes/     # Reusable template fragments
test/                 # Test files mirroring src/ structure
├── support/          # Any external-specific test helpers, stubs, and mocks
│   └── vitest/       # Wrappers for vitest modules provided by water-abstraction-engine
```

## Configuration

- Configuration is environment-variable driven; local config lives in `.env`
- These values are read by the modules in `config/` using dotenv
- All environment-variables are represented in `.env.example`
- No environment variable values are to be committed

## Local execution environment

- Docker-first workflow: treat the host machine as orchestration only
- Never run `npm`, `node`, or database commands directly on the host for this project
- Prefer the VS Code tasks in `.vscode/tasks.json` when available, since they already wrap commands correctly for Docker
- If `dev` is not running, start it with `docker compose up -d` before running commands

## Commands

```bash
# Install dependencies
docker compose exec dev /bin/bash -c 'cd /home/repos/water-abstraction-system && npm ci'

# Run the service
docker compose exec dev /bin/bash -c 'cd /home/repos/water-abstraction-system && npm start'

# Lint
docker compose exec dev /bin/bash -c 'cd /home/repos/water-abstraction-system && npm run lint'

# Test
docker compose exec dev /bin/bash -c 'cd /home/repos/water-abstraction-system && npm test'

# Database migrations
docker compose exec dev /bin/bash -c 'cd /home/repos/water-abstraction-system && npm run migrate'       # run latest migrations
docker compose exec dev /bin/bash -c 'cd /home/repos/water-abstraction-system && npm run migrate:test'  # wipe and re-migrate test DB
docker compose exec dev /bin/bash -c 'cd /home/repos/water-abstraction-system && npm run rollback'      # rollback last migration

# Run commands inside the dev container (preferred pattern)
docker compose exec dev /bin/bash -c 'cd /home/repos/water-abstraction-system && <command>'

# Open a shell in the dev container
docker compose exec dev /bin/bash
```

## Agentic configuration

Agents, personas and skills are shared with the engine. Read `node_modules/water-abstraction-engine/AGENTS.md` from "Agentic configuration" onwards. All `.agents/` paths in it, and in the files it points to, are relative to `node_modules/water-abstraction-engine/`.

If guidance conflicts, this `AGENTS.md` wins.
