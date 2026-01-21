'use strict'

/**
 * Formats data for the '/company-contacts/{id}' page
 * @module ViewCompanyContactPresenter
 */

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
      name: companyContact.contact.$name(),
      email: companyContact.contact.email,
      abstractionAlerts: companyContact.abstractionAlerts ? 'Yes' : 'No'
    },
    pageTitle: `Contact details for ${companyContact.contact.$name()}`,
    pageTitleCaption: company.name,
    removeContactLink: `/system/company-contacts/${companyContact.id}/remove`
  }
}

module.exports = {
  go
}
