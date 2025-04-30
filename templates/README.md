# 🛠 Scaffolding for adding new Journeys

Quickly generates source files and matching test files based on templates.

## ✅ Usage

```bash
./scaffold.sh <name> or <path/to/name>
```

## 📋 Examples

```bash
./scaffold.sh my-module
# → app/services/my-module.service.js
# → test/services/my-module.service.test.js

./scaffold.sh notices/setup/fella/my-module
# → app/services/notices/setup/fella/my-module.service.js
# → test/services/notices/setup/fella/my-module.service.test.js
```

## 📦 Scaffold Options

After running, you'll be prompted to choose:

1. Journey - Complete
2. Journey - View
3. Journey - Submit
4. Presenter only
5. Service only
6. Service with Fetch

➡️ Templates are selected and filled automatically depending on your choice.

## 🛠 Key Features

- Always generates both source files and corresponding test files.
- Correct `require()` paths are dynamically calculated based on folder depth.
- Handles nested folder structures under `services/` cleanly.
- Correct relative pathing for `SessionModel` imports inside services.
- Skips file creation if the file already exists (safe by default).

## 🧠 Special Handling

- **`render_file()`**: Renders the actual source file (Service, Presenter, FetchService).
- **`render_test_file()`**: Renders the corresponding test file.
- **SessionModel imports** are dynamically resolved based on service file depth.

## 🛠 Path Calculation Rules

- **`build_up_path()`**: Calculates how many `../` are needed in tests to require the correct source file.
- **`build_session_model_path()`**: Calculates how many `../` are needed to correctly import `models/session.model.js` inside a service.

**Example**:

```text
Service at: app/services/a/b/c/my-service.service.js
Will import: ../../../../models/session.model.js
```

## 📋 Placeholders Replaced in Templates

These placeholders are automatically replaced inside templates:

| Placeholder              | Description                            |
| ------------------------ | -------------------------------------- |
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
