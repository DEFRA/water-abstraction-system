'use strict'

/**
 * Removes all data created for acceptance tests from the returns schema
 * @module ReturnsSchemaService
 */

const { db } = require('../../../../db/db.js')

/**
 * Removes all data created for acceptance tests from the returns schema
 *
 * @returns {Promise<object>}
 */
async function go() {
  return _deleteAllTestData()
}

async function _deleteAllTestData() {
  return db.raw(`
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


  ALTER TABLE returns.lines ENABLE TRIGGER ALL;
  ALTER TABLE returns.versions ENABLE TRIGGER ALL;
  ALTER TABLE returns.returns ENABLE TRIGGER ALL;
  `)
}

module.exports = {
  go
}
