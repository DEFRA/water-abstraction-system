'use strict'

/**
 * Persists the licence versions
 * @module PersistLicenceVersionsService
 */

const LicenceVersionModel = require('../../models/licence-version.model.js')
const LicenceVersionPurposeModel = require('../../models/licence-version-purpose.model.js')
const PrimaryPurposeModel = require('../../models/primary-purpose.model.js')
const SecondaryPurposeModel = require('../../models/secondary-purpose.model.js')
const PurposeModel = require('../../models/purpose.model.js')

/**
 * Saves the licence versions
 *
 * @param {LegacyLicenceVersionsArray} licenceVersions
 * @param {string} licenceId
 */
async function go (licenceVersions, licenceId) {
  return Promise.all(licenceVersions.map(async (version) => {
    const versionResult = await LicenceVersionModel.query()
      .insert({
        ...version,
        licenceId
      })
      .onConflict('externalId')
      .merge([
        'licenceId',
        'status',
        'startDate',
        'endDate',
        'updatedAt'
      ])

    return Promise.all(version.purposes.map(async (purpose) => {
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

      return LicenceVersionPurposeModel.query()
        .insert({
          licence_version_id: versionResult.id,
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
          'externalId',
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
    }))
  }))
}

module.exports = {
  go
}
