'use strict'

/**
 * Creates or updates an imported licence and its child entities that have been transformed and validated
 * @module PersistImportService
 */

const PersistCompanyService = require('./persist/persist-companies.service.js')
const PersistImportService = require('./persist/persist-licence.service.js')
const LicenceModel = require('../../models/licence.model.js')

const { timestampForPostgres } = require('../../lib/general.lib.js')

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

    const id = await PersistImportService.go(trx, updatedAt, transformedLicence)

    await PersistCompanyService.go(trx, updatedAt, transformedCompanies)

    return id
  })
}

module.exports = {
  go
}
