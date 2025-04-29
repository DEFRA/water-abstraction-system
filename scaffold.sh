#!/bin/bash

# ==============================================================================
# 🛠 Scaffold Script for Services, Presenters & Fetch Services
# ------------------------------------------------------------------------------
# Quickly generates source files and matching test files based on templates.
#
# ✅ Usage
# ------------------------------------------------------------------------------
#   ./scaffold.sh <name> or <path/to/name>
#
# 📋 Examples
# ------------------------------------------------------------------------------
#   ./scaffold.sh my-module
#     → app/services/my-module.service.js
#     → test/services/my-module.service.test.js
#
#   ./scaffold.sh notices/setup/fella/my-module
#     → app/services/notices/setup/fella/my-module.service.js
#     → test/services/notices/setup/fella/my-module.service.test.js
#
# 📦 Scaffold Options
# ------------------------------------------------------------------------------
# After running, you'll be prompted to choose:
#
#   1) Service only
#   2) Service + Presenter
#   3) Service + Presenter + Fetch
#   4) Presenter only
#   6) Submit Service + Validator
#
# ➡ Templates are selected and filled automatically depending on your choice.
#
# 🛠 Key Features
# ------------------------------------------------------------------------------
# - Always generates both source files and corresponding test files.
# - Correct `require()` paths are dynamically calculated based on folder depth.
# - Handles nested folder structures under `services/` cleanly.
# - Correct relative pathing for `SessionModel` imports inside services.
# - Skips file creation if the file already exists (safe by default).
#
# 🧠 Special Handling
# ------------------------------------------------------------------------------
# - **render_file()**: Renders the actual source file (Service, Presenter, FetchService).
# - **render_test_file()**: Renders the corresponding test file.
# - **SessionModel imports** are dynamically resolved based on service file depth.
#
# 🛠 Path Calculation Rules
# ------------------------------------------------------------------------------
# - **build_up_path()**: Calculates how many `../` are needed in tests to require the correct source file.
# - **build_session_model_path()**: Calculates how many `../` are needed to correctly import `models/session.model.js` inside a service.
#
# Example:
#   - Service at: `app/services/a/b/c/my-service.service.js`
#   - Will import: `../../../../models/session.model.js`
#
# 📋 Placeholders Replaced in Templates
# ------------------------------------------------------------------------------
# These placeholders are automatically replaced inside templates:
#
#   - `__MODULE_NAME__`         → PascalCase name of the module or module
#   - `__REQUIRE_PATH__`        → Path to the source file from test file
#   - `__DESCRIBE_LABEL__`      → Test suite name for `describe()`
#   - `__PRESENTER_NAME__`      → PascalCase Presenter module name
#   - `__PRESENTER_PATH__`      → Path to Presenter file
#   - `__FETCH_NAME__`          → PascalCase FetchService module name
#   - `__FETCH_PATH__`          → Path to FetchService file
#   - `__SESSION_MODEL_PATH__`  → Path to `models/session.model.js`
#   - `__VALIDATOR_NAME__`      → PascalCase Validator module name
#   - `__VALIDATOR_PATH__`      → Path to Validator file
#
# ==============================================================================

set -e

# ------------------------------------------------------------------------------
# Inputs and Initial Setup
# ------------------------------------------------------------------------------

INPUT_PATH="$1"

if [ -z "$INPUT_PATH" ]; then
  echo "Usage: $0 <name> or <path/name> (e.g., my-module or folder/my-module)"
  exit 1
fi

RAW_NAME=$(basename "$INPUT_PATH")
REL_DIR=$(dirname "$INPUT_PATH")
if [ "$REL_DIR" = "." ]; then
  REL_DIR=""
fi

to_pascal_case() {
  echo "$1" | sed -E 's/[-_]+/ /g' | awk '{for(i=1;i<=NF;++i) $i=toupper(substr($i,1,1)) substr($i,2)}1' | tr -d ' '
}

PASCAL_NAME=$(to_pascal_case "$RAW_NAME")

