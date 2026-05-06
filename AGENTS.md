# AGENTS.md

## Project overview

Part of a UK government digital service for managing water abstraction licences, delivered and maintained by DEFRA.

This project is incrementally replacing internal functionality in the legacy services. As features are added the legacy [water-abstraction-ui](https://github.com/DEFRA/water-abstraction-ui) service is updated to redirect to this service.

## Technology

The project is a single web service using server-side rendering.

- **Runtime**: Node.js v22
- **Language**: Vanilla JavaScript (CommonJS modules)
- **Framework**: Hapi
- **Templating**: Nunjucks with GOV.UK Frontend
- **Validation**: Joi
- **ORM**: Objection.js
- **Custom SQL and migrations**: Knex.js
- **Database**: PostgreSQL v15
- **HTTP requests**: Got

## Project paths quick reference

```
.agents/              # Agent configuration
.github/
├── workflows         # GitHub workflows
.vscode/              # VSCode settings and tasks. Ignored by git
app/                  # Primary source code folder
├── controllers/      # Handlers for Hapi routes
├── dal/              # Data Access Layer. Logic that interacts with the database are isolated as DAL modules
├── errors/           # Custom errors
├── lib/              # Shared modules containing utility functions
├── models/           # Objection.js models that also define relationships between our data entities
├── plugins/          # Hapi plugins (auth, CSRF, CSP, views, session, etc)
├── presenters/       # Used to transform data received from the database or a web request into a format and content needed elsewhere
├── requests/         # All HTTP requests made by this project to external services. Built on Got.
├── routes/           # Route handlers — one file per route group
├── services/         # Business logic — called by controllers
├── validators/       # Validates data submitted to the service. Built on Joi
├── views/            # Nunjucks base layouts and error pages held in the root of the folder
│   ├── includes/     # Reusable template fragments
│   └── macros/       # Reusable template macros
bin/                  # Bash scripts including our build script
client/               # Our SASS files for custom styling
config/               # Server, environment, and feature configuration
db/                   # All things related to working with the database
├── migrations
│   ├── legacy        # Recreates database schemas and tables managed by legacy projects
│   └── public        # Database migrations managed by this project
├── seeds             # Database seeds primarily for test and non-production environments
│   └── data          # Source data for our seeds
templates/            # Works with scaffold.sh to create new boiler-plate pages in the service
test/                # Test files mirroring app/ structure
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

# Test (runs clean + lab)
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

### Agents

Our agents are defined in `.agents`. They are model-agnostic and intended to work well with any LLM. When updating these files:

- Use plain language, not prompt patterns specific to one provider
- Do not rely on system-prompt features that only some models support
- Assume the consumer pastes the content directly into any chat interface

You may use whichever model you have access to for any given task. Stronger models are better for complex reasoning (architecture, debugging); faster/cheaper models are fine for mechanical tasks (sorting, formatting, renaming).

### Personas

- Our personas define _how_ an agent should behave (tone, role, personality)
- They are intended to be used in conjunction with agents and skills, for example, "review as Alan"

### Skills

- Our skills are intended to give our agents defined capabilities and expertise
- They can provide specialised knowledge and instructions on how to carry out certain tasks
- They are defined using [Agent Skills open standard](https://agentskills.io/specification)

## Instruction precedence

- `AGENTS.md` defines global project rules and execution constraints
- Files in `.agents/` define task-specific behaviour for agents, personas, and skills
- If guidance overlaps, follow both where possible; if there is conflict, prefer `AGENTS.md`

## Invocation examples

- Use the reviewer agent: "Use `.agents/code-reviewer.agent.md` to review my current changes"
- Run an Alan review: "Read `.agents/personas/alan.md` and review as Alan"
- Apply commit guidance: "Read `.agents/skills/commits/SKILL.md` before committing"
- Apply standards guidance: "Read `.agents/skills/standards/SKILL.md` before editing"
