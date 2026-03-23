'use strict'

/**
 * Formats data for the '/company-contacts/{id}/remove' page
 * @module RemoveCompanyContactPresenter
 */

const { formatEmail } = require('../base.presenter.js')

/**
 * Formats data for the '/company-contacts/{id}/remove' page
 *
 * @param {module:CompanyModel} company - The customer from the companies table
 * @param {module:CompanyContactModel} companyContact - The customer contact from the company contacts table
 *
 * @returns {object} The data formatted for the view template
 */
function go(company, companyContact) {
  return {
    backLink: {
      href: `/system/company-contacts/${companyContact.id}/contact-details`,
      text: 'Go back to contact details'
    },
    contact: {
      name: companyContact.contact.$name(),
      email: formatEmail(companyContact.contact.email),
      abstractionAlerts: companyContact.abstractionAlerts ? 'Yes' : 'No'
    },
    pageTitle: `You're about to remove this contact`,
    pageTitleCaption: company.name,
    ..._warning(companyContact)
  }
}

function _warning(companyContact) {
  const { abstractionAlerts, abstractionAlertsCount } = companyContact

  if (abstractionAlerts && abstractionAlertsCount === 1) {
    return {
      warning: {
        text: 'Removing this contact means the licence holder will receive future water abstraction alerts by post.',
        iconFallbackText: 'Warning'
      }
    }
  }

  return {}
}

module.exports = {
  go
}
