'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the marked for supplementary billing confirmation page
 * @module MarkedForSupplementaryBillingService
 */

const LicenceModel = require('../../../../app/models/licence.model.js')

/**
 * Orchestrates fetching and presenting the data needed for the marked for supplementary billing confirmation page
 *
 * @param {string} licenceId - The UUID of the licence that has been marked for supplementary billing
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the marked for supplementary billing
 * confirmation page. It contains details of the licence.
 */
async function go(licenceId) {
  const licenceData = await _fetchLicenceData(licenceId)

  return {
    licenceRef: licenceData.licenceRef,
    licenceId: licenceData.id
  }
}

async function _fetchLicenceData(licenceId) {
  return LicenceModel.query().findById(licenceId).select(['id', 'licenceRef'])
}

module.exports = {
  go
}
