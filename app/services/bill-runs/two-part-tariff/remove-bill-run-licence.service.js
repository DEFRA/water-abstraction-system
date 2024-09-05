'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the remove bill run licence confirmation page
 * @module RemoveBillRunLicenceService
 */

const BillRunModel = require('../../../models/bill-run.model.js')
const LicenceModel = require('../../../models/licence.model.js')
const RemoveBillRunLicencePresenter = require('../../../presenters/bill-runs/two-part-tariff/remove-bill-run-licence.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the remove bill run licence confirmation page
 *
 * @param {string} billRunId - The UUID of the bill run that the licence is in
 * @param {string} licenceId - UUID of the licence to remove from the bill run
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the remove licence template. It contains
 * details of the bill run & the licence reference.
 */
async function go (billRunId, licenceId) {
  const billRun = await _fetchBillRun(billRunId)
  const licenceRef = await _fetchLicenceRef(licenceId)

  const pageData = RemoveBillRunLicencePresenter.go(billRun, licenceId, licenceRef)

  return pageData
}

async function _fetchBillRun (billRunId) {
  return BillRunModel.query()
    .findById(billRunId)
    .select(
      'billRuns.billRunNumber',
      'billRuns.createdAt',
      'billRuns.status',
      'billRuns.toFinancialYearEnding',
      'region.displayName as region'
    )
    .innerJoinRelated('region')
}

async function _fetchLicenceRef (licenceId) {
  const licence = await LicenceModel.query()
    .findById(licenceId)
    .select('licenceRef')

  return licence.licenceRef
}

module.exports = {
  go
}
