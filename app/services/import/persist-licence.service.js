'use strict'

/**
 * Creates or updates an imported licence and its child entities that have been transformed and validated
 * @module PersistLicenceService
 */

const { timestampForPostgres } = require('../../lib/general.lib.js')
const CompanyContactModel = require('../../models/company-contact.model.js')
const CompanyModel = require('../../models/company.model.js')
const LicenceModel = require('../../models/licence.model.js')
const LicenceVersionModel = require('../../models/licence-version.model.js')
const LicenceVersionPurposeConditionModel = require('../../models/licence-version-purpose-condition.model.js')
const LicenceVersionPurposeModel = require('../../models/licence-version-purpose.model.js')

/**
 * Creates or updates an imported licence and its child entities that have been transformed and validated
 *
 * @param {object} transformedLicence - An object representing a valid WRLS licence
 * @param {object[]} transformedCompanies - an array of companies representing a WRLS company
 *
 * @returns {Promise<object>}
 */
async function go (transformedLicence, transformedCompanies) {
  return LicenceModel.transaction(async (trx) => {
    const updatedAt = timestampForPostgres()
    const { id } = await _persistLicence(trx, updatedAt, transformedLicence)

    await _persistLicenceVersions(trx, updatedAt, transformedLicence.licenceVersions, id)

    await _persistCompanies(trx, updatedAt, transformedCompanies)

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

async function _persistLicenceVersionPurposeConditions (
  trx, updatedAt, licenceVersionPurposeConditions, licenceVersionPurposeId) {
  for (const licenceVersionPurposeCondition of licenceVersionPurposeConditions) {
    await _persistLicenceVersionPurposeCondition(
      trx, updatedAt, licenceVersionPurposeCondition, licenceVersionPurposeId)
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

// Companies
async function _persistCompanies (trx, updatedAt, companies) {
  for (const companyToPersist of companies) {
    const { licenceHolder, ...company } = companyToPersist

    await _persistCompany(trx, updatedAt, company)

    if (licenceHolder) {
      await _persistLicenceHolder(trx, updatedAt, licenceHolder)
    }
  }
}

async function _persistCompany (trx, updatedAt, company) {
  const { ...propertiesToPersist } = company

  return CompanyModel.query(trx)
    .insert({ ...propertiesToPersist, updatedAt })
    .onConflict('externalId')
    .merge([
      'name',
      'type',
      'updatedAt'
    ])
}

async function _persistLicenceHolder (trx, updatedAt, licenceHolder) {
  // return CompanyContactModel.query(trx)
  //   .insert({ ...licenceHolder, updatedAt })
  //   .onConflict([])

//   SELECT c.company_id, o.contact_id, r.role_id, $4, $5, true, NOW(), NOW()
// FROM crm_v2.companies c
// JOIN crm_v2.contacts o ON o.external_id=$2
// JOIN crm_v2.roles r ON r.name=$3
// WHERE c.external_id=$1 ON CONFLICT (company_id, contact_id, role_id, start_date) DO UPDATE SET
//   contact_id=EXCLUDED.contact_id,
//   is_default=EXCLUDED.is_default,
//   end_date=EXCLUDED.end_date,
//   date_updated=EXCLUDED.date_updated;`
}

module.exports = {
  go
}
