'use strict'

// Test framework dependencies
const { describe, it, beforeEach, after } = require('node:test')
const { expect } = require('@hapi/code')

// Test helpers
const AddressHelper = require('../../support/helpers/address.helper.js')
const CompanyHelper = require('../../support/helpers/company.helper.js')
const ContactHelper = require('../../support/helpers/contact.helper.js')
const { closeConnection } = require('../../support/database.js')
const LicenceDocumentHelper = require('../../support/helpers/licence-document.helper.js')
const LicenceDocumentRolesHelper = require('../../support/helpers/licence-document-role.helper.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceRoleHelper = require('../../support/helpers/licence-role.helper.js')

// Thing under test
const FetchLicenceContactsService = require('../../../app/services/licences/fetch-licence-contacts.service.js')

describe('Fetch Licence Contacts service', () => {
  let licenceId
  let companyId
  let contactId

  after(async () => {
    await closeConnection()
  })

  describe('when the licence has contact details', () => {
    beforeEach(async () => {
      const licence = await LicenceHelper.add()

      licenceId = licence.id

      const company = await CompanyHelper.add()

      companyId = company.id

      const contact = await ContactHelper.add()

      contactId = contact.id

      const { id: licenceDocumentId } = await LicenceDocumentHelper.add({ licenceRef: licence.licenceRef })
      const { id: licenceRoleId } = await LicenceRoleHelper.select()
      const { id: addressId } = await AddressHelper.add()

      await LicenceDocumentRolesHelper.add({
        endDate: null,
        licenceDocumentId,
        addressId,
        licenceRoleId,
        contactId,
        companyId
      })
    })

    it('returns the matching licence contacts', async () => {
      const results = await FetchLicenceContactsService.go(licenceId)

      expect(results[0]).to.equal({
        communicationType: 'Licence Holder',
        companyId,
        companyName: 'Example Trading Ltd',
        contactId,
        firstName: 'Amara',
        lastName: 'Gupta',
        address1: 'ENVIRONMENT AGENCY',
        address2: 'HORIZON HOUSE',
        address3: 'DEANERY ROAD',
        address4: 'BRISTOL',
        address5: null,
        address6: null,
        postcode: 'BS1 5AH',
        country: 'United Kingdom'
      })
    })
  })
})
