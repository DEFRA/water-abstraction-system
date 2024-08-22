'use strict'

/**
 * @module LicenceHolderSeeder
 */

const CompanyHelper = require('../helpers/company.helper.js')
const LicenceDocumentHelper = require('../helpers/licence-document.helper.js')
const LicenceDocumentRoleHelper = require('../helpers/licence-document-role.helper.js')
const LicenceRoleHelper = require('../helpers/licence-role.helper.js')

/**
 * Adds a company to the provided licence that is set up to be the licence holder
 *
 * @param {string} licenceRef - The licence reference that the company will be the licence holder for
 * @param {string} [name] - The name of the company that will be the licence holder
 *
 * @returns {Promise<module:LicenceDocumentRoleHelper>} the licence document role which will link through to all the
 * entities that make up the licence holder
 */
async function seed (licenceRef, name = 'Licence Holder Ltd') {
  // Create a licence role (the default is licenceHolder)
  const { id: licenceRoleId } = await LicenceRoleHelper.add()

  // Create a company record
  const { id: companyId } = await CompanyHelper.add({ name })

  // We have to create a licence document to link our licence record to (eventually!) the company or contact record that
  // is the 'licence holder'
  const { id: licenceDocumentId } = await LicenceDocumentHelper.add({ licenceRef })

  // Create the licence document role record that _is_ linked to the correct licence holder record
  const { id: licenceDocumentRoleId } = await LicenceDocumentRoleHelper.add({
    licenceDocumentId,
    licenceRoleId,
    companyId,
    startDate: new Date('2022-04-01')
  })

  return {
    companyId,
    licenceDocumentId,
    licenceDocumentRoleId,
    licenceRoleId
  }
}

module.exports = {
  seed
}
