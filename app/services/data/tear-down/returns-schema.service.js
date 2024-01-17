'use strict'

/**
 * Removes all data created for acceptance tests from the returns schema
 * @module ReturnsSchemaService
 */

const { db } = require('../../../../db/db.js')

async function go () {
  const startTime = process.hrtime.bigint()

  await _disableTriggers()

  await db
    .from('returns.lines as l')
    .innerJoin('returns.versions as v', 'l.versionId', 'v.versionId')
    .innerJoin('returns.returns as r', 'v.returnId', 'r.returnId')
    .where('r.isTest', true)
    .del()
  await db.raw('ALTER TABLE returns.lines ENABLE TRIGGER ALL')

  await db
    .from('returns.versions as v')
    .innerJoin('returns.returns as r', 'v.returnId', 'r.returnId')
    .where('r.isTest', true)
    .del()
  await db.raw('ALTER TABLE returns.lines ENABLE TRIGGER ALL')

  await db
    .from('returns.returns')
    .where('isTest', true)
    .del()

  await _enableTriggers()

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

function _calculateAndLogTime (startTime) {
  const endTime = process.hrtime.bigint()
  const timeTakenNs = endTime - startTime
  const timeTakenMs = timeTakenNs / 1000000n

  global.GlobalNotifier.omg('Returns complete', { timeTakenMs })
}

module.exports = {
  go
}
