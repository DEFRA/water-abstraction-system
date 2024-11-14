'use strict'

/**
 * Orchestrates removing a review licence from a two-part tariff bill run whilst it is at the review stage
 * @module SubmitRemoveService
 */

const CreateLicenceSupplementaryYearService = require('../../licences/supplementary/create-licence-supplementary-year.service.js')
const FetchRemoveReviewLicenceModel = require('./fetch-remove-review-licence.service.js')
const ProcessBillRunPostRemove = require('./process-bill-run-post-remove.service.js')
const RemoveReviewLicenceService = require('./remove-review-licence.service.js')

/**
 * Orchestrates removing a review licence from a two-part tariff bill run whilst it is at the review stage
 *
 * It does this by deleting all of the persisted data relating to the licence from the review tables. The licence will
 * then be flagged for 2PT supplementary billing.
 *
 * If after removing the review licence the bill run is empty, the bill run status will be set to `empty`. We also let
 * the controller know so that the user is redirected back to the Bill runs page rather than Review bill run page.
 *
 * @param {string} reviewLicenceId - The UUID of the review licence that is being removed from the bill run
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} an object containing the bill run ID plus a boolean flag that indicates whether this was
 * the last licence in the bill run (bill run is now empty)
 */
async function go (reviewLicenceId, yar) {
  const reviewLicence = await FetchRemoveReviewLicenceModel.go(reviewLicenceId)

  await RemoveReviewLicenceService.go(reviewLicenceId)

  await _flagForSupplementaryBilling(reviewLicence)

  const empty = await _empty(reviewLicence)

  if (!empty) {
    // NOTE: The banner message is only set if licences remain in the bill run. This is because if there are no longer
    // any licences remaining in the bill run the user is redirected to the "Bill runs" page instead of "Review
    // licences". As the banner isn't displayed on the "Bill runs" page the message would remain in the cookie.
    yar.flash('banner', `Licence ${reviewLicence.licenceRef} removed from the bill run.`)
  }

  return {
    billRunId: reviewLicence.billRun.id,
    empty
  }
}

async function _empty (reviewLicence) {
  const { billRun } = reviewLicence

  return ProcessBillRunPostRemove.go(billRun.id)
}

async function _flagForSupplementaryBilling (reviewLicence) {
  const { billRun, licenceId } = reviewLicence

  return CreateLicenceSupplementaryYearService.go(licenceId, [billRun.toFinancialYearEnding], true)
}

module.exports = {
  go
}
