#!/bin/bash

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
TEMPLATE_SERVICE_FETCH="templates/service-fetch.service.js"
TEMPLATE_SERVICE_PRESENTER_SESSION="templates/service-session-presenter.service.js"
TEMPLATE_SUBMIT_SERVICE="templates/submit.service.js"
TEMPLATE_VALIDATOR="templates/validator.js"
TEMPLATE_VIEW="templates/view.njk"


TEMPLATE_TEST_SERVICE="templates/service.test.js"
TEMPLATE_TEST_SERVICE_FETCH="templates/service-fetch.service.test.js"
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
  local slash_count=0
  if [ -n "$REL_DIR" ]; then
    slash_count=$(grep -o "/" <<< "$REL_DIR" | wc -l | tr -d ' ')
  fi
  printf '../%.0s' $(seq 1 $((slash_count + 3)))
}

render_file() {
  local template="$1"
  local output_path="$2"
  local module_name="$3"
  local presenter_path="$4"
  local fetch_path="$5"
  local session_model_path="$6"
  local validator_path="$7"
  local service_path="$8"
  local view_path="$9"

  mkdir -p "$(dirname "$output_path")"

  if [ -f "$output_path" ]; then
    echo "⚠️  Skipped (already exists): $output_path"
    return
  fi

  sed -e "s#__FETCH_PATH__#${fetch_path}#g" \
      -e "s#__PRESENTER_PATH__#${presenter_path}#g" \
      -e "s#__SERVICE_PATH__#${service_path}#g" \
      -e "s#__SESSION_MODEL_PATH__#${session_model_path}#g" \
      -e "s#__VALIDATOR_PATH__#${validator_path}#g" \
      -e "s#__VIEW_PATH__#${view_path}#g" \
      -e "s/__CONTROLLER_NAME__/${PASCAL_NAME}Controller/g" \
      -e "s/__FETCH_NAME__/Fetch${PASCAL_NAME}Service/g" \
      -e "s/__NAME__/${PASCAL_NAME}/g" \
      -e "s/__PRESENTER_NAME__/${PASCAL_NAME}Presenter/g" \
      -e "s/__SERVICE_NAME__/${PASCAL_NAME}Service/g" \
      -e "s/__SUBMIT_NAME__/Submit${PASCAL_NAME}Service/g" \
      -e "s/__VALIDATOR_NAME__/${PASCAL_NAME}Validator/g" \
      -e "s/__MODULE_NAME__/${module_name}/g" \
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
  local session_helper_path="$9"

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
      -e "s#__SESSION_HELPER_PATH__#${session_helper_path}#g" \
      "$template" > "$output_path"

  echo "✅ Created $output_path"
}

generate_controller_snippet() {
  local snippet_template="templates/helper.js"

  if [ -f "$snippet_template" ]; then
    echo ""
    echo "Here is your ready-to-use controller + router snippet:"
    echo ""

    sed -e "s|__SERVICE_NAME__|${PASCAL_NAME}Service|g" \
        -e "s|__SUBMIT_NAME__|Submit${PASCAL_NAME}Service|g" \
        -e "s|__SERVICE_PATH__|${SERVICE_PATH}|g" \
        -e "s|__NAME__|${PASCAL_NAME}|g" \
        -e "s|__VIEW_PATH__|${VIEW_PATH}|g" \
        -e "s|__CONTROLLER_NAME__|${PASCAL_NAME}Controller|g" \
        -e "s|__CONTROLLER_PATH__|${CONTROLLER_PATH}|g" \
        -e "s|__SUBMIT_PATH__|${SUBMIT_PATH}|g" \
        "$snippet_template"

    echo ""
  else
    echo "❌ Snippet template not found: $snippet_template"
  fi
}

