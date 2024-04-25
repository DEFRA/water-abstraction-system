'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the remove bill run licence confirmation page
 * @module RemoveBillRunLicenceService
 */

const BillRunModel = require('../../../models/bill-run.model.js')
const { db } = require('../../../../db/db.js')
const RemoveBillRunLicencePresenter = require('../../../presenters/bill-runs/two-part-tariff/remove-bill-run-licence.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the cancel bill run confirmation page
 *
 * @param {string} id - The UUID of the bill run that the licence is in
 * @param {string} licenceId UUID of the licence to remove from the bill run
 *
 * @returns {Promise<Object}> an object representing the `pageData` needed by the remove licence template. It contains
 * details of the bill run & licence.
 */
async function go (id, licenceId) {
  const billRun = await _fetchBillRun(id)
  const licence = await _fetchLicence(id, licenceId)

  const pageData = RemoveBillRunLicencePresenter.go(billRun, licence)

  return pageData
}

async function _fetchBillRun (id) {
  return BillRunModel.query()
    .findById(id)
    .select(
      'billRuns.toFinancialYearEnding',
      'region.displayName as region'
    )
    .innerJoinRelated('region')
}

async function _fetchLicence (id, licenceId) {
  return db
    .distinct(
      'rl.licenceId',
      'rl.licenceRef',
      'ba.accountNumber'
    )
    .from('reviewLicences AS rl')
    .innerJoin('reviewChargeVersions AS rcv', 'rl.id', 'rcv.reviewLicenceId')
    .innerJoin('chargeVersions AS cv', 'rcv.chargeVersionId', 'cv.id')
    .innerJoin('billingAccounts AS ba', 'cv.billingAccountId', 'ba.id')
    .where('rl.billRunId', id)
    .andWhere('rl.licenceId', licenceId)
}

module.exports = {
  go
}
