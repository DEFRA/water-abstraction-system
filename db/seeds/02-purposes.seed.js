'use strict'

const { timestampForPostgres } = require('../../app/lib/general.lib.js')
const { data: purposes } = require('./data/purposes.js')
const PurposeModel = require('../../app/models/purpose.model.js')

/**
 * Seeds the purposes reference data using an upsert
 *
 * The water.purpose_uses.legacy_id column must be unique
 *
 * Previous table name - water.purposes_uses
 *
 * Public table name - public.purposes
 *
 */
async function seed () {
  for (const purpose of purposes) {
    await _upsert(purpose)
  }
}

async function _upsert (purpose) {
  return PurposeModel.query()
    .insert({ ...purpose, updatedAt: timestampForPostgres() })
    .onConflict('legacyId')
    .merge(['description', 'lossFactor', 'twoPartTariff', 'updatedAt'])
}

module.exports = {
  seed
}
