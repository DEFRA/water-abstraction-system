'use strict'

/**
 * Formats data for the '/companies/{id}' page
 * @module CompanyPresenter
 */

/**
 * Formats data for the '/companies/{id}' page
 *
 * @param {module:CompanyModel} company - The company
 *
 * @returns {object} The data formatted for the view template
 */
function go(company) {
  return {
    backLink: {
      href: '/',
      text: 'Back to search'
    },
    pageTitle: 'Company',
    pageTitleCaption: company.name
  }
}

module.exports = {
  go
}
