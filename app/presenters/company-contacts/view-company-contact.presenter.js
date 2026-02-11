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
    editContactLink: `/system/company-contacts/setup/${companyContact.id}/edit`,
    pageTitle: `Contact details for ${companyContact.contact.$name()}`,
    pageTitleCaption: company.name,
    removeContactLink: `/system/company-contacts/${companyContact.id}/remove`
  }
}

function _created(companyContact) {
  const formattedDate = formatLongDate(companyContact.createdAt)

  if (!companyContact.createdByUser) {
    return formattedDate
  }

  return `${formattedDate} by ${companyContact.createdByUser.username}`
}

function _lastUpdated(companyContact) {
  const formattedDate = formatLongDate(companyContact.updatedAt)

  if (!companyContact.updatedByUser) {
    return formattedDate
  }

  return `${formattedDate} by ${companyContact.updatedByUser.username}`
}

module.exports = {
  go
}
