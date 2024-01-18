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

  delete from "returns"."lines" as "l" using "returns"."versions" as "v","returns"."returns" as "r" where "r"."is_test" = true and "l"."version_id" = "v"."version_id" and "v"."return_id" = "r"."return_id";

  ALTER TABLE returns.lines ENABLE TRIGGER ALL;
  `)
}

async function _versions () {
  return db.raw(`
  ALTER TABLE returns.versions DISABLE TRIGGER ALL;

  delete from "returns"."versions" as "v" using "returns"."returns" as "r" where "r"."is_test" = true and "v"."return_id" = "r"."return_id";

  ALTER TABLE returns.versions ENABLE TRIGGER ALL;
  `)
}

async function _returns () {
  await db.raw(`
  ALTER TABLE returns.returns DISABLE TRIGGER ALL;

  delete from "returns"."returns" where "is_test" = TRUE;

  ALTER TABLE returns.returns ENABLE TRIGGER ALL;
  `)
}

module.exports = {
  go
}