# ------------------------------------------------------------------------------
# Templates
# ------------------------------------------------------------------------------

TEMPLATE_SERVICE="templates/service.js"
TEMPLATE_SERVICE_AND_PRESENTER="templates/service-and-presenter.service.js"
TEMPLATE_SERVICE_FETCH_PRESENTER="templates/service-fetch-presenter.service.js"
TEMPLATE_SERVICE_PRESENTER_SESSION="templates/service-session-presenter.service.js"
TEMPLATE_SUBMIT_SERVICE="templates/submit.service.js"
TEMPLATE_VALIDATOR="templates/validator.js"


TEMPLATE_TEST_SERVICE="templates/service.test.js"
TEMPLATE_TEST_SERVICE_AND_PRESENTER="templates/service-and-presenter.service.test.js"
TEMPLATE_TEST_SERVICE_FETCH_PRESENTER="templates/service-fetch-presenter.service.test.js"
TEMPLATE_TEST_SERVICE_PRESENTER_SESSION="templates/service-session-presenter.service.test.js"
TEMPLATE_TEST_SUBMIT_SERVICE="templates/submit.service.test.js"
TEMPLATE_TEST_VALIDATOR="templates/validator.test.js"


TEMPLATE_FETCH="templates/fetch.js"
TEMPLATE_TEST_FETCH="templates/fetch.test.js"
TEMPLATE_PRESENTER="templates/presenter.js"
TEMPLATE_TEST_PRESENTER="templates/presenter.test.js"

# ------------------------------------------------------------------------------
# Helper Functions
# ------------------------------------------------------------------------------

build_up_path() {
  local depth=3
  if [ -n "$REL_DIR" ]; then
    local slash_count
    slash_count=$(grep -o "/" <<< "$REL_DIR" | wc -l | tr -d ' ')
    depth=$((slash_count + 3))
  fi

  local result=""
  for ((i=0; i<depth; i++)); do
    result="../$result"
  done
  echo "$result"
}

build_session_model_path() {
  local depth=2 # Always 2 minimum: services/ + leaving services/

  if [ -n "$REL_DIR" ]; then
    local slash_count
    slash_count=$(grep -o "/" <<< "$REL_DIR" | wc -l | tr -d ' ')
    depth=$((slash_count + 2))
  fi

  local result=""
  for ((i=0; i<depth; i++)); do
    result="../$result"
  done

  echo "${result}models/session.model.js"
}

render_file() {
  local template="$1"
  local output_path="$2"
  local module_name="$3"
  local presenter_path="$4"
  local fetch_path="$5"
  local session_model_path="$6"
  local validator_path="$7"

  mkdir -p "$(dirname "$output_path")"

  if [ -f "$output_path" ]; then
    echo "⚠️  Skipped (already exists): $output_path"
    return
  fi

  sed -e "s/__MODULE_NAME__/${module_name}/g" \
      -e "s#__PRESENTER_PATH__#${presenter_path}#g" \
      -e "s/__PRESENTER_NAME__/${PASCAL_NAME}Presenter/g" \
      -e "s/__FETCH_NAME__/Fetch${PASCAL_NAME}Service/g" \
      -e "s#__FETCH_PATH__#${fetch_path}#g" \
      -e "s#__SESSION_MODEL_PATH__#${session_model_path}#g" \
      -e "s#__VALIDATOR_PATH__#${validator_path}#g" \
      -e "s/__VALIDATOR_NAME__/${PASCAL_NAME}Validator/g" \
      "$template" > "$output_path"

  echo "✅ Created $output_path"
}

