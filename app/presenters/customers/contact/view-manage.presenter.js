'use strict'

/**
 * Formats data for the '/customers/{customerId}/contact/{contactId}' page
 * @module ViewManagePresenter
 */

/**
 * Formats data for the '/customers/{customerId}/contact/{contactId}' page
 *
 * @param {module:CompanyModel} customer - The customer from the companies table
 * @param {module:ContactModel} contact - The customer from the companies table
 *
 * @returns {object} The data formatted for the view template
 */
function go(customer, contact) {
  return {
    backLink: {
      href: `/system/search`,
      text: 'Back'
    },
    pageTitle: `Manage contact settings for ${contact.$name()}`,
    pageTitleCaption: customer.name,
    contact: {
      name: contact.$name(),
      email: contact.email,
      abstractionAlerts: contact.companyContacts[0].abstractionAlerts ? 'Yes' : 'No'
    }
  }
}

module.exports = {
  go
}
