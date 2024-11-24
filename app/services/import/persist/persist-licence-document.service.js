'use strict'

/**
 * Creates or updates a licence document
 * @module PersistLicenceDocumentService
 */

const LicenceDocumentModel = require('../../../models/licence-document.model.js')
const { db } = require('../../../../db/db.js')

/**
 * Creates or updates a licence document
 *
 * @param {object} trx - An Objection.js transaction object for PostgreSQL.
 * @param {string} updatedAt - The timestamp indicating when the entity was last updated.
 * @param {object} transformedLicence - An object representing a valid WRLS licence.
 *
 * @returns {Promise<string>} - The licence ID from WRLS.
 */
async function go(trx, updatedAt, transformedLicence) {
  await _persistLicenceDocument(trx, updatedAt, transformedLicence.licenceDocument)

  await _persistLicenceDocumentRoles(trx, updatedAt, transformedLicence.licenceDocument.licenceDocumentRoles)
}

async function _persistLicenceDocument(trx, updatedAt, licenceDocument) {
  const { licenceDocumentRoles, ...propertiesToPersist } = licenceDocument

  return LicenceDocumentModel.query(trx)
    .insert({ ...propertiesToPersist, updatedAt })
    .onConflict('licenceRef')
    .merge(['endDate', 'startDate', 'updatedAt'])
}

async function _persistLicenceDocumentRoles(trx, updatedAt, licenceDocumentRoles) {
  for (const licenceDocumentRole of licenceDocumentRoles) {
    await _persistLicenceDocumentRole(trx, updatedAt, licenceDocumentRole)
  }
}

async function _persistLicenceDocumentRole(trx, updatedAt, licenceDocument) {
  const { addressId, companyId, contactId, documentId, licenceRoleId, startDate, endDate } = licenceDocument

  return db
    .raw(
      `
    INSERT INTO public."licence_document_roles" (address_id, company_id, contact_id, licence_document_id, licence_role_id, start_date, end_date, updated_at)
    SELECT add.id, com.id, con.id, ld.id, lr.id, ? ,?, ?
    FROM public.licence_documents ld
      JOIN public."licence_roles" lr on lr.id = ?
      JOIN public.addresses add ON add.external_id = ?
      JOIN public.companies com ON com.external_id = ?
      LEFT JOIN public.contacts con ON con.external_id = ?
    WHERE ld.licence_ref = ?
    ON CONFLICT (licence_document_id, licence_role_id, start_date)
      DO UPDATE SET
        company_id=EXCLUDED.company_id,
        contact_id=EXCLUDED.contact_id,
        address_id=EXCLUDED.address_id,
        end_date=EXCLUDED.end_date,
        updated_at = EXCLUDED.updated_at
  `,
      [startDate, endDate, updatedAt, licenceRoleId, addressId, companyId, contactId, documentId]
    )
    .transacting(trx)
}

module.exports = {
  go
}
