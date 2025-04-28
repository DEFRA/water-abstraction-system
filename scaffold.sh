#!/bin/bash

# ==============================================================================
# 🛠 Scaffold Script for Services, Presenters & Fetch Services
# ------------------------------------------------------------------------------
# Generates boilerplate source files and matching test files based on templates.
#
# ✅ USAGE:
#   ./scaffold.sh <name> or <path/to/name>
#
# 🔤 Examples:
#   ./scaffold.sh my-module
#     → app/services/my-module.service.js
#     → test/services/my-module.service.test.js
#
#   ./scaffold.sh notices/setup/fella/my-module
#     → app/services/notices/setup/fella/my-module.service.js
#     → test/services/notices/setup/fella/my-module.service.test.js
#
# 📁 Required Templates:
#   - templates/service.js
#   - templates/service.test.js
#   - templates/fetch.js
#   - templates/fetch.test.js
#   - templates/presenter.js
#   - templates/presenter.test.js
#
# 📋 Options (interactive prompt after running):
#   1) Service only
#   2) Presenter only
#   3) Service + Presenter
#   4) Service + Presenter + FetchService
#
# 🧠 Key Features:
#   - Always creates both source file and matching test file.
#   - Correct relative `require()` paths for tests.
#   - Handles any nested folder structures.
#   - Skips existing files with a warning.
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

RAW_NAME=$(basename "$INPUT_PATH")  # Last part of the path (file name without path)
REL_DIR=$(dirname "$INPUT_PATH")    # Folder path relative to root
if [ "$REL_DIR" = "." ]; then
  REL_DIR=""
fi

# Converts kebab-case or snake_case to PascalCase
to_pascal_case() {
  echo "$1" | sed -E 's/[-_]+/ /g' | awk '{for(i=1;i<=NF;++i) $i=toupper(substr($i,1,1)) substr($i,2)}1' | tr -d ' '
}

PASCAL_NAME=$(to_pascal_case "$RAW_NAME")

# ------------------------------------------------------------------------------
# Templates
# ------------------------------------------------------------------------------

TEMPLATE_SERVICE="templates/service.js"
TEMPLATE_FETCH="templates/fetch.js"
TEMPLATE_PRESENTER="templates/presenter.js"
TEMPLATE_TEST_SERVICE="templates/service.test.js"
TEMPLATE_TEST_FETCH="templates/fetch.test.js"
TEMPLATE_TEST_PRESENTER="templates/presenter.test.js"

# ------------------------------------------------------------------------------
# Helper Functions
# ------------------------------------------------------------------------------

# Calculates the correct number of ../ for relative import paths in tests
build_up_path() {
  local depth=3 # Always 3 for test/services + REL_DIR slashes
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

# Renders a template into a real file
render_file() {
  local template="$1"
  local output_path="$2"
  local module_name="$3"
  local require_path="$4"
  local readable_label="$5"
  local presenter_path="$6"
  local fetch_path="$7"

  mkdir -p "$(dirname "$output_path")"

  if [ -f "$output_path" ]; then
    echo "⚠️  Skipped (already exists): $output_path"
    return
  fi

  sed -e "s/__MODULENAME__/${module_name}/g" \
      -e "s#__REQUIRE_PATH__#${require_path}#g" \
      -e "s/__DESCRIBE_LABEL__/${readable_label}/g" \
      -e "s/__PRESENTER_NAME__/${PASCAL_NAME}Presenter/g" \
      -e "s#__PRESENTER_PATH__#${presenter_path}#g" \
      -e "s/__FETCH_NAME__/Fetch${PASCAL_NAME}Service/g" \
      -e "s#__FETCH_PATH__#${fetch_path}#g" \
      "$template" > "$output_path"

  echo "✅ Created $output_path"
}

generate_paths() {
  local type="$1"   # Service, Presenter, FetchService

  TYPE="$type"   # Pass back as globals (Bash style)
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
      SOURCE_TEMPLATE="$TEMPLATE_SERVICE"
      TEST_TEMPLATE="$TEMPLATE_TEST_SERVICE"
    fi
  fi

  # Target folders
  if [ "$TYPE" = "Presenter" ]; then
    APP_SUBFOLDER="presenters"
    TEST_SUBFOLDER="presenters"
  else
    APP_SUBFOLDER="services"
    TEST_SUBFOLDER="services"
  fi

  # Output paths
  if [ -n "$REL_DIR" ]; then
    SOURCE_OUTPUT="app/${APP_SUBFOLDER}/${REL_DIR}/${SOURCE_FILE}"
    TEST_OUTPUT="test/${TEST_SUBFOLDER}/${REL_DIR}/${TEST_FILE}"
  else
    SOURCE_OUTPUT="app/${APP_SUBFOLDER}/${SOURCE_FILE}"
    TEST_OUTPUT="test/${TEST_SUBFOLDER}/${TEST_FILE}"
  fi

  # Up path for test requires
  UP_PATH=$(build_up_path)

  REQUIRE_PATH="${UP_PATH}app/${APP_SUBFOLDER}/${REL_DIR}/${SOURCE_FILE}"

  # Presenter / Fetch paths
  PRESENTER_PATH=""
  FETCH_PATH=""

  if [ "$TYPE" = "Service" ]; then
    PRESENTER_PATH="../../../../presenters/${REL_DIR}/${RAW_NAME}.presenter.js"
    FETCH_PATH="./fetch-${RAW_NAME}.service.js"
  fi

  # Readable label
  READABLE_LABEL="$(echo "$RAW_NAME" | sed -E 's/[-_]+/ /g' | awk '{for(i=1;i<=NF;++i) $i=toupper(substr($i,1,1)) substr($i,2)}1') $TYPE"
}

render_source_and_test() {
  local type="$1"

  generate_paths "$type"

  # Create source file
  render_file "$SOURCE_TEMPLATE" "$SOURCE_OUTPUT" "$MODULE_NAME" "" "$READABLE_LABEL" "$PRESENTER_PATH" "$FETCH_PATH"

  # Adjust fetch path for tests if needed
  if [ "$TYPE" = "Service" ]; then
    FETCH_PATH="${UP_PATH}app/services/${REL_DIR}/fetch-${RAW_NAME}.service.js"
  fi

  # Create test file
  render_file "$TEST_TEMPLATE" "$TEST_OUTPUT" "$MODULE_NAME" "$REQUIRE_PATH" "$READABLE_LABEL" "$PRESENTER_PATH" "$FETCH_PATH"
}

# ------------------------------------------------------------------------------
# Interactive CLI Prompt
# ------------------------------------------------------------------------------

echo ""
echo "What do you want to scaffold?"
echo "1) Service only"
echo "2) Presenter only"
echo "3) Service + Presenter"
echo "4) Service + Presenter + FetchService"
echo ""

read -rp "> " choice

case "$choice" in
  1)
    echo "📦 Generating Service..."
    render_source_and_test "Service"
    ;;
  2)
    echo "📦 Generating Presenter..."
    render_source_and_test "Presenter"
    ;;
  3)
    echo "📦 Generating Service + Presenter..."
    render_source_and_test "Service"
    render_source_and_test "Presenter"
    ;;
  4)
    echo "📦 Generating Service + Presenter + FetchService..."
    render_source_and_test "Service"
    render_source_and_test "Presenter"
    render_source_and_test "FetchService"
    ;;
  *)
    echo "❌ Invalid selection. Exiting."
    exit 1
    ;;
esac
