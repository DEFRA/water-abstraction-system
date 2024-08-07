'use strict'

const { timestampForPostgres } = require('../../app/lib/general.lib.js')
const { data: secondaryPurposes } = require('./data/secondary-purposes.js')
const SecondaryPurposeModel = require('../../app/models/secondary-purpose.model.js')

async function seed () {
  for (const purpose of secondaryPurposes) {
    await _upsert(purpose)
  }
}

async function _upsert (secondaryPurpose) {
  return SecondaryPurposeModel.query()
    .insert({ ...secondaryPurpose, updatedAt: timestampForPostgres() })
    .onConflict('legacyId')
    .merge(['description', 'updatedAt'])
}

module.exports = {
  seed
}
