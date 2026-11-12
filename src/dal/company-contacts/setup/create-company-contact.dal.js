/**
 * Creates the company contact data for the '/company-contacts/{id}' pages
 * @module CreateCompanyContactDal
 */

import CompanyContactModel from 'water-abstraction-engine/models/company-contact.model.js'
import LicenceRoleModel from 'water-abstraction-engine/models/licence-role.model.js'
import { today } from 'water-abstraction-engine/lib/general.lib.js'

/**
 * Creates the company contact data for the '/company-contacts/{id}' pages
 *
 * @param {string} companyId - the UUID of the company
 * @param {object} companyContact - the company contact
 *
 * @returns {Promise<string>} the newly created company contact id
 */
export default async function createCompanyContactDal(companyId, companyContact) {
  const result = await _create(companyId, companyContact)

  return result.id
}

async function _create(companyId, companyContact) {
  return CompanyContactModel.query().insertGraph({
    abstractionAlertLicences: companyContact.abstractionAlertLicences,
    abstractionAlerts: companyContact.abstractionAlerts,
    companyId,
    contact: {
      contactType: 'department',
      dataSource: 'wrls',
      department: companyContact.name,
      email: companyContact.email
    },
    createdBy: companyContact.createdBy,
    licenceRoleId: LicenceRoleModel.query().where('name', 'additionalContact').select('id'),
    startDate: today()
  })
}
