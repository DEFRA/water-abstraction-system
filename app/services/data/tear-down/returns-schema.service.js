'use strict'

/**
 * Removes all data created for acceptance tests from the returns schema
 * @module ReturnsSchemaService
 */

const { db } = require('../../../../db/db.js')
const { formatDateObjectToISO } = require('../../../lib/dates.lib.js')
const { today } = require('../../../lib/general.lib.js')
const { determineCycleEndDate } = require('../../../lib/return-cycle-dates.lib.js')

/**
 * Removes all data created for acceptance tests from the returns schema
 *
 * @returns {Promise<object>}
 */
async function go() {
  const endDates = _determineCurrentReturnCycleEndDates()

  return _deleteAllTestData(endDates)
}

async function _deleteAllTestData(endDates) {
  return db.raw(
    `
  ALTER TABLE returns.lines DISABLE TRIGGER ALL;
  ALTER TABLE returns.versions DISABLE TRIGGER ALL;
  ALTER TABLE returns.returns DISABLE TRIGGER ALL;

  DELETE
  FROM
    "returns"."lines" AS "l"
      USING "returns"."versions" AS "v",
    "returns"."returns" AS "r"
  WHERE
    "r"."is_test" = TRUE
    AND "l"."version_id" = "v"."version_id"
    AND "v"."return_id" = "r"."return_id";

  DELETE
  FROM
    "returns"."versions" AS "v"
      USING "returns"."returns" AS "r"
  WHERE
    "r"."is_test" = TRUE
    AND "v"."return_id" = "r"."return_id";

  DELETE
  FROM
    "returns"."returns"
  WHERE
    "is_test" = TRUE;

  DELETE
  FROM
    "returns"."returns" AS "r"
    USING "water"."licences" AS "l"
  WHERE
    "l"."is_test" = TRUE
    AND "r"."licence_ref" = "l"."licence_ref";

  CREATE TEMP TABLE "future_cycles" AS
    SELECT
      "rc"."return_cycle_id"
    FROM
      "returns"."return_cycles" "rc"
    WHERE
      "rc"."is_summer" = TRUE
      AND "rc"."end_date" > '${endDates.summerEndDate}'
    UNION ALL
    SELECT
      "rc"."return_cycle_id"
    FROM
      "returns"."return_cycles" "rc"
    WHERE
      "rc"."is_summer" = FALSE
      AND "rc"."end_date" > '${endDates.winterEndDate}';

  DELETE FROM "returns".lines AS "rl"
  USING "returns"."versions" AS "rv",
        "returns"."returns" AS "r",
        "future_cycles" AS "fc"
  WHERE "r"."return_cycle_id" = "fc"."return_cycle_id"
    AND "rv"."return_id" = "r"."return_id"
    AND "rl"."version_id" = "rv"."version_id";

  DELETE FROM "returns".versions AS "rv"
  USING "returns"."returns" AS r,
        "future_cycles" AS "fc"
  WHERE "r"."return_cycle_id" = "fc"."return_cycle_id"
    AND "rv"."return_id" = "r"."return_id";

  DELETE FROM "returns"."returns" AS "r"
  USING "future_cycles" AS "fc"
  WHERE "r"."return_cycle_id" = "fc"."return_cycle_id";

  DELETE FROM "returns"."return_cycles" AS "rc"
  USING "future_cycles" AS "fc"
  WHERE "rc"."return_cycle_id" = "fc"."return_cycle_id";

  DROP TABLE "future_cycles";

  ALTER TABLE returns.lines ENABLE TRIGGER ALL;
  ALTER TABLE returns.versions ENABLE TRIGGER ALL;
  ALTER TABLE returns.returns ENABLE TRIGGER ALL;
  `
  )
}

function _determineCurrentReturnCycleEndDates() {
  const todaysDate = today()

  return {
    summerEndDate: formatDateObjectToISO(determineCycleEndDate(true, todaysDate)),
    winterEndDate: formatDateObjectToISO(determineCycleEndDate(false, todaysDate))
  }
}

module.exports = {
  go
}
