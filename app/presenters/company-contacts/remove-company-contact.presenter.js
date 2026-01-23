'use strict'

/**
 * Formats data for the '/company-contacts/{id}/remove' page
 * @module RemoveCompanyContactPresenter
 */

/**
 * Formats data for the '/company-contacts/{id}/remove' page
 *
 * @param {module:CompanyModel} company - The customer from the companies table
 * @param {module:CompanyContactModel} companyContact - The customer contact from the company contacts table
 * @param {number} abstractionAlertsCount - the number of abstraction alerts for the companies company contacts
 *
 * @returns {object} The data formatted for the view template
 */
function go(company, companyContact, abstractionAlertsCount) {
  return {
    backLink: {
      href: `/system/company-contacts/${companyContact.id}`,
      text: 'Go back to contact details'
    },
    contact: {
      name: companyContact.contact.$name(),
      email: companyContact.contact.email,
      abstractionAlerts: companyContact.abstractionAlerts ? 'Yes' : 'No'
    },
    pageTitle: `You're about to remove this contact`,
    pageTitleCaption: company.name,
    ..._warning(companyContact, abstractionAlertsCount)
  }
}

function _warning(companyContact, abstractionAlertsCount) {
  if (companyContact.abstractionAlerts && abstractionAlertsCount === 1) {
    return {
      warning: {
        text: 'Removing this contact means the licence holder will receive future water abstraction alerts by post.',
        iconFallbackText: 'Warning'
      }
    }
  }
}

module.exports = {
  go
}
