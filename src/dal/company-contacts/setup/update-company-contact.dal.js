/**
 * Update the company contact data for the '/company-contacts/{id}/check' page
 * @module UpdateCompanyContactDal
 */

import CompanyContactModel from 'water-abstraction-engine/models/company-contact.model.js'
import { today } from 'water-abstraction-engine/lib/general.lib.js'

/**
 * Update the company contact data for the '/company-contacts/{id}/check' page
 *
 * @param {object} companyContact - the company contact
 *
 * @returns {Promise<string>} the updated company contact
 */
export default async function updateCompanyContactDal(companyContact) {
  const result = await _update(companyContact)

  return result.id
}

async function _update(companyContact) {
  return CompanyContactModel.query().upsertGraph(
    {
      abstractionAlertLicences: companyContact.abstractionAlertLicences,
      abstractionAlerts: companyContact.abstractionAlerts,
      contact: {
        contactType: 'department',
        dataSource: 'wrls',
        department: companyContact.name,
        email: companyContact.email,
        firstName: null,
        id: companyContact.contactId,
        initials: null,
        lastName: null,
        middleInitials: null,
        salutation: null,
        suffix: null,
        updatedAt: today().toISOString()
      },
      deletedAt: null,
      id: companyContact.id,
      updatedAt: today().toISOString(),
      updatedBy: companyContact.updatedBy
    },
    { noDelete: true }
  )
}
