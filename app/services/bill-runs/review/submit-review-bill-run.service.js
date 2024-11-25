'use strict'

/**
 * Updates the session cookie with the filter data needed for the two-part tariff review bill run page
 * @module SubmitReviewBillRunService
 */

/**
 * Updates the session cookie with the filter data needed for the two-part tariff review bill run page
 *
 * @param {string} billRunId - The UUID of the bill run
 * @param {object} payload - The `request.payload` containing the filter data.
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} the promise returned is not intended to resolve to any particular value
 */
async function go(billRunId, payload, yar) {
  const clearFilters = payload?.clearFilters
  const filterIssues = payload?.filterIssues
  const filterLicenceHolderNumber = payload?.filterLicenceHolderNumber
  const filterLicenceStatus = payload?.filterLicenceStatus
  const filterProgress = payload?.filterProgress

  if (clearFilters) {
    yar.clear(`review-${billRunId}`)
  } else {
    yar.set(`review-${billRunId}`, {
      filterIssues,
      filterLicenceHolderNumber,
      filterLicenceStatus,
      filterProgress
    })
  }
}

module.exports = {
  go
}
