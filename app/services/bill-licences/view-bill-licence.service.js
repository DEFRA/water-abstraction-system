'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the view bill licence page
 * @module ViewBillLicenceService
 */

const FetchBillLicenceService = require('./fetch-bill-licence.service.js')
const ViewBillLicencePresenter = require('../../presenters/bill-licences/view-bill-licence.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the view bill licence page
 *
 * @param {string} id - The UUID for the bill licence to view
 *
 * @returns {Promise<object>} a formatted representation of the bill licence and its transactions for use in the bill
 * licence view page
 */
async function go(id) {
  const billLicence = await FetchBillLicenceService.go(id)

  return ViewBillLicencePresenter.go(billLicence)
}

module.exports = {
  go
}
