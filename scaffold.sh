#!/bin/bash

# ==============================================================================
# 🛠 Scaffold Script for Services, Presenters & Fetch Services
# ------------------------------------------------------------------------------

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

  if [ "$TYPE" = "FetchService" ]; then
    MODULE_NAME="Fetch${PASCAL_NAME}Service"
    SOURCE_FILE="fetch-${RAW_NAME}.service.js"
    TEST_FILE="fetch-${RAW_NAME}.service.test.js"
    SOURCE_TEMPLATE="$TEMPLATE_FETCH"
    TEST_TEMPLATE="$TEMPLATE_TEST_FETCH"
  else
    MODULE_NAME="${PASCAL_NAME}${TYPE}"
    SOURCE_FILE="${RAW_NAME}.${TYPE_LOWER}.js"
    TEST_FILE="${RAW_NAME}.${TYPE_LOWER}.test.js"

    if [ "$TYPE" = "Presenter" ]; then
      SOURCE_TEMPLATE="$TEMPLATE_PRESENTER"
      TEST_TEMPLATE="$TEMPLATE_TEST_PRESENTER"
    else
      # Decide service variant
      case "$service_variant" in
        plain)
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
      esac
    fi
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
echo "1) Plain Service only"
echo "2) Service + Presenter"
echo "3) Service + Presenter + FetchService"
echo "4) Presenter only"
echo "5) Service + Presenter + Session"
echo ""

read -rp "> " choice

case "$choice" in
  1)
    echo "📦 Generating plain Service..."
    render_source_and_test "Service" "plain"
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
