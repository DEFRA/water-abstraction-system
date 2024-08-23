'use strict'

const { timestampForPostgres } = require('../../app/lib/general.lib.js')
const { data: licenceVersionPurposeConditionTypes } = require('./data/licence-version-purpose-condition-types.js')
const LicenceVersionPurposeConditionTypeModel = require('../../app/models/licence-version-purpose-condition-type.model.js')

/**
 * Seeds the licence version purpose condition types reference data using an upsert
 *
 * The water.licence_version_purpose_condition_types has a unique constraint composite key for (code, subcode)
 *
 * Previous table name - water.licence_version_purpose_condition_types
 *
 * Public table name - public.licence_version_purpose_condition_types
 *
 */
async function seed () {
  for (const licenceVersionPurposeConditionType of licenceVersionPurposeConditionTypes) {
    await _upsert(licenceVersionPurposeConditionType)
  }
}

async function _upsert (licenceVersionPurposeConditionType) {
  return LicenceVersionPurposeConditionTypeModel.query()
    .insert({ ...licenceVersionPurposeConditionType, updatedAt: timestampForPostgres() })
    .onConflict(['code', 'subcode'])
    .merge(['description', 'displayTitle', 'subcodeDescription', 'updatedAt'])
}

module.exports = {
  seed
}
