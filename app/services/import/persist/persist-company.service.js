'use strict'

/**
 * Creates or updates an imported company and its child entities that have been transformed and validated
 * @module PersistCompanyService
 */

const AddressModel = require('../../../models/address.model.js')
const CompanyModel = require('../../../models/company.model.js')
const ContactModel = require('../../../models/contact.model.js')
const { db } = require('../../../../db/db.js')

/**
 * Creates or updates an imported company and its child entities that have been transformed and validated.
 *
 * @param {object} trx - An Objection.js transaction object for PostgreSQL.
 * @param {string} updatedAt - The timestamp indicating when the entity was last updated.
 * @param {object} transformedCompanies - An object representing a valid WRLS Company.
 *
 * @returns {Promise<object>} the promise returned is not intended to resolve to any particular value
 */
async function go (trx, updatedAt, transformedCompanies) {
  return _persistCompanies(trx, updatedAt, transformedCompanies)
}

async function _persistAddress (trx, updatedAt, address) {
  return AddressModel.query(trx)
    .insert({ ...address, updatedAt })
    .onConflict('externalId')
    .merge([
      'address1',
      'address2',
      'address3',
      'address4',
      'address5',
      'address6',
      'country',
      'postcode',
      'updatedAt'
    ])
}

async function _persistAddresses (trx, updatedAt, addresses) {
  for (const address of addresses) {
    await _persistAddress(trx, updatedAt, address)
  }
}

async function _persistCompanies (trx, updatedAt, companies) {
  for (const company of companies) {
    await _persistCompany(trx, updatedAt, company)

    if (company.contact) {
      await _persistContact(trx, updatedAt, company.contact)
    }

    if (company.companyContact) {
      await _persistsCompanyContact(trx, updatedAt, company.companyContact)
    }

    await _persistAddresses(trx, updatedAt, company.addresses)

    await _persistCompanyAddresses(trx, updatedAt, company.companyAddresses)
  }
}

async function _persistCompany (trx, updatedAt, company) {
  const { contact, companyContact, addresses, companyAddresses, ...propertiesToPersist } = company

  return CompanyModel.query(trx)
    .insert({ ...propertiesToPersist, updatedAt })
    .onConflict('externalId')
    .merge([
      'name',
      'type',
      'updatedAt'
    ])
}

async function _persistCompanyAddresses (trx, updatedAt, companyAddresses) {
  for (const companyAddress of companyAddresses) {
    await _persistCompanyAddress(trx, updatedAt, companyAddress)
  }
}

async function _persistCompanyAddress (trx, updatedAt, companyAddress) {
  const { companyId, startDate, endDate, licenceRoleId, addressId } = companyAddress

  return db.raw(`
    INSERT INTO public."company_addresses" (company_id, address_id, licence_role_id, start_date, end_date, "default", created_at, updated_at)
    SELECT com.id, add.id, lr.id, ? ,?, true, NOW(), ?
    FROM public.companies com
      JOIN public."licence_roles" lr on lr.id = ?
      JOIN public.addresses add ON add.external_id = ?
    WHERE com.external_id = ?
    ON CONFLICT (company_id, address_id, licence_role_id)
      DO UPDATE SET
        address_id=EXCLUDED.address_id,
        "default" = EXCLUDED."default",
        end_date = EXCLUDED.end_date,
        updated_at = EXCLUDED.updated_at
  `, [startDate, endDate, updatedAt, licenceRoleId, addressId, companyId])
    .transacting(trx)
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

module.exports = {
  go
}
