'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, after, before } = (exports.lab = Lab.script())
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
  let address
  let company
  let licence
  let licenceDocument
  let licenceDocumentRole

  before(async () => {
    licence = await LicenceHelper.add()

    company = await CompanyHelper.add()

    licenceDocument = await LicenceDocumentHelper.add({ licenceRef: licence.licenceRef })
    const licenceRole = await LicenceRoleHelper.select()
    address = await AddressHelper.add()

    licenceDocumentRole = await LicenceDocumentRolesHelper.add({
      endDate: null,
      licenceDocumentId: licenceDocument.id,
      addressId: address.id,
      licenceRoleId: licenceRole.id,
      companyId: company.id
    })
  })

  after(async () => {
    await address.$query().delete()
    await company.$query().delete()
    await licence.$query().delete()
    await licenceDocument.$query().delete()
    await licenceDocumentRole.$query().delete()
  })

  describe('when the licence has contact details', () => {
    it('returns the matching licence contacts', async () => {
      const results = await FetchContactDetailsService.go(licence.id)

      expect(results).to.equal([
        {
          communicationType: 'Licence Holder',
          companyId: company.id,
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
