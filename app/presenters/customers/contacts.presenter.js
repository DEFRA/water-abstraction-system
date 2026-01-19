'use strict'

/**
 * Formats data for the 'customers/{id}/contacts' page
 * @module ContactsPresenter
 */

const { formatCompanyContact } = require('../customer.presenter.js')
const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')

/**
 * Formats data for the 'customers/{id}/contacts' page
 *
 * @param {module:CompanyModel} customer - The customer from the companies table
 * @param {object} companyContacts - the company contacts for the customer
 *
 * @returns {object} The data formatted for the view template
 */
function go(customer, companyContacts) {
  return {
    backLink: {
      href: '/',
      text: 'Back to search'
    },
    links: _links(customer),
    pageTitle: 'Contacts',
    pageTitleCaption: customer.name,
    companyContacts: _companyContacts(companyContacts, customer)
  }
}

function _companyContacts(companyContacts, customer) {
  return companyContacts.map((companyContact) => {
    const contact = formatCompanyContact(companyContact)

    return {
      action: FeatureFlagsConfig.enableCustomerManage
        ? `/system/customers/${customer.id}/contact/${companyContact.contact.id}`
        : `/customer/${customer.id}/contacts/${companyContact.contact.id}`,
      ...contact
    }
  })
}

/**
 * When the legacy UI navigates to the create page, it uses a 'key' from the URL (https://github.com/DEFRA/water-abstraction-ui/blob/1ffa5f2a9ac481b306506776d43cd63c4ea9143c/src/internal/modules/customers/controllers.js#L260_.
 *
 * The legacy UI builds this key like so:
 * ```js
 *  const key = `newCompanyContact.${request.params.companyId}.${request.defra.userId}`
 * ```
 * We replicate this logic.
 *
 * @private
 */
function _links(customer) {
  return {
    createContact: `/customer/${customer.id}/contacts/new`,

    removeContact: `/customer/${customer.id}/contacts/remove`
  }
}

module.exports = {
  go
}
