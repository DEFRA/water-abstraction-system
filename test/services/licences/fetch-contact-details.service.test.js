'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AddressHelper = require('../../support/helpers/address.helper.js')
const CompanyHelper = require('../../support/helpers/company.helper.js')
const LicenceDocumentHelper = require('../../support/helpers/licence-document.helper.js')
const LicenceDocumentRolesHelper = require('../../support/helpers/licence-document-role.helper.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceRoleHelper = require('../../support/helpers/licence-role.helper.js')

// Thing under test
const FetchContactDetailsService = require('../../../app/services/licences/fetch-contact-details.service.js')

describe('Licences - Fetch Contact Details service', () => {
  let companyId
  let licence

  describe('when the licence has contact details', () => {
    beforeEach(async () => {
      licence = await LicenceHelper.add()

      const company = await CompanyHelper.add()

      companyId = company.id

      const { id: licenceDocumentId } = await LicenceDocumentHelper.add({ licenceRef: licence.licenceRef })
      const { id: licenceRoleId } = await LicenceRoleHelper.select()
      const { id: addressId } = await AddressHelper.add()

      await LicenceDocumentRolesHelper.add({
        endDate: null,
        licenceDocumentId,
        addressId,
        licenceRoleId,
        companyId
      })
    })

    it('returns the matching licence contacts', async () => {
      const results = await FetchContactDetailsService.go(licence.id)

      expect(results).to.equal([
        {
          communicationType: 'Licence Holder',
          companyId,
          companyName: 'Example Trading Ltd',
          address1: 'ENVIRONMENT AGENCY',
          address2: 'HORIZON HOUSE',
          address3: 'DEANERY ROAD',
          address4: 'BRISTOL',
          address5: null,
          address6: null,
          postcode: 'BS1 5AH',
          country: 'United Kingdom'
        }
      ])
    })
  })
})
