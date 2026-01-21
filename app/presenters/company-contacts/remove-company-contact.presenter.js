'use strict'

/**
 * Formats data for the `` page
 * @module RemoveCompanyContactPresenter
 */

/**
 * Formats data for the `` page
 *
 * @returns {object} The data formatted for the view template
 */
function go() {
  return {
    backLink: {
      href: '',
      text: 'Back'
    },
    pageTitle: `You're about to remove this contact`
  }
}

module.exports = {
  go
}
