/**
 * Fetches the company contact needed for the view '/company-contacts/{id}communications' page
 * @module FetchCompanyContactDal
 */

import CompanyContactModel from '../../models/company-contact.model.js'

/**
 * Fetches just the company contact name needed for the view '/company-contacts/{id}communications' page
 *
 * @param {string} companyContactId - The company contact id
 *
 * @returns {Promise<module:CompanyContactModel>} the company contact and associated contact record
 */
export default async function (companyContactId) {
  return CompanyContactModel.query()
    .select(['abstractionAlertLicences', 'abstractionAlerts', 'companyId', 'id'])
    .findById(companyContactId)
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
