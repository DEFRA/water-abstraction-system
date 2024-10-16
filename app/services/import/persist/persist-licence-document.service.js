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
}

module.exports = {
  go
}
