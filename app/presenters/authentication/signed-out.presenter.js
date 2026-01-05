'use strict'

/**
 * Formats data for the `/signed-out` page
 * @module SignedOutPresenter
 */

/**
 * Formats data for the `/signed-out` page
 *
 * @returns {object} The data formatted for the view template
 */
function go() {
  return {
    backLink: {
      href: '',
      text: 'Back'
    },
    pageTitle: ''
  }
}

module.exports = {
  go
}
