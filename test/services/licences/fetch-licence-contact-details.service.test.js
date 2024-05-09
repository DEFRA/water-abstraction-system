'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const AddressHelper = require('../../support/helpers/address.helper')
const CompanyHelper = require('../../support/helpers/company.helper')
const ContactModel = require('../../support/helpers/contact.helper')
const DatabaseSupport = require('../../support/database.js')
const LicenceDocumentHelper = require('../../support/helpers/licence-document.helper')
const LicenceDocumentRolesHelper = require('../../support/helpers/licence-document-role.helper')
const LicenceHelper = require('../../support/helpers/licence.helper')
const LicenceRoleHelper = require('../../support/helpers/licence-role.helper')

// Thing under test
const FetchLicenceContactDetailsService =
  require('../../../app/services/licences/fetch-licence-contact-details.service')

describe('Fetch licence contact details service', () => {
  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  describe('when the licence has contact details', () => {
    const addressId = '3eef7d72-9f8d-4f17-9b50-3739cb7f4aed'
    const companyId = 'd3398615-f613-46be-a9ce-d452cf702271'
    const contactId = '47fd9240-0a7b-4412-9db4-9ac4a94f675c'
    const documentId = '93540ffd-fd4f-4a03-84b3-dba3b297a752'
    const licenceId = '96d97293-1a62-4ad0-bcb6-24f68a203e6b'
    const licenceRef = '21/06'
    const licenceRoleId = 'ee59a1ce-272a-4f73-aa08-2d62dec4bbe1'

    beforeEach(async () => {
      await AddressHelper.add({
        id: addressId
      })

      await ContactModel.add({
        id: contactId
      })

      await CompanyHelper.add({
        id: companyId
      })

      await LicenceDocumentRolesHelper.add({
        endDate: null,
        licenceDocumentId: documentId,
        addressId,
        licenceRoleId,
        contactId,
        companyId
      })

      await LicenceDocumentHelper.add({
        licenceRef,
        id: documentId
      })

      await LicenceHelper.add({
        id: licenceId,
        licenceRef
      })

      await LicenceRoleHelper.add({
        id: licenceRoleId
      })
    })

    it('returns licenceContacts', async () => {
      const result = await FetchLicenceContactDetailsService.go(licenceId)
      const [licenceUnderTest] = result.licenceContacts

      // Address
      expect(licenceUnderTest.address.address1).to.equal('ENVIRONMENT AGENCY')
      expect(licenceUnderTest.address.address2).to.equal('HORIZON HOUSE')
      expect(licenceUnderTest.address.address3).to.equal('DEANERY ROAD')
      expect(licenceUnderTest.address.address4).to.equal('BRISTOL')
      expect(licenceUnderTest.address.country).to.equal('United Kingdom')
      expect(licenceUnderTest.address.postcode).to.equal('BS1 5AH')
      // Company
      expect(licenceUnderTest.company.id).to.equal(companyId)
      expect(licenceUnderTest.company.name).to.equal('Example Trading Ltd')
      // Contact
      expect(licenceUnderTest.contact.firstName).to.equal('Amara')
      expect(licenceUnderTest.contact.lastName).to.equal('Gupta')
      // Licence Role
      expect(licenceUnderTest.licenceRole.label).to.equal('Licence Holder')
      expect(licenceUnderTest.licenceRole.name).to.equal('licenceHolder')
    })
  })
})
