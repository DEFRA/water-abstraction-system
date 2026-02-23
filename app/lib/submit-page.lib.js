'use strict'

/**
 * Submit page helper methods
 * @module SubmitPageLib
 */

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

/**
 * Retrieves saved filters from session storage and determines if any filters are active
 *
 * This function fetches filter data from the session using the provided key and checks whether any filter values
 * have been set. For array-type filters (like multi-select checkboxes), it checks if the array has any elements.
 * For non-array filters (like text inputs), it checks if the value is truthy. The `openFilter` flag indicates
 * whether the filter panel should be displayed in an open state on the page.
 *
 * @param {object} yar - The Hapi Yar session storage object
 * @param {string} filterKey - The key identifying which filter data to retrieve from session storage
 *
 * @returns {object} An object containing all saved filter properties plus an `openFilter` boolean indicating
 * whether any filters are active
 *
 * @example
 * // No filters saved
 * processSavedFilters(yar, 'billRunsFilter')
 * // Returns { openFilter: false }
 *
 * @example
 * // Filters with array values
 * // Assumes yar.get('billRunsFilter') returns { regions: ['south', 'north'], status: null }
 * processSavedFilters(yar, 'billRunsFilter')
 * // Returns { regions: ['south', 'north'], status: null, openFilter: true }
 *
 * @example
 * // Filters with empty values
 * // Assumes yar.get('billRunsFilter') returns { regions: [], status: null }
 * processSavedFilters(yar, 'billRunsFilter')
 * // Returns { regions: [], status: null, openFilter: false }
 */
function processSavedFilters(yar, filterKey) {
  let openFilter = false

  const savedFilters = yar.get(filterKey)

  if (savedFilters) {
    for (const key of Object.keys(savedFilters)) {
      if (Array.isArray(savedFilters[key])) {
        openFilter = savedFilters[key].length > 0
      } else {
        openFilter = !!savedFilters[key]
      }

      if (openFilter) {
        break
      }
    }
  }

  return {
    ...savedFilters,
    openFilter
  }
}

module.exports = {
  clearFilters,
  handleOneOptionSelected,
  processSavedFilters
}
