'use strict'

/**
 * Update the company contact data for the '/company-contacts/{id}/check' page
 * @module UpdateCompanyContactService
 */

const CompanyContactModel = require('../../../models/company-contact.model.js')
const { today } = require('../../../lib/general.lib.js')

/**
 * Update the company contact data for the '/company-contacts/{id}/check' page
 *
 * @param {object} companyContact - the company contact
 *
 * @returns {Promise<string>} the updated company contact
 */
async function go(companyContact) {
  const result = await _update(companyContact)

  return result.id
}

async function _update(companyContact) {
  return CompanyContactModel.query().upsertGraph(
    {
      id: companyContact.id,
      abstractionAlerts: companyContact.abstractionAlerts,
      updatedBy: companyContact.updatedBy,
      updatedAt: today().toISOString(),
      contact: {
        id: companyContact.contactId,
        department: companyContact.name,
        email: companyContact.email,
        dataSource: 'wrls',
        contactType: 'department',
        initials: null,
        lastName: null,
        middleInitials: null,
        salutation: null,
        suffix: null,
        firstName: null,
        updatedAt: today().toISOString()
      }
    },
    { noDelete: true }
  )
}

module.exports = {
  go
}
