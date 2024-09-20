'use strict'

/**
 * Creates or updates an imported licence and its child entities that have been transformed and validated
 * @module PersistLicenceService
 */

const CompanyContactModel = require('../../models/company-contact.model.js')
const CompanyModel = require('../../models/company.model.js')
const ContactModel = require('../../models/contact.model.js')
const LicenceModel = require('../../models/licence.model.js')
const LicenceVersionModel = require('../../models/licence-version.model.js')
const LicenceVersionPurposeConditionModel = require('../../models/licence-version-purpose-condition.model.js')
const LicenceVersionPurposeModel = require('../../models/licence-version-purpose.model.js')
const { timestampForPostgres } = require('../../lib/general.lib.js')
const { db } = require('../../../db/db.js')

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
  for (const company of companies) {
    await _persistCompany(trx, updatedAt, company)

    if (company.contact) {
      await _persistContact(trx, updatedAt, company.contact)
    }

    if (company.companyContact) {
      await _persistsCompanyContact(trx, updatedAt, company.companyContact)
    }
  }
}

async function _persistCompany (trx, updatedAt, company) {
  const { contact, companyContact, ...propertiesToPersist } = company

  return CompanyModel.query(trx)
    .insert({ ...propertiesToPersist, updatedAt })
    .onConflict('externalId')
    .merge([
      'name',
      'type',
      'updatedAt'
    ])
}

async function _persistContact (trx, updatedAt, contact) {
  return ContactModel.query(trx)
    .insert({ ...contact, updatedAt })
    .onConflict('externalId')
    .merge([
      'salutation',
      'initials',
      'firstName',
      'lastName',
      'updatedAt'
    ])
}

async function _persistsCompanyContact (trx, updatedAt, companyContact) {
  const { externalId, startDate, licenceRoleId } = companyContact

  return db.raw(`
    INSERT INTO public."company_contacts" (company_id, contact_id, licence_role_id, start_date, "default", created_at, updated_at)
    SELECT com.id, con.id, lr.id, ?, true, NOW(), ?
    FROM public.companies com
      JOIN public.contacts con ON con.external_id = ?
      JOIN public."licence_roles" lr on lr.id = ?
    WHERE com.external_id = ?
    ON CONFLICT (company_id, contact_id, licence_role_id, start_date)
      DO UPDATE SET
        contact_id = EXCLUDED.contact_id,
        "default" = EXCLUDED."default",
        updated_at = EXCLUDED.updated_at
  `, [startDate, updatedAt, externalId, licenceRoleId, externalId])
    .transacting(trx)
}

module.exports = {
  go
}
