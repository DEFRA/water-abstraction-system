# 🛠 Scaffolding for Adding New Journeys

Quickly generates source files and matching test files based on predefined templates. Helps you scaffold views, services, validators, presenters, and matching test files with correct relative imports and paths.

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

1. Journey - Complete - _Generates:_ Presenter, View, Service, SubmitService, Validator
2. Journey - View - _Generates:_ Presenter, View, Service
3. Journey - Submit - _Generates:_ SubmitService, Validator

➡️ Templates are selected and filled automatically depending on your choice.

## 🔧 Output Files

- **Source files** go into `app/{services|presenters|validators|views}/`
- **Test files** go into `test/{services|presenters|validators}/`
- **View files** go into `app/views/` but don’t have test counterparts
- **Helper snippet** with controller and router boilerplate is printed on completion

## 🛠 Key Features

- Always generates both source and test files
- Skips file creation if file already exists (safe by default)
- Handles nested folders cleanly
- Correct `require()` paths are calculated dynamically
- View templates and controller helpers are scaffolded for you

## 🧠 Special Handling

- **`render_file()`**: Renders source files (Presenter, Service, SubmitService, etc.)
- **`render_test_file()`**: Renders corresponding test files
- **SessionModel imports** are dynamically resolved based on file depth

## 🗂 Path Calculation Rules

- **`build_up_path()`**: Figures out how many `../` are needed to reach base from nested folders
- Paths like `models/session.model.js`, presenter, and validator are injected based on folder depth

**Example**:

```text
Service at: app/services/a/b/c/my-service.service.js
Will import: ../../../../models/session.model.js
```

## 🧩 Placeholders Replaced in Templates

| Placeholder              | Description                            |
| ------------------------ | -------------------------------------- |
| `__MODULE_NAME__`        | PascalCase name of the module          |
| `__REQUIRE_PATH__`       | Path to the source file from test file |
| `__DESCRIBE_LABEL__`     | Test suite name for `describe()`       |
| `__PRESENTER_NAME__`     | PascalCase Presenter module name       |
| `__PRESENTER_PATH__`     | Path to Presenter file                 |
| `__SESSION_MODEL_PATH__` | Path to `models/session.model.js`      |
| `__VALIDATOR_NAME__`     | PascalCase Validator module name       |
| `__VALIDATOR_PATH__`     | Path to Validator file                 |
| `__SERVICE_NAME__`       | PascalCase Service module name         |
| `__SUBMIT_NAME__`        | PascalCase SubmitService name          |
| `__VIEW_PATH__`          | Path to `.njk` view template           |
| `__CONTROLLER_NAME__`    | Controller name                        |
