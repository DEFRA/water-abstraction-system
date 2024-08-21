'use strict'

/**
 * Orchestrates removing a licence from a bill run whilst it is at the review stage
 * @module SubmitRemoveBillRunLicenceService
 */

const BillRunModel = require('../../../models/bill-run.model.js')
const CreateLicenceSupplementaryYearService = require('../../licences/supplementary/create-licence-supplementary-year.service.js')
const LicenceModel = require('../../../models/licence.model.js')
const RemoveReviewDataService = require('./remove-review-data.service.js')
const ReviewLicenceModel = require('../../../models/review-licence.model.js')

/**
 * Orchestrates removing a licence from a bill run whilst it is at the review stage
 *
 * It does this by deleting all of the persisted data relating to the licence from the review tables. The licence will
 * then be flagged for 2PT supplementary billing. If after removing a licence the bill run is empty, the bill run status
 * will be set to `empty` and `true` returned so that the user is redirected back to the Bill runs page rather
 * than Review bill run.
 *
 * @param {string} billRunId - The UUID of the bill run that the licence is in
 * @param {string} licenceId - UUID of the licence to remove from the bill run
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<boolean>} true if all the licences have been removed from the bill run else false
 */
async function go (billRunId, licenceId, yar) {
  await RemoveReviewDataService.go(billRunId, licenceId)

  await _flagForSupplementaryBilling(licenceId, billRunId)

  const allLicencesRemoved = await _allLicencesRemoved(billRunId)

  if (!allLicencesRemoved) {
    const { licenceRef } = await LicenceModel.query().findById(licenceId)

    // NOTE: The banner message is only set if licences remain in the bill run. This is because if there are no longer
    // any licences remaining in the bill run the user is redirected to the "Bill runs" page instead of
    // "Review licences". As the banner isn't displayed on the "Bill runs" page the message would remain in the cookie.
    yar.flash('banner', `Licence ${licenceRef} removed from the bill run.`)
  }

  return allLicencesRemoved
}

async function _allLicencesRemoved (billRunId) {
  const count = await ReviewLicenceModel.query().where('billRunId', billRunId).resultSize()

  if (count === 0) {
    await BillRunModel.query().findById(billRunId).patch({ status: 'empty' })

    return true
  }

  return false
}

async function _flagForSupplementaryBilling (licenceId, billRunId) {
  const twoPartTariff = true
  const { toFinancialYearEnding } = await BillRunModel.query()
    .findById(billRunId)

  return CreateLicenceSupplementaryYearService.go(licenceId, [toFinancialYearEnding], twoPartTariff)
}

module.exports = {
  go
}
