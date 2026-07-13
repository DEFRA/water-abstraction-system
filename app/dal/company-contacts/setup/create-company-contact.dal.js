/**
 * Creates the company contact data for the '/company-contacts/{id}' pages
 * @module CreateCompanyContactDal
 */

import CompanyContactModel from '../../../models/company-contact.model.js'
import LicenceRoleModel from '../../../models/licence-role.model.js'
import { today } from '../../../lib/general.lib.js'

/**
 * Creates the company contact data for the '/company-contacts/{id}' pages
 *
 * @param {string} companyId - the UUID of the company
 * @param {object} companyContact - the company contact
 *
 * @returns {Promise<string>} the newly created company contact id
 */
export default async function (companyId, companyContact) {
  const result = await _create(companyId, companyContact)

  return result.id
}

async function _create(companyId, companyContact) {
  return CompanyContactModel.query().insertGraph({
    companyId,
    startDate: today(),
    licenceRoleId: LicenceRoleModel.query().where('name', 'additionalContact').select('id'),
    abstractionAlertLicences: companyContact.abstractionAlertLicences,
    abstractionAlerts: companyContact.abstractionAlerts,
    createdBy: companyContact.createdBy,
    contact: {
      department: companyContact.name,
      email: companyContact.email,
      dataSource: 'wrls',
      contactType: 'department'
    }
  })
}
