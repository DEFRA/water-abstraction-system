# Water Abstraction System

![Build Status](https://github.com/DEFRA/water-abstraction-system/workflows/CI/badge.svg?branch=main)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_water-abstraction-system&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=DEFRA_water-abstraction-system)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_water-abstraction-system&metric=coverage)](https://sonarcloud.io/dashboard?id=DEFRA_water-abstraction-system)
[![Known Vulnerabilities](https://snyk.io/test/github/DEFRA/water-abstraction-system/badge.svg)](https://snyk.io/test/github/DEFRA/water-abstraction-system)
[![Licence](https://img.shields.io/badge/Licence-OGLv3-blue.svg)](http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3)

This API provides an interface for calculating charges, queuing transactions and generating transaction files used to produce invoices.

## Prerequisites

Make sure you already have:

- [Node.js v20.\*](https://nodejs.org/en/)
- [PostgreSQL v14](https://www.postgresql.org/)

## Running locally

This is one of a number of apps that make up the Water Resource Licencing service. Because of the service's complex infrastructure there is a separate project available that will build a fully working WRLS environment, using [Docker](https://docs.docker.com/get-docker/). We recommend reaching out to the [Water Abstraction team](https://github.com/orgs/DEFRA/teams/water-abstraction) and requesting access to **wal-dev-environment** if you need to get this project up and running.

## Configuration

> This is automatically setup when running locally using **wal-dev-environment**

Any configuration is expected to be driven by environment variables when the service is run in production as per [12 factor app](https://12factor.net/config).

However when running locally in development mode or in test it makes use of the [Dotenv](https://github.com/motdotla/dotenv) package. This is a shim that will load values stored in a `.env` file into the environment which the service will then pick up as though they were there all along.

Check out [.env.example](/.env.example) for details of the required things you'll need in your `.env` file.

Refer to the [config files](config) for details of all the configuration used.

## Contributing to this project

If you have an idea you'd like to contribute please log an issue.

All contributions should be submitted via a pull request.

The code style is dictated by [Prettier](https://prettier.io/), and we follow [StandardJS](https://standardjs.com/) code rules as implemented by [neostandard](https://github.com/neostandard/neostandard). This is all managed through [ESLint](https://eslint.org/) so should play nice with all IDE's.

## License

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the license

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.

## 🛠 Scaffold Script for adding new Journeys

Quickly generates source files and matching test files based on templates.

---

### ✅ Usage

```bash
./scaffold.sh <name> or <path/to/name>
```

---

### 📋 Examples

```bash
./scaffold.sh my-module
# → app/services/my-module.service.js
# → test/services/my-module.service.test.js

./scaffold.sh notices/setup/fella/my-module
# → app/services/notices/setup/fella/my-module.service.js
# → test/services/notices/setup/fella/my-module.service.test.js
```

---

### 📦 Scaffold Options

After running, you'll be prompted to choose:

1. Journey - Complete
2. Journey - View
3. Journey - Submit
4. Presenter only
5. Service only
6. Service with Fetch

➡️ Templates are selected and filled automatically depending on your choice.

---

### 🛠 Key Features

- Always generates both source files and corresponding test files.
- Correct `require()` paths are dynamically calculated based on folder depth.
- Handles nested folder structures under `services/` cleanly.
- Correct relative pathing for `SessionModel` imports inside services.
- Skips file creation if the file already exists (safe by default).

---

### 🧠 Special Handling

- **`render_file()`**: Renders the actual source file (Service, Presenter, FetchService).
- **`render_test_file()`**: Renders the corresponding test file.
- **SessionModel imports** are dynamically resolved based on service file depth.

---

### 🛠 Path Calculation Rules

- **`build_up_path()`**: Calculates how many `../` are needed in tests to require the correct source file.
- **`build_session_model_path()`**: Calculates how many `../` are needed to correctly import `models/session.model.js` inside a service.

**Example**:

```text
Service at: app/services/a/b/c/my-service.service.js
Will import: ../../../../models/session.model.js
```

---

### 📋 Placeholders Replaced in Templates

These placeholders are automatically replaced inside templates:

| Placeholder              | Description                            |
|--------------------------|----------------------------------------|
| `__MODULE_NAME__`        | PascalCase name of the module          |
| `__REQUIRE_PATH__`       | Path to the source file from test file |
| `__DESCRIBE_LABEL__`     | Test suite name for `describe()`       |
| `__PRESENTER_NAME__`     | PascalCase Presenter module name       |
| `__PRESENTER_PATH__`     | Path to Presenter file                 |
| `__FETCH_NAME__`         | PascalCase FetchService module name    |
| `__FETCH_PATH__`         | Path to FetchService file              |
| `__SESSION_MODEL_PATH__` | Path to `models/session.model.js`      |
| `__VALIDATOR_NAME__`     | PascalCase Validator module name       |
| `__VALIDATOR_PATH__`     | Path to Validator file                 |
