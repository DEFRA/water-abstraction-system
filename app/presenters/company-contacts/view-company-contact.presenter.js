'use strict'

/**
 * Formats data for the '/company-contacts/{id}' page
 * @module ViewCompanyContactPresenter
 */

const { formatLongDate } = require('../base.presenter.js')

/**
 * Formats data for the '/company-contacts/{id}' page
 *
 * @param {module:CompanyModel} company - The customer from the companies table
 * @param {module:CompanyContactModel} companyContact - The customer contact from the company contacts table
 *
 * @returns {object} The data formatted for the view template
 */
function go(company, companyContact) {
  return {
    backLink: {
      href: `/system/companies/${company.id}/contacts`,
      text: 'Go back to contacts'
    },
    contact: {
      abstractionAlerts: companyContact.abstractionAlerts ? 'Yes' : 'No',
      created: _created(companyContact),
      email: companyContact.contact.email,
      lastUpdated: _lastUpdated(companyContact),
      name: companyContact.contact.$name()
    },
    pageTitle: `Contact details for ${companyContact.contact.$name()}`,
    pageTitleCaption: company.name,
    removeContactLink: `/system/company-contacts/${companyContact.id}/remove`
  }
}

function _created(companyContact) {
  if (!companyContact.createdByUser) {
    return formatLongDate(companyContact.createdAt)
  }

  return `${formatLongDate(companyContact.createdAt)} by ${companyContact.createdByUser.username}`
}

function _lastUpdated(companyContact) {
  if (!companyContact.updatedByUser) {
    return formatLongDate(companyContact.updatedAt)
  }

  return `${formatLongDate(companyContact.updatedAt)} by ${companyContact.updatedByUser.username}`
}

module.exports = {
  go
}
