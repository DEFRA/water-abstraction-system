'use strict'

/**
 * Submit page helper methods
 * @module SubmitPageLib
 */

/**
 * When a checkbox is checked by the user, it returns as a string. When multiple checkboxes are checked, the values are
 * returned as an array. When nothing is checked then the property doesn't exist in the payload.
 *
 * This function works to handle these discrepancies.
 *
 * @private
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
  handleOneOptionSelected
}
