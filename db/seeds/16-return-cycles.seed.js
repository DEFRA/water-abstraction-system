'use strict'

const { timestampForPostgres } = require('../../app/lib/general.lib.js')
const { data: returnCycles } = require('./data/return-cycles.js')
const ReturnCycleModel = require('../../app/models/return-cycle.model.js')

async function seed () {
  for (const cycle of returnCycles) {
    await _upsert(cycle)
  }
}

async function _upsert (cycle) {
  return ReturnCycleModel.query()
    .insert({ ...cycle, createdAt: timestampForPostgres(), updatedAt: timestampForPostgres() })
}

module.exports = {
  seed
}
