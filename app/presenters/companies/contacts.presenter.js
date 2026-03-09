'use strict'

/**
 * Formats data for the '/companies/{id}/contacts' page
 * @module ContactsPresenter
 */

const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')
const { roles } = require('../../lib/static-lookups.lib.js')

/**
 * Formats data for the '/companies/{id}/contacts' page
 *
 * @param {module:CompanyModel} company - The company
 * @param {object[]} companyContacts - the company contacts for the customer
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
    return {
      action: _companyContactLinks(company, companyContact),
      name: companyContact.name,
      communicationType: roles[companyContact.contact_type].label
    }
  })
}

/**
 * The ids returned from the query are unique to the contact type.
 *
 * We use the type to determine the correct link for the contact.
 *
 * @private
 */
function _companyContactLinks(company, companyContact) {
  const billingTypes = ['billing']
  const companyContactTypes = ['abstraction-alerts', 'additional-contact']
  const userTypes = ['basic-user', 'primary-user', 'returns-user']

  if (billingTypes.includes(companyContact.contact_type)) {
    return `/system/billing-accounts/${companyContact.id}?company-id=${company.id}`
  }

  if (companyContactTypes.includes(companyContact.contact_type)) {
    return FeatureFlagsConfig.enableCustomerManage
      ? `/system/company-contacts/${companyContact.id}`
      : `/customer/${company.id}/contacts/${companyContact.contact.id}`
  }

  if (userTypes.includes(companyContact.contact_type)) {
    return `/system/users/${companyContact.id}`
  }

  return `/system/companies/${companyContact.id}/${companyContact.contact_type}`
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
    createContact: FeatureFlagsConfig.enableCustomerManage
      ? `/system/company-contacts/setup/${company.id}`
      : `/customer/${company.id}/contacts/new`,
    removeContact: FeatureFlagsConfig.enableCustomerManage ? null : `/customer/${company.id}/contacts/remove`
  }
}

module.exports = {
  go
}
