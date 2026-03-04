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

  if (filterCleared) {
    return
  }

  _save(payload, yar, filterKey)
}

function _save(payload, yar, filterKey) {
  yar.set(filterKey, {
    filterIssues: payload.filterIssues ?? null,
    filterLicenceHolderNumber: payload.filterLicenceHolderNumber ?? null,
    filterLicenceStatus: payload.filterLicenceStatus ?? null,
    filterProgress: payload.filterProgress ?? null
  })
}

module.exports = {
  go
}
