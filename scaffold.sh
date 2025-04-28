#!/bin/bash

# ==============================================================================
# 🛠 Scaffold Script for Services, Presenters & Fetch Services
# ------------------------------------------------------------------------------
# Quickly generates source files and corresponding test files from templates.
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
# 🧩 Templates required
# ------------------------------------------------------------------------------
#   templates/service.js
#   templates/service.test.js
#   templates/service-and-presenter.service.js
#   templates/service-and-presenter.service.test.js
#   templates/service-fetch-presenter.service.js
#   templates/service-fetch-presenter.service.test.js
#   templates/service-session-presenter.service.js
#   templates/service-session-presenter.service.test.js
#   templates/fetch.js
#   templates/fetch.test.js
#   templates/presenter.js
#   templates/presenter.test.js
#
# 📦 Scaffold Options
# ------------------------------------------------------------------------------
# After running, you'll be prompted to choose:
#
#   1) service Service only
#   2) Service + Presenter
#   3) Service + Presenter + FetchService
#   4) Presenter only
#   5) Service + Presenter + Session
#
# ➡ Different templates are selected automatically depending on choice.
#
# 🛠 Special Handling
# ------------------------------------------------------------------------------
# - **Relative import paths** inside service/test files are dynamically calculated.
# - **SessionModel import** is correctly handled, even for deeply nested services.
# - **Test file paths** adjust automatically based on service location.
# - **Existing files** are skipped (no overwrites).
#
# 🛠 Path Calculation Rules
# ------------------------------------------------------------------------------
# - **build_up_path()**: Calculates the number of `../` needed for test file `require()` imports.
# - **build_session_model_path()**: Calculates the number of `../` needed for importing SessionModel inside a service file.
#
# Example:
#   - Service file:  `app/services/a/b/c/my-service.service.js`
#   - Needs import:  `../../../../models/session.model.js`
#
# 📋 Placeholders Replaced
# ------------------------------------------------------------------------------
# In templates, these placeholders are replaced automatically:
#
#   - `__MODULENAME__`           → PascalCase service/presenter class name
#   - `__REQUIRE_PATH__`          → Test file require() path to the module under test
#   - `__DESCRIBE_LABEL__`        → Human-readable label for test descriptions
#   - `__PRESENTERNAME__`         → PascalCase presenter class name
#   - `__PRESENTER_PATH__`        → Path to the presenter for services
#   - `__FETCH_NAME__`            → PascalCase FetchService class name
#   - `__FETCH_PATH__`            → Path to FetchService for services/tests
#   - `__SESSION_MODEL_PATH__`    → Path to SessionModel for services/tests
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


