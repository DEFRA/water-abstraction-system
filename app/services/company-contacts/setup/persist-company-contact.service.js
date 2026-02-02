'use strict'

/**
 * Persist the company contact data for the '/company-contacts/{id}' pages
 * @module PersistCompanyContactService
 */

const CompanyContactModel = require('../../../models/company-contact.model.js')
const LicenceRoleModel = require('../../../models/licence-role.model.js')
const { timestampForPostgres } = require('../../../lib/general.lib.js')

/**
 * Persist the company contact data for the '/company-contacts/{id}' pages
 *
 * @param companyId
 * @param companyContact
 * @returns {Promise<CompanyContactModel>} the company contacts for the customer and the pagination object
 */
async function go(companyId, companyContact) {
  return _persist(companyId, companyContact)
}

async function _persist(companyId, companyContact) {
  return CompanyContactModel.query().insertGraph({
    companyId,
    startDate: timestampForPostgres(),
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