generate_paths() {
  local type="$1"    # Service, Presenter,
  local service_variant="$2"  # service, presenter, fetch-presenter

  TYPE="$type"
  TYPE_LOWER=$(echo "$TYPE" | tr '[:upper:]' '[:lower:]')

  MODULE_NAME="${PASCAL_NAME}${TYPE}"
  SOURCE_FILE="${RAW_NAME}.${TYPE_LOWER}.js"
  TEST_FILE="${RAW_NAME}.${TYPE_LOWER}.test.js"

    if [ "$TYPE" = "Service" ]; then
      SUBFOLDER="services"

      # Additional input
      FETCH_PATH="./fetch-${RAW_NAME}.service.js"

      case "$service_variant" in
        service)
          SOURCE_TEMPLATE="$TEMPLATE_SERVICE"
          TEST_TEMPLATE="$TEMPLATE_TEST_SERVICE"
          ;;
        service-with-fetch)
          SOURCE_TEMPLATE="$TEMPLATE_SERVICE_FETCH"
          TEST_TEMPLATE="$TEMPLATE_TEST_SERVICE_FETCH"
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

      SUBFOLDER="presenters"

    elif [ "$TYPE" = "Validator" ]; then
        SOURCE_TEMPLATE="$TEMPLATE_VALIDATOR"
        TEST_TEMPLATE="$TEMPLATE_TEST_VALIDATOR"

        SUBFOLDER="validators"

    elif [ "$TYPE" = "View" ]; then
        SOURCE_FILE="${RAW_NAME}.${TYPE_LOWER}.njk"
        SOURCE_TEMPLATE="$TEMPLATE_VIEW"

        # Do nto generate a view test file
        TEST_TEMPLATE=""
        TEST_FILE=""

        SUBFOLDER="views"
    else
      echo "❌ Unknown type: $TYPE"
      exit 1
    fi

  # When a folder path is supplied
  if [ -n "$REL_DIR" ]; then
    SOURCE_OUTPUT="app/${SUBFOLDER}/${REL_DIR}/${SOURCE_FILE}"
    TEST_OUTPUT="test/${SUBFOLDER}/${REL_DIR}/${TEST_FILE}"
  else
    SOURCE_OUTPUT="app/${SUBFOLDER}/${SOURCE_FILE}"
    TEST_OUTPUT="test/${SUBFOLDER}/${TEST_FILE}"
  fi

  # Helper
  RELATIVE_UP_PATH=$(build_up_path)

  # Test
  DESCRIBE_LABEL="$(echo "$RAW_NAME" | sed -E 's/[-_]+/ /g' | awk '{for(i=1;i<=NF;++i) $i=toupper(substr($i,1,1)) substr($i,2)}1') $TYPE" # Test describe block
  REQUIRE_PATH="${RELATIVE_UP_PATH}app/${SUBFOLDER}/${REL_DIR}/${SOURCE_FILE}"
  TEST_FETCH_PATH="${RELATIVE_UP_PATH}app/services/${REL_DIR}/fetch-${SOURCE_FILE}"

  # Additional paths
  PRESENTER_PATH="${RELATIVE_UP_PATH}app/presenters/${REL_DIR}/${RAW_NAME}.presenter.js"
  VALIDATOR_PATH="${RELATIVE_UP_PATH}app/validators/${REL_DIR}/${RAW_NAME}.validator.js"
  SERVICE_PATH="${RELATIVE_UP_PATH}app/services/${REL_DIR}/${RAW_NAME}.service.js"
  SUBMIT_PATH="${RELATIVE_UP_PATH}app/services/${REL_DIR}/submit-${RAW_NAME}.service.js"
  CONTROLLER_PATH="${RELATIVE_UP_PATH}app/controllers/${REL_DIR}/${RAW_NAME}.controller.js"
  SESSION_MODEL_PATH="${RELATIVE_UP_PATH}app/models/session.model.js"
  SESSION_HELPER_PATH="${RELATIVE_UP_PATH}test/support/helpers/session.helper.js"
  VIEW_PATH="${REL_DIR}/${RAW_NAME}.njk" # The view path for the controllers `h.view()`
}

render_source_and_test() {
  local type="$1"
  local service_variant="$2"

  generate_paths "$type" "$service_variant"

  # Render source file
  render_file "$SOURCE_TEMPLATE" "$SOURCE_OUTPUT" "$MODULE_NAME" "$PRESENTER_PATH" "$FETCH_PATH" "$SESSION_MODEL_PATH" "$VALIDATOR_PATH" "$SERVICE_PATH" "$VIEW_PATH"

  # Render test file
  if [ -n "$TEST_TEMPLATE" ]; then
    render_test_file "$TEST_TEMPLATE" "$TEST_OUTPUT" "$MODULE_NAME" "$REQUIRE_PATH" "$DESCRIBE_LABEL" "$PRESENTER_PATH" "$TEST_FETCH_PATH" "$SESSION_MODEL_PATH" "$SESSION_HELPER_PATH"
  fi
}

# ------------------------------------------------------------------------------
# CLI Prompt
# ------------------------------------------------------------------------------

echo ""
echo "What do you want to scaffold?"
echo "1) Journey - Complete"
echo "2) Journey - View"
echo "3) Journey - Submit"
echo "4) Presenter only"
echo "5) Service only"
echo "6) Service with Fetch"
echo ""

read -rp "> " choice

case "$choice" in
  1)
    echo "📦 Generating complete journey..."
    render_source_and_test "Presenter" ""
    render_source_and_test "View" ""
    render_source_and_test "Service" "presenter-session"
    render_source_and_test "Service" "submit"
    render_source_and_test "Validator" ""

    # Now you can generate the controller
    generate_controller_snippet
    ;;
  2)
    echo "📦 Generating view journey..."
    render_source_and_test "Presenter" ""
    render_source_and_test "View" ""
    render_source_and_test "Service" "presenter-session"
    ;;
  3)
    echo "📦 Generating submit journey..."
    render_source_and_test "Service" "submit"
    render_source_and_test "Validator" ""
    ;;
  4)
    echo "📦 Generating Presenter only..."
    render_source_and_test "Presenter" ""
    ;;
  5)
    echo "📦 Generating Service only..."
    render_source_and_test "Service" "service"
    ;;
  6)
    echo "📦 Generating Service with Fetch..."
    render_source_and_test "Service" "service-with-fetch"
    render_source_and_test "Service" "fetch"
    ;;
  *)
    echo "❌ Invalid selection. Exiting."
    exit 1
    ;;
esac
