'use strict'

/**
 * Formats data for the `/notices/setup/{sessionId}/returns-for-paper-forms` page
 * @module ReturnsForPaperFormsPresenter
 */

/**
 * Formats data for the `/notices/setup/{sessionId}/returns-for-paper-forms` page
 *
 * @returns {object} - The data formatted for the view template
 */
function go() {
  return {
    pageTile: 'Select the returns for the paper forms'
  }
}

module.exports = {
  go
}
