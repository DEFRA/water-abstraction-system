'use strict'

/**
 * Persists the licence versions, purposes and conditions
 * @module PersistLicenceVersionsService
 */

const LicenceVersionModel = require('../../models/licence-version.model.js')
const LicenceVersionPurposeModel = require('../../models/licence-version-purpose.model.js')
const PrimaryPurposeModel = require('../../models/primary-purpose.model.js')
const SecondaryPurposeModel = require('../../models/secondary-purpose.model.js')
const PurposeModel = require('../../models/purpose.model.js')

/**
 * Saves the licence versions, purposes and conditions
 *
 * @param {object[]} licenceVersions
 * @param {string} licenceId
 */
async function go (licenceVersions, licenceId) {
  await Promise.all(licenceVersions.map(async (version) => {
    const purposes = version.purposes

    delete version.purposes

    const versionResult = await _saveLicenceVersion(version, licenceId)

    await Promise.all(purposes.map(async (purpose) => {
      return _saveLicenceVersionPurposes(purpose, versionResult.id)
    }))
  }))
}

async function _saveLicenceVersionPurposes (purpose, licenceVersionId) {
  const primaryPurpose = await PrimaryPurposeModel.query()
    .select('id')
    .where('legacyId', purpose.primaryPurposeId)
    .first()
    .limit(1)

  const secondaryPurpose = await SecondaryPurposeModel.query()
    .select('id')
    .where('legacyId', purpose.secondaryPurposeId)
    .first()
    .limit(1)

  const purposeUse = await PurposeModel.query()
    .select('id')
    .where('legacyId', purpose.purposeId)
    .first()
    .limit(1)

  await LicenceVersionPurposeModel.query()
    .insert({
      licenceVersionId,
      ...purpose,
      primaryPurposeId: primaryPurpose.id,
      secondaryPurposeId: secondaryPurpose.id,
      purposeId: purposeUse.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    .onConflict('externalId')
    .merge([
      'abstractionPeriodEndDay',
      'abstractionPeriodEndMonth',
      'abstractionPeriodStartDay',
      'abstractionPeriodStartMonth',
      'annualQuantity',
      'dailyQuantity',
      'hourlyQuantity',
      'instantQuantity',
      'notes',
      'primaryPurposeId',
      'purposeId',
      'secondaryPurposeId',
      'timeLimitedEndDate',
      'timeLimitedStartDate',
      'updatedAt'
    ])
}

async function _saveLicenceVersion (version, licenceId) {
  return LicenceVersionModel.query()
    .insert({
      ...version,
      licenceId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    .onConflict('externalId')
    .merge([
      'licenceId',
      'status',
      'startDate',
      'endDate',
      'updatedAt'
    ])
}

module.exports = {
  go
}
