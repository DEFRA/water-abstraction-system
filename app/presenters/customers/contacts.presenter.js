'use strict'

/**
 * Formats data for the 'customers/{id}/contacts' page
 * @module ContactsPresenter
 */

/**
 * Formats data for the 'customers/{id}/contacts' page
 *
 * @param {module:CompanyModel} customer - The customer from the companies table
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {object} The data formatted for the view template
 */
function go(customer, auth) {
  return {
    backLink: {
      href: '/',
      text: 'Back to search'
    },
    links: _links(customer, auth),
    pageTitle: 'Contacts',
    pageTitleCaption: customer.name
  }
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
function _links(customer, auth) {
  return {
    createContact: `/contact-entry/newCompanyContact.${customer.id}.${auth.credentials.user.id}/select-contact`,

    removeContact: `/customer/${customer.id}/contacts/remove`
  }
}

module.exports = {
  go
}
