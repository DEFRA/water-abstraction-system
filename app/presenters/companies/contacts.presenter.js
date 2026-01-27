'use strict'

/**
 * Formats data for the '/companies/{id}/contacts' page
 * @module ContactsPresenter
 */

const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')
const { formatCompanyContact } = require('../customer.presenter.js')

/**
 * Formats data for the '/companies/{id}/contacts' page
 *
 * @param {module:CompanyModel} company - The company
 * @param {module:CompanyContactModel} companyContacts - the company contacts for the customer
 *
 * @returns {object} The data formatted for the view template
 */
function go(company, companyContacts) {
  return {
    backLink: {
      href: '/',
      text: 'Back to search'
    },
    links: _links(company),
    pageTitle: 'Contacts',
    pageTitleCaption: company.name,
    companyContacts: _companyContacts(companyContacts, company)
  }
}

function _companyContacts(companyContacts, company) {
  return companyContacts.map((companyContact) => {
    const contact = formatCompanyContact(companyContact)

    return {
      action: FeatureFlagsConfig.enableCustomerManage
        ? `/system/company-contacts/${companyContact.id}`
        : `/customer/${company.id}/contacts/${companyContact.contact.id}`,
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
function _links(company) {
  return {
    createContact: `/customer/${company.id}/contacts/new`,
    removeContact: FeatureFlagsConfig.enableCustomerManage ? null : `/customer/${company.id}/contacts/remove`
  }
}

module.exports = {
  go
}
