/**
 * Fetches all contacts for a specified company
 * @module FetchCompanyContactsService
 */

import CompanyModel from '../../../models/company.model.js'
import ContactModel from '../../../models/contact.model.js'

/**
 * Fetches all contacts for a specified company
 *
 * @param {string} companyId - The UUID of the company to fetch contacts for
 *
 * @returns {Promise<object[]>} an object containing the matching contacts needed to populate the view
 */
export default async function fetchCompanyContactsService(companyId) {
  const company = await CompanyModel.query().select(['id', 'name']).findById(companyId)
  const contacts = await ContactModel.query()
    .select([
      'contacts.id',
      'salutation',
      'firstName',
      'middleInitials',
      'lastName',
      'initials',
      'contactType',
      'suffix',
      'department'
    ])
    .innerJoinRelated('companyContacts')
    .where('companyContacts.companyId', companyId)
    .distinctOn('companyContacts.contactId')

  return {
    company,
    contacts
  }
}
