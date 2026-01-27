'use strict'

/**
 * Formats data for the '/company-contacts/setup/{sessionId}/contact-name' page
 * @module ContactNamePresenter
 */

/**
 * Formats data for the '/company-contacts/setup/{sessionId}/contact-name' page
 *
 * @returns {object} The data formatted for the view template
 */
function go() {
  return {
    backLink: {
      href: '',
      text: 'Back'
    },
    pageTitle: 'Enter a name for the contact'
  }
}

module.exports = {
  go
}
