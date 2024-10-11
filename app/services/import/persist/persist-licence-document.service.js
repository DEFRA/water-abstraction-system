'use strict'

/**
 * Creates or updates a licence document
 * @module PersistLicenceDocumentService
 */

const LicenceDocumentModel = require('../../../models/licence-document.model.js')

/**
 * Creates or updates a licence document
 *
 * @param {object} trx - An Objection.js transaction object for PostgreSQL.
 * @param {string} updatedAt - The timestamp indicating when the entity was last updated.
 * @param {object} transformedLicence - An object representing a valid WRLS licence.
 *
 * @returns {Promise<string>} - The licence ID from WRLS.
 */
async function go (trx, updatedAt, transformedLicence) {
  await _persistLicenceDocument(trx, updatedAt, transformedLicence.licenceDocument)
}

async function _persistLicenceDocument (trx, updatedAt, licenceDocument) {
  return LicenceDocumentModel.query(trx)
    .insert({ ...licenceDocument, updatedAt })
    .onConflict('licenceRef')
    .merge([
      'endDate',
      'startDate',
      'updatedAt'
    ])
//    INSERT INTO crm_v2.documents (regime, document_type, document_ref,
//    start_date, end_date, external_id, date_created, date_updated, date_deleted)
//   VALUES ('water', 'abstraction_licence', $1, $2, $3, $4, NOW(), NOW(), null)
//   ON CONFLICT (regime, document_type, document_ref)
//   DO UPDATE SET
//     start_date=EXCLUDED.start_date,
//     end_date=EXCLUDED.end_date,
//     external_id=EXCLUDED.external_id,
//     date_updated=EXCLUDED.date_updated,
//     date_deleted=EXCLUDED.date_deleted;`
}

module.exports = {
  go
}