render_test_file() {
  local template="$1"
  local output_path="$2"
  local module_name="$3"
  local require_path="$4"
  local describe_label="$5"
  local presenter_path="$6"
  local fetch_path="$7"
  local session_model_path="$8"

  mkdir -p "$(dirname "$output_path")"

  if [ -f "$output_path" ]; then
    echo "⚠️  Skipped (already exists): $output_path"
    return
  fi

  sed -e "s/__MODULE_NAME__/${module_name}/g" \
      -e "s#__REQUIRE_PATH__#${require_path}#g" \
      -e "s/__DESCRIBE_LABEL__/${describe_label}/g" \
      -e "s#__PRESENTER_PATH__#${presenter_path}#g" \
      -e "s/__PRESENTER_NAME__/${PASCAL_NAME}Presenter/g" \
      -e "s/__FETCH_NAME__/Fetch${PASCAL_NAME}Service/g" \
      -e "s#__FETCH_PATH__#${fetch_path}#g" \
      -e "s#__SESSION_MODEL_PATH__#${session_model_path}#g" \
      "$template" > "$output_path"

  echo "✅ Created $output_path"
}

generate_paths() {
  local type="$1"    # Service, Presenter, FetchService
  local service_variant="$2"  # service, presenter, fetch-presenter

  TYPE="$type"
  TYPE_LOWER=$(echo "$TYPE" | tr '[:upper:]' '[:lower:]')

  MODULE_NAME="${PASCAL_NAME}${TYPE}"
  SOURCE_FILE="${RAW_NAME}.${TYPE_LOWER}.js"
  TEST_FILE="${RAW_NAME}.${TYPE_LOWER}.test.js"

   if [ "$TYPE" = "Service" ]; then
      APP_SUBFOLDER="services"
      TEST_SUBFOLDER="services"

      # Additional input
      FETCH_PATH="./fetch-${RAW_NAME}.service.js"
      SESSION_MODEL_PATH=$(build_session_model_path)

      case "$service_variant" in
        service)
          SOURCE_TEMPLATE="$TEMPLATE_SERVICE"
          TEST_TEMPLATE="$TEMPLATE_TEST_SERVICE"
          ;;
        presenter)
          SOURCE_TEMPLATE="$TEMPLATE_SERVICE_AND_PRESENTER"
          TEST_TEMPLATE="$TEMPLATE_TEST_SERVICE_AND_PRESENTER"
          ;;
        fetch-presenter)
          SOURCE_TEMPLATE="$TEMPLATE_SERVICE_FETCH_PRESENTER"
          TEST_TEMPLATE="$TEMPLATE_TEST_SERVICE_FETCH_PRESENTER"
          ;;
        presenter-session)
          SOURCE_TEMPLATE="$TEMPLATE_SERVICE_PRESENTER_SESSION"
          TEST_TEMPLATE="$TEMPLATE_TEST_SERVICE_PRESENTER_SESSION"
          ;;
        fetch)
            SOURCE_TEMPLATE="$TEMPLATE_FETCH"
            TEST_TEMPLATE="$TEMPLATE_TEST_FETCH"
            # We prefix our fetch services with 'fetch'
            MODULE_NAME="Fetch${MODULE_NAME}"
            SOURCE_FILE="fetch-${SOURCE_FILE}"
            TEST_FILE="fetch-${TEST_FILE}"
          ;;
         submit)
            SOURCE_TEMPLATE="$TEMPLATE_SUBMIT_SERVICE"
            TEST_TEMPLATE="$TEMPLATE_TEST_SUBMIT_SERVICE"
            # We prefix our submit services with 'submit'
            MODULE_NAME="Submit${MODULE_NAME}"
            SOURCE_FILE="submit-${SOURCE_FILE}"
            TEST_FILE="submit-${TEST_FILE}"
          ;;
        *)
          echo "❌ Unknown service variant: $service_variant"
          exit 1
          ;;
      esac

    elif [ "$TYPE" = "Presenter" ]; then
      SOURCE_TEMPLATE="$TEMPLATE_PRESENTER"
      TEST_TEMPLATE="$TEMPLATE_TEST_PRESENTER"

      APP_SUBFOLDER="presenters"
      TEST_SUBFOLDER="presenters"

   elif [ "$TYPE" = "Validator" ]; then
        SOURCE_TEMPLATE="$TEMPLATE_VALIDATOR"
        TEST_TEMPLATE="$TEMPLATE_TEST_VALIDATOR"

        APP_SUBFOLDER="validators"
        TEST_SUBFOLDER="validators"
    else
      echo "❌ Unknown type: $TYPE"
      exit 1
    fi

  # When a folder path is supplied
  if [ -n "$REL_DIR" ]; then
    SOURCE_OUTPUT="app/${APP_SUBFOLDER}/${REL_DIR}/${SOURCE_FILE}"
    TEST_OUTPUT="test/${TEST_SUBFOLDER}/${REL_DIR}/${TEST_FILE}"
  else
    SOURCE_OUTPUT="app/${APP_SUBFOLDER}/${SOURCE_FILE}"
    TEST_OUTPUT="test/${TEST_SUBFOLDER}/${TEST_FILE}"
  fi

  # Helper
  UP_PATH=$(build_up_path)

  # Test variables
  DESCRIBE_LABEL="$(echo "$RAW_NAME" | sed -E 's/[-_]+/ /g' | awk '{for(i=1;i<=NF;++i) $i=toupper(substr($i,1,1)) substr($i,2)}1') $TYPE" # Test describe block
  REQUIRE_PATH="${UP_PATH}app/${APP_SUBFOLDER}/${REL_DIR}/${SOURCE_FILE}"
  TEST_FETCH_PATH="${UP_PATH}app/services/${REL_DIR}/fetch-${SOURCE_FILE}"

  # Additional paths
  PRESENTER_PATH="../../../../presenters/${REL_DIR}/${RAW_NAME}.presenter.js" # Not all require this
  VALIDATOR_PATH="../../../../validators/${REL_DIR}/${RAW_NAME}.validator.js" # Not all require this
}

