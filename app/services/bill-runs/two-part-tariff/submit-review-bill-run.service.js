'use strict'

/**
 * Updates the session cookie with the filter data needed for the two-part tariff review bill run page
 * @module SubmitReviewBillRunService
 */

/**
 * Updates the session cookie with the filter data needed for the two-part tariff review bill run page
 *
 * @param {String} billRunId - The UUID of the bill run
 * @param {Object} payload The `request.payload` containing the filter data.
 * @param {Object} yar - The Hapi `request.yar` session manager passed on by the controller
 */
async function go (billRunId, payload, yar) {
  const clearFilters = payload?.clearFilters
  const filterIssues = payload?.filterIssues
  const filterLicenceHolder = payload?.filterLicenceHolder
  const filterLicenceStatus = payload?.filterLicenceStatus

  if (clearFilters) {
    yar.clear(`review-${billRunId}`)
  } else {
    yar.set(`review-${billRunId}`, {
      filterIssues,
      filterLicenceHolder,
      filterLicenceStatus
    })
  }
}

module.exports = {
  go
}
