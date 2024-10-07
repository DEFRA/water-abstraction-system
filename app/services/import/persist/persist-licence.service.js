'use strict'

/**
 * Creates or updates an imported licence that have been transformed and validated
 * @module PersistLicenceService
 */

const LicenceModel = require('../../../models/licence.model.js')

/**
 * Creates or updates an imported licence that have been transformed and validated
 *
 * @param trx
 * @param updatedAt
 * @param {object} transformedLicence - An object representing a valid WRLS licence
 *
 * @returns {Promise<string>} - the licence id from WRLS
 */
async function go (trx, updatedAt, transformedLicence) {
  const { id } = await _persistLicence(trx, updatedAt, transformedLicence)

  return id
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

module.exports = {
  go
}
