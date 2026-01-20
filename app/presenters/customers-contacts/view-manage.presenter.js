'use strict'

/**
 * Formats data for the '/customers-contacts/{id}/manage' page
 * @module ViewManagePresenter
 */

/**
 * Formats data for the '/customers-contacts/{id}/manage' page
 *
 * @param {module:CompanyModel} company - The customer from the companies table
 * @param {module:CompanyContactModel} companyContact - The customer contact from the company contacts table
 *
 * @returns {object} The data formatted for the view template
 */
function go(company, companyContact) {
  return {
    backLink: {
      href: `/system/customers/${company.id}/contacts`,
      text: 'Go back to contacts'
    },
    contact: {
      name: companyContact.contact.$name(),
      email: companyContact.contact.email,
      abstractionAlerts: companyContact.abstractionAlerts ? 'Yes' : 'No'
    },
    pageTitle: `Contact details for ${companyContact.contact.$name()}`,
    pageTitleCaption: company.name
  }
}

module.exports = {
  go
}
