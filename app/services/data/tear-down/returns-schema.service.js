'use strict'

/**
 * Removes all data created for acceptance tests from the returns schema
 * @module ReturnsSchemaService
 */

const { db } = require('../../../../db/db.js')

async function go () {
  return Promise.all([
    _lines(),
    _versions(),
    _returns()
  ])
}

async function _lines () {
  return db.raw(`
  ALTER TABLE returns.lines DISABLE TRIGGER ALL;

  DELETE
  FROM
    "returns"."lines" AS "l"
      USING "returns"."versions" AS "v",
    "returns"."returns" AS "r"
  WHERE
    "r"."is_test" = TRUE
    AND "l"."version_id" = "v"."version_id"
    AND "v"."return_id" = "r"."return_id";

  ALTER TABLE returns.lines ENABLE TRIGGER ALL;
  `)
}

async function _versions () {
  return db.raw(`
  ALTER TABLE returns.versions DISABLE TRIGGER ALL;

  DELETE
  FROM
    "returns"."versions" AS "v"
      USING "returns"."returns" AS "r"
  WHERE
    "r"."is_test" = TRUE
    AND "v"."return_id" = "r"."return_id";

  ALTER TABLE returns.versions ENABLE TRIGGER ALL;
  `)
}

async function _returns () {
  await db.raw(`
  ALTER TABLE returns.returns DISABLE TRIGGER ALL;

  DELETE
  FROM
    "returns"."returns"
  WHERE
    "is_test" = TRUE;

  ALTER TABLE returns.returns ENABLE TRIGGER ALL;
  `)
}

module.exports = {
  go
}
