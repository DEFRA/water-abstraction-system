'use strict'

const { timestampForPostgres } = require('../../app/lib/general.lib.js')
const { data: licenceVersionPurposeConditionTypes } = require('./data/licence-version-purpose-condition-types.js')
const LicenceVersionPurposeConditionTypeModel = require('../../app/models/licence-version-purpose-condition-type.model.js')

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
