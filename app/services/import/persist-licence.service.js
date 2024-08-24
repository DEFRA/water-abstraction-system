'use strict'

/**
 * Creates or updates an imported licence and its child entities that have been transformed and validated
 * @module PersistLicenceService
 */

const { timestampForPostgres } = require('../../lib/general.lib.js')
const LicenceModel = require('../../models/licence.model.js')
const LicenceVersionModel = require('../../models/licence-version.model.js')
const LicenceVersionPurposeModel = require('../../models/licence-version-purpose.model.js')

/**
 * Creates or updates an imported licence and its child entities that have been transformed and validated
 *
 * @param {object} transformedLicence - An object representing a valid WRLS licence
 *
 * @returns {Promise<object>}
 */
async function go (transformedLicence) {
  return LicenceModel.transaction(async (trx) => {
    const updatedAt = timestampForPostgres()
    const { id } = await _persistLicence(trx, updatedAt, transformedLicence)

    await _persistLicenceVersions(trx, updatedAt, transformedLicence.licenceVersions, id)

    return id
  })
}

async function _persistLicence (trx, updatedAt, licence) {
  const { licenceVersions, ...propertiesToPersist } = licence

  return LicenceModel.query(trx)
    .insert({ ...propertiesToPersist, updatedAt })
    .onConflict('licenceRef')
    .merge([
      'expiredDate',
      'lapsedDate',
      'regions',
      'revokedDate',
      'startDate',
      'updatedAt',
      'waterUndertaker'
    ])
    .returning('id')
}

async function _persistLicenceVersion (trx, updatedAt, licenceVersion, licenceId) {
  const { licenceVersionPurposes, ...propertiesToPersist } = licenceVersion

  return LicenceVersionModel.query(trx)
    .insert({ ...propertiesToPersist, licenceId, updatedAt })
    .onConflict('externalId')
    .merge([
      'licenceId',
      'status',
      'startDate',
      'endDate',
      'updatedAt'
    ])
    .returning('id')
}

async function _persistLicenceVersions (trx, updatedAt, licenceVersions, licenceId) {
  for (const licenceVersion of licenceVersions) {
    const { id } = await _persistLicenceVersion(trx, updatedAt, licenceVersion, licenceId)

    await _persistLicenceVersionPurposes(trx, updatedAt, licenceVersion.licenceVersionPurposes, id)
  }
}

async function _persistLicenceVersionPurpose (trx, updatedAt, licenceVersionPurpose, licenceVersionId) {
  const { ...propertiesToPersist } = licenceVersionPurpose

  return LicenceVersionPurposeModel.query(trx)
    .insert({ ...propertiesToPersist, licenceVersionId, updatedAt })
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
    .returning('id')
}

async function _persistLicenceVersionPurposes (trx, updatedAt, licenceVersionPurposes, licenceVersionId) {
  for (const licenceVersionPurpose of licenceVersionPurposes) {
    await _persistLicenceVersionPurpose(trx, updatedAt, licenceVersionPurpose, licenceVersionId)
  }
}

module.exports = {
  go
}
