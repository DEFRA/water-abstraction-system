'use strict'

/**
 * Orchestrates flagging a licence for supplementary billing
 * @module MarkForSupplementaryBillingService
 */

const LicenceModel = require('../../../../app/models/licence.model.js')
const MarkForSupplementaryBillingPresenter = require('../../../presenters/licences/supplementary/mark-for-supplementary-billing.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the licence mark for supplementary billing page
 *
 * @param {string} licenceId - the UUID of the licence being flagged for supplementary billing
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the mark for supplementary billing page.
 * It contains details of the last 6 years from todays date and the licence details.
 */
async function go (licenceId) {
  const licenceData = await _fetchLicenceData(licenceId)

  const pageData = MarkForSupplementaryBillingPresenter.go(licenceData)

  return pageData
}

async function _fetchLicenceData (licenceId) {
  return LicenceModel.query()
    .findById(licenceId)
    .select([
      'id',
      'licenceRef'
    ])
}

module.exports = {
  go
}