render_source_and_test() {
  local type="$1"
  local service_variant="$2"

  generate_paths "$type" "$service_variant"

  # Render source file
  render_file "$SOURCE_TEMPLATE" "$SOURCE_OUTPUT" "$MODULE_NAME" "$PRESENTER_PATH" "$FETCH_PATH" "$SESSION_MODEL_PATH" "$VALIDATOR_PATH"

  # Render test file
  render_test_file "$TEST_TEMPLATE" "$TEST_OUTPUT" "$MODULE_NAME" "$REQUIRE_PATH" "$DESCRIBE_LABEL" "$PRESENTER_PATH" "$TEST_FETCH_PATH" "$SESSION_MODEL_PATH"
}

# ------------------------------------------------------------------------------
# CLI Prompt
# ------------------------------------------------------------------------------

echo ""
echo "What do you want to scaffold?"
echo "1) Service only"
echo "2) Service + Presenter"
echo "3) Service + Presenter + Fetch"
echo "4) Presenter only"
echo "5) Service + Presenter + Session"
echo "6) Submit + Validator"
echo ""

read -rp "> " choice

case "$choice" in
  1)
    echo "📦 Generating Service..."
    render_source_and_test "Service" "service"
    ;;
  2)
    echo "📦 Generating Service + Presenter..."
    render_source_and_test "Service" "presenter"
    render_source_and_test "Presenter" ""
    ;;
  3)
    echo "📦 Generating Service + Presenter + Fetch..."
    render_source_and_test "Service" "fetch-presenter"
    render_source_and_test "Presenter" ""
    render_source_and_test "Service" "fetch"
    ;;
  4)
    echo "📦 Generating Presenter only..."
    render_source_and_test "Presenter" ""
    ;;
  5)
    echo "📦 Generating Service + Presenter + Session..."
    render_source_and_test "Service" "presenter-session"
    render_source_and_test "Presenter" ""
    ;;
  6)
    echo "📦 Generating Submit service + validator..."
    render_source_and_test "Service" "submit"
    render_source_and_test "Validator" ""
    render_source_and_test "Presenter" "" # This should already exists based on our workflow
    ;;
  *)
    echo "❌ Invalid selection. Exiting."
    exit 1
    ;;
esac
