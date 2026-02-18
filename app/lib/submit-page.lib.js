'use strict'

/**
 * Clears stored filters from session storage based on form submission
 *
 * Checks if the payload contains a clearFilters flag. If true, removes the stored filter data from the session
 * using the provided key and returns true. Otherwise, returns false without modifying the filter data.
 *
 * @param {object} payload - The form payload object containing the clearFilters flag
 * @param {object} yar - The Hapi Yar session storage object
 * @param {string} filterKey - The key identifying which filter data to clear from session storage
 *
 * @returns {boolean} True if filters were cleared, false otherwise
 */
function clearFilters(payload, yar, filterKey) {
  const clearFilter = payload.clearFilters

  if (clearFilter) {
    yar.clear(filterKey)

    return true
  }

  return false
}

/**
 * Submit page helper methods
 * @module SubmitPageLib
 */

/**
 * Normalizes checkbox form data to always be an array
 *
 * HTML checkboxes behave inconsistently when submitted:
 * - No selection: property is undefined
 * - Single selection: property is a string
 * - Multiple selections: property is an array
 *
 * This helper ensures the property always exists as an array, making it easier to process checkbox data consistently
 * throughout the application.
 *
 * @param {object} payload - The form payload object to be modified in place
 * @param {string} key - The property name in the payload to normalize
 *
 * @returns {void} The payload object is modified directly
 *
 * @example
 * // No selection
 * const payload1 = {}
 * handleOneOptionSelected(payload1, 'options')
 * // payload1.options is now []
 *
 * @example
 * // Single selection
 * const payload2 = { options: 'value1' }
 * handleOneOptionSelected(payload2, 'options')
 * // payload2.options is now ['value1']
 *
 * @example
 * // Multiple selections (already an array, unchanged)
 * const payload3 = { options: ['value1', 'value2'] }
 * handleOneOptionSelected(payload3, 'options')
 * // payload3.options remains ['value1', 'value2']
 */
function handleOneOptionSelected(payload, key) {
  if (!payload?.[key]) {
    payload[key] = []

    return
  }

  if (!Array.isArray(payload?.[key])) {
    payload[key] = [payload?.[key]]
  }
}

module.exports = {
  clearFilters,
  handleOneOptionSelected
}
