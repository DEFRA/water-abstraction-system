'use strict'

/**
 * Creates or updates an imported licence's versions and its child entities that have been transformed and validated
 * @module PersistLicenceVersionsService
 */

const LicenceVersionPurposeConditionModel = require('../../../models/licence-version-purpose-condition.model.js')
const LicenceVersionPurposeModel = require('../../../models/licence-version-purpose.model.js')
const LicenceVersionModel = require('../../../models/licence-version.model.js')

/**
 * Creates or updates an imported licence's versions and its child entities that have been transformed and validated.
 *
 * @param {object} trx - An Objection.js transaction object for PostgreSQL.
 * @param {string} updatedAt - The timestamp indicating when the entity was last updated.
 * @param {object} transformedLicence - An object representing a valid WRLS licence.
 * @param {string} licenceId - A licence id from WRLS
 *
 */
async function go (trx, updatedAt, transformedLicence, licenceId) {
  await _persistLicenceVersions(trx, updatedAt, transformedLicence.licenceVersions, licenceId)
}

async function _persistLicenceVersion (trx, updatedAt, licenceVersion, licenceId) {
  const { licenceVersionPurposes, ...propertiesToPersist } = licenceVersion

  return LicenceVersionModel.query(trx)
    .insert({ ...propertiesToPersist, licenceId, updatedAt })
    .onConflict('externalId')
    .merge([
      'endDate',
      'startDate',
      'status',
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
    const licenceVersionPurposeConditions = licenceVersionPurpose.licenceVersionPurposeConditions

    const { id } = await _persistLicenceVersionPurpose(
      trx, updatedAt, licenceVersionPurpose, licenceVersionId)

    await _persistLicenceVersionPurposeConditions(trx, updatedAt, licenceVersionPurposeConditions, id)
  }
}

async function _persistLicenceVersionPurposeCondition (
  trx, updatedAt, licenceVersionPurposeConditions, licenceVersionPurposeId) {
  const { ...propertiesToPersist } = licenceVersionPurposeConditions

  return LicenceVersionPurposeConditionModel.query(trx)
    .insert({ ...propertiesToPersist, licenceVersionPurposeId, updatedAt })
    .onConflict('externalId')
    .merge([
      'licenceVersionPurposeConditionTypeId',
      'param1',
      'param2',
      'notes',
      'updatedAt'
    ])
    .returning('id')
}

async function _persistLicenceVersionPurposeConditions (
  trx, updatedAt, licenceVersionPurposeConditions, licenceVersionPurposeId) {
  for (const licenceVersionPurposeCondition of licenceVersionPurposeConditions) {
    await _persistLicenceVersionPurposeCondition(
      trx, updatedAt, licenceVersionPurposeCondition, licenceVersionPurposeId)
  }
}

module.exports = {
  go
}
