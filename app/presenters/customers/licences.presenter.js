'use strict'

/**
 * Formats data for the 'customers/{id}/licences' page
 * @module LicencesPresenter
 */

/**
 * Formats data for the 'customers/{id}/licences' page
 *
 * @returns {object} The data formatted for the view template
 */
function go() {
  return {
    backLink: {
      href: '/',
      text: 'Back to search'
    },
    pageTitle: 'Licences'
  }
}

module.exports = {
  go
}
