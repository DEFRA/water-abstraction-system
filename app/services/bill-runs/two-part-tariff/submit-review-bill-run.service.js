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
  const filterIssues = payload?.filterIssues
  const filterLicenceHolder = payload?.filterLicenceHolder
  const filterLicenceStatus = payload?.filterLicenceStatus

  if ((filterIssues || filterLicenceHolder || filterLicenceStatus) === undefined) {
    yar.clear('filters')
  } else {
    yar.set('filters', {
      filterIssues,
      filterLicenceHolder,
      filterLicenceStatus
    })
  }
}

module.exports = {
  go
}
