'use strict'

/**
 * Fetches the company contacts data needed for the '/company-contacts/setup/{sessionId}/check' page
 * @module FetchCompanyContactsService
 */

const CompanyContactModel = require('../../../models/company-contact.model.js')

/**
 * Fetches the company contacts data needed for the '/company-contacts/setup/{sessionId}/check' page
 *
 * The 'companyContact' will exist if the user is editing an existing company contact. In this case we need to exclude
 * it from the results.
 *
 * @param {string} companyId - The company id for the company
 * @param {object} companyContact - The company contact being edited (if it exists)
 *
 * @returns {Promise<object[]>} the company contacts for the company
 */
async function go(companyId, companyContact) {
  return _fetch(companyId, companyContact)
}

async function _fetch(companyId, companyContact) {
  const excluded = companyContact ? [companyContact.id] : []

  return CompanyContactModel.query()
    .select(['id', 'deletedAt'])
    .where('companyId', companyId)
    .whereNotIn('id', excluded)
    .withGraphFetched('contact')
    .modifyGraph('contact', (contactBuilder) => {
      contactBuilder.select([
        'id',
        'salutation',
        'firstName',
        'middleInitials',
        'lastName',
        'initials',
        'contactType',
        'suffix',
        'department',
        'email'
      ])
    })
}

module.exports = {
  go
}
