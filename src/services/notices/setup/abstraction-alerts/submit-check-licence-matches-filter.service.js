/**
 * Orchestrates saving the abstraction period filter for the
 * `/notices/setup/{sessionId}/abstraction-alerts/check-licence-matches` page
 *
 * @module SubmitCheckLicenceMatchesFilterService
 */

import { clearFilters, handleOneOptionSelected } from 'water-abstraction-engine/lib/submit-page.lib.js'

/**
 * Orchestrates saving the abstraction period filter for the
 * `/notices/setup/{sessionId}/abstraction-alerts/check-licence-matches` page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The `request.payload` containing the filter data
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 */
export default async function submitCheckLicenceMatchesFilterService(sessionId, payload, yar) {
  const filterKey = `checkLicenceMatchesFilter-${sessionId}`

  const filterCleared = clearFilters(payload, yar, filterKey)

  if (filterCleared) {
    return
  }

  handleOneOptionSelected(payload, 'periods')

  yar.set(filterKey, { periods: payload.periods })
}
