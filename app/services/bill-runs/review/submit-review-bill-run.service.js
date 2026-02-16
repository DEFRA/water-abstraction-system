'use strict'

/**
 * Updates the session cookie with the filter data needed for the two-part tariff review bill run page
 * @module SubmitReviewBillRunService
 */

const { clearFilters } = require('../../../lib/submit-page.lib.js')

/**
 * Updates the session cookie with the filter data needed for the two-part tariff review bill run page
 *
 * @param {string} billRunId - The UUID of the bill run
 * @param {object} payload - The `request.payload` containing the filter data.
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 */
async function go(billRunId, payload, yar) {
  const filterKey = `review-${billRunId}`

  const filterCleared = clearFilters(payload, yar, filterKey)
  const filterIssues = payload?.filterIssues
  const filterLicenceHolderNumber = payload?.filterLicenceHolderNumber
  const filterLicenceStatus = payload?.filterLicenceStatus
  const filterProgress = payload?.filterProgress

  if (!filterCleared) {
    yar.set(filterKey, {
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
