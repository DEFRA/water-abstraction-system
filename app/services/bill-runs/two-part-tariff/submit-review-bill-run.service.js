'use strict'

/**
 * Updates the session cookie with the filter data needed for the two-part tariff review bill run page
 * @module SubmitReviewBillRunService
 */

/**
 * Updates the session cookie with the filter data needed for the two-part tariff review bill run page
 *
 * @param {Object} payload The `request.payload` containing the filter data.
 * @param {Object} yar - The Hapi `request.yar` session manager passed on by the controller
 */
async function go (payload, yar) {
  const clearFilters = payload?.clearFilters
  const filterIssues = payload?.filterIssues
  const filterLicenceHolder = payload?.filterLicenceHolder
  const filterLicenceStatus = payload?.filterLicenceStatus

  if (clearFilters) {
    yar.clear('reviewFilters')
  } else {
    yar.set('reviewFilters', {
      filterIssues,
      filterLicenceHolder,
      filterLicenceStatus
    })
  }
}

module.exports = {
  go
}
