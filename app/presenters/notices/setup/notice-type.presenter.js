'use strict'

/**
 * Formats data for the `/notices/setup/{sessionId}/notice-type` page
 * @module NoticeTypePresenter
 */

/**
 * Formats data for the `/notices/setup/{sessionId}/notice-type` page
 *
 * @returns {object} - The data formatted for the view template
 */
function go() {
  return {
    pageTitle: 'Select the notice type'
  }
}

module.exports = {
  go
}
