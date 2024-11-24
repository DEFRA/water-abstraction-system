'use strict'

const { timestampForPostgres } = require('../../app/lib/general.lib.js')
const { data: primaryPurposes } = require('./data/primary-purposes.js')
const PrimaryPurposeModel = require('../../app/models/primary-purpose.model.js')

/**
 * Seeds the primary purpose reference data using an upsert
 *
 * The water.primary_purposes.legacy_id column must be unique
 *
 * Previous table name - water.primary_purposes
 *
 * Public table name - public.primary_purposes
 *
 */
async function seed() {
  for (const purpose of primaryPurposes) {
    await _upsert(purpose)
  }
}

async function _upsert(primaryPurpose) {
  return PrimaryPurposeModel.query()
    .insert({ ...primaryPurpose, updatedAt: timestampForPostgres() })
    .onConflict('legacyId')
    .merge(['description', 'updatedAt'])
}

module.exports = {
  seed
}
