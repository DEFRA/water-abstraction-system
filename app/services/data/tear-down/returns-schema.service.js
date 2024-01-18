'use strict'

/**
 * Removes all data created for acceptance tests from the returns schema
 * @module ReturnsSchemaService
 */

const { db } = require('../../../../db/db.js')

async function go () {
  const startTime = process.hrtime.bigint()

  // await _disableTriggers()

  // let query = db
  //   .from('returns.lines as l')
  //   .innerJoin('returns.versions as v', 'l.versionId', 'v.versionId')
  //   .innerJoin('returns.returns as r', 'v.returnId', 'r.returnId')
  //   .where('r.isTest', true)
  //   .del()
  //   .toString()
  // console.log('🚀 ~ RTNS-LINES:', query)

  // await db
  //   .from('returns.lines as l')
  //   .innerJoin('returns.versions as v', 'l.versionId', 'v.versionId')
  //   .innerJoin('returns.returns as r', 'v.returnId', 'r.returnId')
  //   .where('r.isTest', true)
  //   .del()

  // query = db
  //   .from('returns.versions as v')
  //   .innerJoin('returns.returns as r', 'v.returnId', 'r.returnId')
  //   .where('r.isTest', true)
  //   .del()
  //   .toString()
  // console.log('🚀 ~ RTNS-VERSIONS:', query)

  // await db
  //   .from('returns.versions as v')
  //   .innerJoin('returns.returns as r', 'v.returnId', 'r.returnId')
  //   .where('r.isTest', true)
  //   .del()

  // query = db
  //   .from('returns.returns')
  //   .where('isTest', true)
  //   .del()
  //   .toString()
  // console.log('🚀 ~ RTNS-RETURNS:', query)

  // await db
  //   .from('returns.returns')
  //   .where('isTest', true)
  //   .del()

  // await _enableTriggers()

  await _raw()

  // await Promise.all([
  //   _lines(),
  //   _versions(),
  //   _returns()
  // ])

  _calculateAndLogTime(startTime)
}

async function _disableTriggers () {
  await Promise.all([
    db.raw('ALTER TABLE returns.lines DISABLE TRIGGER ALL'),
    db.raw('ALTER TABLE returns.versions DISABLE TRIGGER ALL'),
    db.raw('ALTER TABLE returns.returns DISABLE TRIGGER ALL')
  ])
}

async function _enableTriggers () {
  await Promise.all([
    db.raw('ALTER TABLE returns.lines ENABLE TRIGGER ALL'),
    db.raw('ALTER TABLE returns.versions ENABLE TRIGGER ALL'),
    db.raw('ALTER TABLE returns.returns ENABLE TRIGGER ALL')
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

async function _returns() {
  await db.raw(`
  ALTER TABLE returns.returns DISABLE TRIGGER ALL;

  delete from "returns"."returns" where "is_test" = TRUE;

  ALTER TABLE returns.returns ENABLE TRIGGER ALL;
  `)
}

async function _raw () {
  await db.raw(`
  ALTER TABLE returns.lines DISABLE TRIGGER ALL;
  ALTER TABLE returns.versions DISABLE TRIGGER ALL;
  ALTER TABLE returns.returns DISABLE TRIGGER ALL;

  delete from "returns"."lines" as "l" using "returns"."versions" as "v","returns"."returns" as "r" where "r"."is_test" = true and "l"."version_id" = "v"."version_id" and "v"."return_id" = "r"."return_id";
  delete from "returns"."versions" as "v" using "returns"."returns" as "r" where "r"."is_test" = true and "v"."return_id" = "r"."return_id";
  delete from "returns"."returns" where "is_test" = TRUE;

  ALTER TABLE returns.lines ENABLE TRIGGER ALL;
  ALTER TABLE returns.versions ENABLE TRIGGER ALL;
  ALTER TABLE returns.returns ENABLE TRIGGER ALL;
  `)
}

function _calculateAndLogTime (startTime) {
  const endTime = process.hrtime.bigint()
  const timeTakenNs = endTime - startTime
  const timeTakenMs = timeTakenNs / 1000000n

  global.GlobalNotifier.omg('Returns complete', { timeTakenMs })
}

module.exports = {
  go
}
