'use strict'

/**
 * Creates or updates a company
 * @module PersistCompanyService
 */

const PersistContactService = require('./persist-contact.service.js')
const PersistAddressService = require('./persist-address.service.js')
const CompanyModel = require('../../../models/company.model.js')
const { db } = require('../../../../db/db.js')

/**
 * Creates or updates a company
 *
 * @param trx - the current database transaction
 * @param updatedAt
 * @param companies
 */
async function go (trx, updatedAt, companies) {
  await _persistCompanies(trx, updatedAt, companies)
}

async function _persistCompanies (trx, updatedAt, companies) {
  for (const company of companies) {
    await _persistCompany(trx, updatedAt, company)

    if (company.contact) {
      await PersistContactService.go(trx, updatedAt, company.contact)
    }

    if (company.companyContact) {
      await _persistsCompanyContact(trx, updatedAt, company.companyContact)
    }

    await PersistAddressService.go(trx, updatedAt, company.addresses)
  }
}

async function _persistCompany (trx, updatedAt, company) {
  const { contact, companyContact, addresses, ...propertiesToPersist } = company

  return CompanyModel.query(trx)
    .insert({ ...propertiesToPersist, updatedAt })
    .onConflict('externalId')
    .merge([
      'name',
      'type',
      'updatedAt'
    ])
}

async function _persistsCompanyContact (trx, updatedAt, companyContact) {
  const { externalId, startDate, licenceRoleId } = companyContact

  return db.raw(`
    INSERT INTO public."company_contacts" (company_id, contact_id, licence_role_id, start_date, "default", created_at, updated_at)
    SELECT com.id, con.id, lr.id, ?, true, NOW(), ?
    FROM public.companies com
      JOIN public."licence_roles" lr on lr.id = ?
      JOIN public.contacts con ON con.external_id = ?
    WHERE com.external_id = ?
    ON CONFLICT (company_id, contact_id, licence_role_id, start_date)
      DO UPDATE SET
        contact_id = EXCLUDED.contact_id,
        "default" = EXCLUDED."default",
        updated_at = EXCLUDED.updated_at
  `, [startDate, updatedAt, licenceRoleId, externalId, externalId])
    .transacting(trx)
}

module.exports = {
  go
}
