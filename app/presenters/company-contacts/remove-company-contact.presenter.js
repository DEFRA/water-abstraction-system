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
 *
 * @returns {object} The data formatted for the view template
 */
function go(company, companyContact) {
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
    pageTitleCaption: company.name
  }
}

module.exports = {
  go
}
