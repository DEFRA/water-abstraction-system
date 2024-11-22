'use strict'

/**
 * Creates or updates an imported licence that have been transformed and validated
 * @module PersistLicenceService
 */

const LicenceModel = require('../../../models/licence.model.js')

/**
 * Creates or updates an imported licence and its child entities that have been transformed and validated.
 *
 * @param {object} trx - An Objection.js transaction object for PostgreSQL.
 * @param {string} updatedAt - The timestamp indicating when the entity was last updated.
 * @param {object} transformedLicence - An object representing a valid WRLS licence.
 *
 * @returns {Promise<string>} - The licence ID from WRLS.
 */
async function go(trx, updatedAt, transformedLicence) {
  const { id } = await _persistLicence(trx, updatedAt, transformedLicence)

  return id
}

async function _persistLicence(trx, updatedAt, licence) {
  const { licenceVersions, licenceDocument, ...propertiesToPersist } = licence

  return LicenceModel.query(trx)
    .insert({ ...propertiesToPersist, updatedAt })
    .onConflict('licenceRef')
    .merge(['expiredDate', 'lapsedDate', 'regions', 'revokedDate', 'startDate', 'updatedAt', 'waterUndertaker'])
    .returning('id')
}

module.exports = {
  go
}
