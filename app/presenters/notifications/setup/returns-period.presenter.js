'use strict'

/**
 * Formats data for the `/notifications/setup/returns-period` page
 * @module ReturnsPeriodPresenter
 */

/**
 * Formats data for the `/notifications/setup/returns-period` page
 *
 * @returns {object} - The data formatted for the view template
 */
function go() {
  return {
    backLink: '/manage',
    returnsPeriod: _returnsPeriod()
  }
}

function _returnsPeriod() {
  return []
}

module.exports = {
  go
}
