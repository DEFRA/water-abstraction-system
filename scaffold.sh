#!/bin/bash

# ==============================================================================
# 🛠 Scaffold Script for Services, Presenters & Fetch Services
# ------------------------------------------------------------------------------
# Generates boilerplate source files + corresponding test files.
#
# ✅ USAGE:
#   ./scaffold.sh <name> or <path/to/name>
#
# 🔤 Examples:
#   ./scaffold.sh my-module
#     → app/services/my-module.service.js
#     → test/services/my-module.service.test.js
#
#   ./scaffold.sh notices/setup/ad-hoc-licence
#     → app/services/notices/setup/ad-hoc-licence.service.js
#     → test/services/notices/setup/ad-hoc-licence.service.test.js
#
# 🧠 Template placeholders replaced:
#   - __MODULENAME__       → PascalCase + Service/Presenter/FetchService name
#   - __REQUIRE_PATH__     → Relative path to source file (for tests)
#   - __DESCRIBE_LABEL__   → Human-readable name for test suite
#   - __PRESENTERNAME__    → PascalCase Presenter name (for services)
#   - __PRESENTER_PATH__   → Relative require path to the presenter
#   - __FETCH_NAME__       → PascalCase FetchService class name
#   - __FETCH_PATH__       → Relative require path to the fetch service
#
# 📁 Required Templates:
#   - templates/service.js         (Service source)
#   - templates/service.test.js    (Service test)
#   - templates/fetch.js           (Fetch service source)
#   - templates/fetch.test.js      (Fetch service test)
#   - templates/presenter.js       (Presenter source)
#   - templates/presenter.test.js  (Presenter test)
#
# 📋 Options (interactive prompt after running):
#   1) Service only
#   2) Presenter only
#   3) Service + Presenter
#   4) Service + Presenter + FetchService
#
#   → Files are created under `app/` and `test/` folders based on your choice.
#   → Directories are auto-created if needed.
#   → Existing files are skipped (with a warning).
# ==============================================================================

set -e

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

# Templates
TEMPLATE_SERVICE="templates/service.js"
TEMPLATE_FETCH="templates/fetch.js"
TEMPLATE_PRESENTER="templates/presenter.js"
TEMPLATE_TEST_SERVICE="templates/service.test.js"
TEMPLATE_TEST_FETCH="templates/fetch.test.js"
TEMPLATE_TEST_PRESENTER="templates/presenter.test.js"

render_template() {
  local template="$1"
  local output_dir="$2"
  local suffix="$3"      # Service, Presenter, FetchService
  local is_test="$4"     # "true" or "false"

  local suffix_lower=$(echo "$suffix" | tr '[:upper:]' '[:lower:]')

  # Module/class name
  if [ "$suffix" = "FetchService" ]; then
    local module_name="Fetch${PASCAL_NAME}Service"
  else
    local module_name="${PASCAL_NAME}${suffix}"
  fi

  # File name
  local file_name=""
  if [ "$suffix" = "FetchService" ]; then
    if [ "$is_test" = "true" ]; then
      file_name="fetch-${RAW_NAME}.service.test.js"
    else
      file_name="fetch-${RAW_NAME}.service.js"
    fi
  else
    if [ "$is_test" = "true" ]; then
      file_name="${RAW_NAME}.${suffix_lower}.test.js"
    else
      file_name="${RAW_NAME}.${suffix_lower}.js"
    fi
  fi

  # Output path
  local output_path=""
  if [ -n "$REL_DIR" ]; then
    output_path="${output_dir}/${REL_DIR}/${file_name}"
  else
    output_path="${output_dir}/${file_name}"
  fi

  mkdir -p "$(dirname "$output_path")"

  if [ -f "$output_path" ]; then
    echo "⚠️  Skipped (already exists): $output_path"
    return
  fi

  # Placeholder paths
  local require_path=""
  if [ "$is_test" = "true" ]; then
    if [ "$suffix" = "FetchService" ]; then
      require_path="../../../app/services/${REL_DIR}/fetch-${RAW_NAME}.service.js"
    else

      require_path="../../../app/${suffix_lower}s/${REL_DIR}/${RAW_NAME}.${suffix_lower}.js"
    fi
  fi

  local presenter_path=""
  if [ "$suffix" = "Service" ]; then
    presenter_path="../../presenters/${REL_DIR}/${RAW_NAME}.presenter.js"
  fi

local fetch_require_path=""
if [ "$suffix" = "Service" ]; then
  if [ "$is_test" = "true" ]; then
    fetch_require_path="../../../app/services/${REL_DIR}/fetch-${RAW_NAME}.service.js"
  else
    fetch_require_path="./fetch-${RAW_NAME}.service.js"
  fi
fi


  local readable_label="$(echo "$RAW_NAME" | sed -E 's/[-_]+/ /g' | awk '{for(i=1;i<=NF;++i) $i=toupper(substr($i,1,1)) substr($i,2)}1') $suffix"

sed -e "s/__MODULENAME__/${module_name}/g" \
    -e "s#__REQUIRE_PATH__#${require_path}#g" \
    -e "s/__DESCRIBE_LABEL__/${readable_label}/g" \
    -e "s/__PRESENTERNAME__/${PASCAL_NAME}Presenter/g" \
    -e "s#__PRESENTER_PATH__#${presenter_path}#g" \
    -e "s/__FETCH_NAME__/Fetch${PASCAL_NAME}Service/g" \
   -e "s#__FETCH_PATH__#${fetch_require_path}#g" \
    "$template" > "$output_path"

  echo "✅ Created $output_path"
}

# ==============================================================================
# Interactive Prompt
# ==============================================================================

echo ""
echo "What do you want to scaffold?"
echo "1) Service only"
echo "2) Presenter only"
echo "3) Service + Presenter"
echo "4) Service + Presenter + Fetch"
echo ""

read -rp "> " choice

case "$choice" in
  1)
    echo "📦 Generating Service only..."
    render_template "$TEMPLATE_SERVICE"         "app/services"    "Service"       "false"
    render_template "$TEMPLATE_TEST_SERVICE"     "test/services"   "Service"       "true"
    ;;
  2)
    echo "📦 Generating Presenter only..."
    render_template "$TEMPLATE_PRESENTER"        "app/presenters"  "Presenter"     "false"
    render_template "$TEMPLATE_TEST_PRESENTER"   "test/presenters" "Presenter"     "true"
    ;;
  3)
    echo "📦 Generating Service + Presenter..."
    render_template "$TEMPLATE_SERVICE"          "app/services"    "Service"       "false"
    render_template "$TEMPLATE_PRESENTER"         "app/presenters"  "Presenter"     "false"
    render_template "$TEMPLATE_TEST_SERVICE"      "test/services"   "Service"       "true"
    render_template "$TEMPLATE_TEST_PRESENTER"    "test/presenters" "Presenter"     "true"
    ;;
  4)
    echo "📦 Generating Service + Presenter + Fetch..."
    render_template "$TEMPLATE_SERVICE"          "app/services"    "Service"       "false"
    render_template "$TEMPLATE_FETCH"             "app/services"    "FetchService"  "false"
    render_template "$TEMPLATE_PRESENTER"         "app/presenters"  "Presenter"     "false"
    render_template "$TEMPLATE_TEST_SERVICE"      "test/services"   "Service"       "true"
    render_template "$TEMPLATE_TEST_FETCH"        "test/services"   "FetchService"  "true"
    render_template "$TEMPLATE_TEST_PRESENTER"    "test/presenters" "Presenter"     "true"
    ;;
  *)
    echo "❌ Invalid selection. Exiting."
    exit 1
    ;;
esac
