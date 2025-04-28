#!/bin/bash

# ==============================================================================
# 🛠 Scaffold Script for Services & Presenters
# ------------------------------------------------------------------------------
# Generates boilerplate service & presenter files + their corresponding test files.
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
#   - __MODULENAME__       → PascalCase + Service/Presenter
#   - __REQUIRE_PATH__     → Relative path to source file (for tests)
#   - __DESCRIBE_LABEL__   → Human-readable name for test suite
#   - __PRESENTERNAME__    → PascalCase Presenter name (for services)
#   - __PRESENTER_PATH__   → Relative require path to the presenter
#
# 📁 Required Templates:
#   - templates/service.js
#   - templates/presenter.js
#   - templates/service.test.js
#   - templates/presenter.test.js
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
TEMPLATE_PRESENTER="templates/presenter.js"
TEMPLATE_TEST_SERVICE="templates/service.test.js"
TEMPLATE_TEST_PRESENTER="templates/presenter.test.js"

render_template() {
  local template="$1"
  local output_dir="$2"
  local suffix="$3"      # Service or Presenter
  local is_test="$4"     # "true" or "false"

  local suffix_lower=$(echo "$suffix" | tr '[:upper:]' '[:lower:]')
  local module_name="${PASCAL_NAME}${suffix}"
  local file_name="${RAW_NAME}.${suffix_lower}.js"

  if [ "$is_test" = "true" ]; then
    file_name="${RAW_NAME}.${suffix_lower}.test.js"
  fi

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

  local require_path=""
  local presenter_path=""
  if [ "$is_test" = "true" ]; then
    require_path="../../../../app/${suffix_lower}s/${REL_DIR}/${RAW_NAME}.${suffix_lower}.js"
  fi
  if [ "$suffix" = "Service" ]; then
    presenter_path="../../presenters/${REL_DIR}/${RAW_NAME}.presenter.js"
  fi

  local readable_label="$(echo "$RAW_NAME" | sed -E 's/[-_]+/ /g' | awk '{for(i=1;i<=NF;++i) $i=toupper(substr($i,1,1)) substr($i,2)}1') $suffix"

  sed -e "s/__MODULENAME__/${module_name}/g" \
      -e "s#__REQUIRE_PATH__#${require_path}#g" \
      -e "s/__DESCRIBE_LABEL__/${readable_label}/g" \
      -e "s/__PRESENTERNAME__/${PASCAL_NAME}Presenter/g" \
      -e "s#__PRESENTER_PATH__#${presenter_path}#g" \
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
echo ""

read -rp "> " choice

case "$choice" in
  1)
    echo "📦 Generating Service only..."
    render_template "$TEMPLATE_SERVICE"        "app/services"    "Service"   "false"
    render_template "$TEMPLATE_TEST_SERVICE"    "test/services"   "Service"   "true"
    ;;
  2)
    echo "📦 Generating Presenter only..."
    render_template "$TEMPLATE_PRESENTER"       "app/presenters"  "Presenter" "false"
    render_template "$TEMPLATE_TEST_PRESENTER"   "test/presenters" "Presenter" "true"
    ;;
  3)
    echo "📦 Generating Service + Presenter..."
    render_template "$TEMPLATE_SERVICE"         "app/services"    "Service"   "false"
    render_template "$TEMPLATE_PRESENTER"        "app/presenters"  "Presenter" "false"
    render_template "$TEMPLATE_TEST_SERVICE"     "test/services"   "Service"   "true"
    render_template "$TEMPLATE_TEST_PRESENTER"   "test/presenters" "Presenter" "true"
    ;;
  *)
    echo "❌ Invalid selection. Exiting."
    exit 1
    ;;
esac


# ==============================================================================
# Create all no Interactive Prompt
# ==============================================================================

## Main files
#render_template "$TEMPLATE_SERVICE"   "app/services"    "Service"   "false"
#render_template "$TEMPLATE_PRESENTER" "app/presenters"  "Presenter" "false"
#
## Test files
#render_template "$TEMPLATE_TEST_SERVICE"   "test/services"   "Service"   "true"
#render_template "$TEMPLATE_TEST_PRESENTER" "test/presenters" "Presenter" "true"
