'use strict'

/**
 * Formats data for the '/customers/{customerId}/contact/{contactId}' page
 * @module ViewManagePresenter
 */

/**
 * Formats data for the '/customers/{customerId}/contact/{contactId}' page
 *
 * @returns {object} The data formatted for the view template
 */
function go() {
  return {
    backLink: {
      href: `/system/search`,
      text: 'Back'
    },
    pageTitle: 'Manage contact settings for'
  }
}

module.exports = {
  go
}