TEMPLATE_TEST_SERVICE="templates/service.test.js"
TEMPLATE_TEST_SERVICE_AND_PRESENTER="templates/service-and-presenter.service.test.js"
TEMPLATE_TEST_SERVICE_FETCH_PRESENTER="templates/service-fetch-presenter.service.test.js"
TEMPLATE_TEST_SERVICE_PRESENTER_SESSION="templates/service-session-presenter.service.test.js"


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
  local require_path="$4"
  local readable_label="$5"
  local presenter_path="$6"
  local fetch_path="$7"
  local session_model_path="$8"

  mkdir -p "$(dirname "$output_path")"

  if [ -f "$output_path" ]; then
    echo "⚠️  Skipped (already exists): $output_path"
    return
  fi

  sed -e "s/__MODULENAME__/${module_name}/g" \
      -e "s#__REQUIRE_PATH__#${require_path}#g" \
      -e "s/__DESCRIBE_LABEL__/${readable_label}/g" \
      -e "s/__PRESENTERNAME__/${PASCAL_NAME}Presenter/g" \
      -e "s#__PRESENTER_PATH__#${presenter_path}#g" \
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

   if [ "$TYPE" = "Service" ]; then
      MODULE_NAME="${PASCAL_NAME}Service"
      SOURCE_FILE="${RAW_NAME}.service.js"
      TEST_FILE="${RAW_NAME}.service.test.js"

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
        *)
          echo "❌ Unknown service variant: $service_variant"
          exit 1
          ;;
      esac

    elif [ "$TYPE" = "Presenter" ]; then
      MODULE_NAME="${PASCAL_NAME}Presenter"
      SOURCE_FILE="${RAW_NAME}.presenter.js"
      TEST_FILE="${RAW_NAME}.presenter.test.js"

      SOURCE_TEMPLATE="$TEMPLATE_PRESENTER"
      TEST_TEMPLATE="$TEMPLATE_TEST_PRESENTER"

    elif [ "$TYPE" = "FetchService" ]; then
      MODULE_NAME="Fetch${PASCAL_NAME}Service"
      SOURCE_FILE="fetch-${RAW_NAME}.service.js"
      TEST_FILE="fetch-${RAW_NAME}.service.test.js"

      SOURCE_TEMPLATE="$TEMPLATE_FETCH"
      TEST_TEMPLATE="$TEMPLATE_TEST_FETCH"

    else
      echo "❌ Unknown type: $TYPE"
      exit 1
    fi

  if [ "$TYPE" = "Presenter" ]; then
    APP_SUBFOLDER="presenters"
    TEST_SUBFOLDER="presenters"
  else
    APP_SUBFOLDER="services"
    TEST_SUBFOLDER="services"
  fi

  if [ -n "$REL_DIR" ]; then
    SOURCE_OUTPUT="app/${APP_SUBFOLDER}/${REL_DIR}/${SOURCE_FILE}"
    TEST_OUTPUT="test/${TEST_SUBFOLDER}/${REL_DIR}/${TEST_FILE}"
  else
    SOURCE_OUTPUT="app/${APP_SUBFOLDER}/${SOURCE_FILE}"
    TEST_OUTPUT="test/${TEST_SUBFOLDER}/${TEST_FILE}"
  fi

  UP_PATH=$(build_up_path)
  REQUIRE_PATH="${UP_PATH}app/${APP_SUBFOLDER}/${REL_DIR}/${SOURCE_FILE}"

  PRESENTER_PATH=""
  FETCH_PATH=""

  if [ "$TYPE" = "Service" ]; then
    PRESENTER_PATH="../../../../presenters/${REL_DIR}/${RAW_NAME}.presenter.js"
    FETCH_PATH="./fetch-${RAW_NAME}.service.js"
    SESSION_MODEL_PATH=$(build_session_model_path)
  fi


  READABLE_LABEL="$(echo "$RAW_NAME" | sed -E 's/[-_]+/ /g' | awk '{for(i=1;i<=NF;++i) $i=toupper(substr($i,1,1)) substr($i,2)}1') $TYPE"
}

render_source_and_test() {
  local type="$1"
  local service_variant="$2"

  generate_paths "$type" "$service_variant"

  render_file "$SOURCE_TEMPLATE" "$SOURCE_OUTPUT" "$MODULE_NAME" "" "$READABLE_LABEL" "$PRESENTER_PATH" "$FETCH_PATH" "$SESSION_MODEL_PATH"

  if [ "$TYPE" = "Service" ]; then
    FETCH_PATH="${UP_PATH}app/services/${REL_DIR}/fetch-${RAW_NAME}.service.js"
  fi

  render_file "$TEST_TEMPLATE" "$TEST_OUTPUT" "$MODULE_NAME" "$REQUIRE_PATH" "$READABLE_LABEL" "$PRESENTER_PATH" "$FETCH_PATH" "$SESSION_MODEL_PATH"
}

# ------------------------------------------------------------------------------
# CLI Prompt
# ------------------------------------------------------------------------------

echo ""
echo "What do you want to scaffold?"
echo "1) Service only"
echo "2) Service + Presenter"
echo "3) Service + Presenter + FetchService"
echo "4) Presenter only"
echo "5) Service + Presenter + Session"
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
    echo "📦 Generating Service + Presenter + FetchService..."
    render_source_and_test "Service" "fetch-presenter"
    render_source_and_test "Presenter" ""
    render_source_and_test "FetchService" ""
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
  *)
    echo "❌ Invalid selection. Exiting."
    exit 1
    ;;
esac
