'use strict'

/**
 * Formats data for the `/notices/setup/{sessionId}/check-notice-type` page
 * @module CheckNoticeTypePresenter
 */

/**
 * Formats data for the `/notices/setup/{sessionId}/check-notice-type` page
 *
 * @returns {object} - The data formatted for the view template
 */
function go() {
  return {
    pageTitle: 'Check the notice type'
  }
}

module.exports = {
  go
}
