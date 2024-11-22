'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the remove bill licence page
 * @module RemoveBillLicenceService
 */

const FetchBillLicenceSummaryService = require('./fetch-bill-licence-summary.service.js')
const RemoveBillLicencePresenter = require('../../presenters/bill-licences/remove-bill-licence.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the remove bill licence page
 *
 * @param {string} billLicenceId - The UUID for the bill licence to remove
 *
 * @returns {Promise<object>} a formatted representation of the bill licence, its bill, billing account and the bill run
 * it is linked to for the remove bill licence page
 */
async function go(billLicenceId) {
  const billLicence = await FetchBillLicenceSummaryService.go(billLicenceId)

  return RemoveBillLicencePresenter.go(billLicence)
}

module.exports = {
  go
}
