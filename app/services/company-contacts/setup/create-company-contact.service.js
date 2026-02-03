'use strict'

/**
 * Creates the company contact data for the '/company-contacts/{id}' pages
 * @module CreateCompanyContactService
 */

const CompanyContactModel = require('../../../models/company-contact.model.js')
const LicenceRoleModel = require('../../../models/licence-role.model.js')
const { today } = require('../../../lib/general.lib.js')

/**
 * Creates the company contact data for the '/company-contacts/{id}' pages
 *
 * @param {string} companyId - the UUID of the company
 * @param {object} companyContact - the company contact
 *
 * @returns {Promise<string>} the newly created company contact id
 */
async function go(companyId, companyContact) {
  const result = await _create(companyId, companyContact)

  return result.id
}

async function _create(companyId, companyContact) {
  return CompanyContactModel.query().insertGraph({
    companyId,
    startDate: today(),
    licenceRoleId: LicenceRoleModel.query().where('name', 'additionalContact').select('id'),
    abstractionAlerts: companyContact.abstractionAlerts,
    contact: {
      department: companyContact.name,
      email: companyContact.email,
      dataSource: 'wrls',
      contactType: 'department'
    }
  })
}

module.exports = {
  go
}
