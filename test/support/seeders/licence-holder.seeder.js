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
 * @param {String} licenceRef The licence reference that the company will be the licence holder for
 * @param {String} name The name of the company that will be the licence holder
 */
async function seed (licenceRef, name = 'Licence Holder Ltd') {
  // Create a licence role (the default is licenceHolder)
  const licenceRole = await LicenceRoleHelper.add()

  // Create a company record
  const company = await CompanyHelper.add({ name })

  // We have to create a licence document to link our licence record to (eventually!) the company or contact record that
  // is the 'licence holder'
  const licenceDocument = await LicenceDocumentHelper.add({ licenceRef })

  // Create the licence document role record that _is_ linked to the correct licence holder record
  await LicenceDocumentRoleHelper.add({
    licenceDocumentId: licenceDocument.id,
    licenceRoleId: licenceRole.id,
    companyId: company.id,
    startDate: new Date('2022-04-01')
  })
}

module.exports = {
  seed
}
