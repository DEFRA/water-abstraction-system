'use strict'

const { timestampForPostgres } = require('../../app/lib/general.lib.js')
const { data: primaryPurposes } = require('./data/primary-purposes.js')
const PrimaryPurposeModel = require('../../app/models/primary-purpose.model.js')

async function seed () {
  for (const purpose of primaryPurposes) {
    await _upsert(purpose)
  }
}

async function _upsert (primaryPurpose) {
  return PrimaryPurposeModel.query()
    .insert({ ...primaryPurpose, updatedAt: timestampForPostgres() })
    .onConflict('legacyId')
    .merge(['description', 'updatedAt'])
}

module.exports = {
  seed
}
