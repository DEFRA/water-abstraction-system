'use strict'

/**
 * Determines if an imported licence has a new end date
 * @module DetermineSupplementaryBillingFlagsService
 */

const LicenceModel = require('../../models/licence.model.js')
const ProcessImportedLicenceService = require('../licences/supplementary/process-imported-licence.service.js')

/**
 * Determines if an imported licence has a new end date.
 *
 * This service is responsible for determining whether a licence imported has a new end day and therefore should be
 * flagged for supplementary billing.
 *
 * It compares the licences end dates (such as lapsed, revoked or expired dates) between WRLS licence and the imported
 * data, and if there is a change in the dates allows the licence to go on to determining the flags.
 *
 * @param {object} importedLicence - The imported licence
 * @param {string} licenceId - The UUID of the licence being updated by the import
 */
async function go (importedLicence, licenceId) {
  try {
    const licenceChanged = await _licenceChanged(importedLicence, licenceId)

    if (licenceChanged) {
      await ProcessImportedLicenceService.go(importedLicence, licenceId)
    }
  } catch (error) {
    global.GlobalNotifier.omfg('Determine supplementary billing flags on import failed ', { licenceId }, error)
  }
}

async function _licenceChanged (importedLicence, licenceId) {
  const query = LicenceModel.query()
    .select(['id'])
    .where('id', licenceId)

  _whereClauses(query, importedLicence)

  const result = await query

  return result.length === 0
}

/**
 * Adds where clauses to compare the end dates (expired, revoked, lapsed) of the imported licence with those stored
 * in the database. It handles where the end dates can be null.
 *
 * In SQL, comparing `null` values using a regular `where` clause does not work as expected because
 * `null` represents the absence of a value and `null = null` returns false. To address this, we use
 * `whereNull` to explicitly check for null values in the database.
 *
 * If an end date is present on the imported licence, the query uses a standard `where` clause to check
 * for a match. If the end date is null, the query uses `whereNull` to compare against the null values.
 *
 * This ensures that value types (dates and null) can be correctly compared, allowing us to detect changes
 * between the imported licence and the existing WRLS licence data.
 *
 * @private
 */
function _whereClauses (query, importedLicence) {
  const { expiredDate, lapsedDate, revokedDate } = importedLicence

  if (expiredDate) {
    query.where('expiredDate', expiredDate)
  } else {
    query.whereNull('expiredDate')
  }

  if (revokedDate) {
    query.where('revokedDate', revokedDate)
  } else {
    query.whereNull('revokedDate')
  }

  if (lapsedDate) {
    query.where('lapsedDate', lapsedDate)
  } else {
    query.whereNull('lapsedDate')
  }
}

module.exports = {
  go
}
