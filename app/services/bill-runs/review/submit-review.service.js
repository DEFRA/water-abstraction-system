'use strict'

/**
 * Updates the session cookie with the filter data needed for the '/bill-runs/review/{id}' page
 * @module SubmitReviewService
 */

const { clearFilters, handleOneOptionSelected } = require('../../../lib/submit-page.lib.js')

/**
 * Updates the session cookie with the filter data needed for the '/bill-runs/review/{id}' page
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

  handleOneOptionSelected(payload, 'issues')
  handleOneOptionSelected(payload, 'progress')

  _save(payload, yar, filterKey)
}

function _save(payload, yar, filterKey) {
  yar.set(filterKey, {
    issues: payload.issues,
    licenceHolderNumber: payload.licenceHolderNumber ?? null,
    licenceStatus: payload.licenceStatus ?? null,
    progress: payload.progress
  })
}

module.exports = {
  go
}
