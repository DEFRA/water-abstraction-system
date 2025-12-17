'use strict'

/**
 * Formats data for the 'customers/{id}/contacts' page
 * @module ContactsPresenter
 */

/**
 * Formats data for the 'customers/{id}/contacts' page
 *
 * @returns {object} The data formatted for the view template
 */
function go() {
  return {
    backLink: {
      href: '/',
      text: 'Back to search'
    },
    pageTitle: 'Contacts'
  }
}

module.exports = {
  go
}
