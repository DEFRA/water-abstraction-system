'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { tomorrow } = require('../../support/general.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceDocumentHeaderHelper = require('../../support/helpers/licence-document-header.helper.js')

// Thing under test
const FetchInvalidAddressesService = require('../../../app/services/reports/fetch-invalid-addresses.service.js')

describe('Reports - Fetch Invalid Addresses service', () => {
  const metadata = {
    contacts: [
      {
        role: 'Licence holder',
        town: 'BRISTOL',
        county: 'AVON',
        country: null,
        postcode: null,
        addressLine1: 'ENVIRONMENT AGENCY',
        addressLine2: 'HORIZON HOUSE',
        addressLine3: 'DEANERY ROAD',
        addressLine4: null
      }
    ]
  }

  before(async () => {
    await LicenceDocumentHeaderHelper.add({ licenceRef: '03/28/01/0164' })
    await LicenceHelper.add({ licenceRef: '03/28/01/0164' })

    await LicenceDocumentHeaderHelper.add({ metadata, licenceRef: '03/28/01/0165' })
    await LicenceHelper.add({ licenceRef: '03/28/01/0165' })

    await LicenceDocumentHeaderHelper.add({ metadata, licenceRef: '03/28/01/0166' })
    await LicenceHelper.add({ expiredDate: tomorrow(), licenceRef: '03/28/01/0166' })

    metadata.contacts[0].role = 'Returns to'
    await LicenceDocumentHeaderHelper.add({ metadata, licenceRef: '03/28/01/0167' })
    await LicenceHelper.add({ lapsedDate: tomorrow(), licenceRef: '03/28/01/0167' })

    await LicenceDocumentHeaderHelper.add({ metadata, licenceRef: '03/28/01/0168' })
    await LicenceHelper.add({ revokedDate: tomorrow(), licenceRef: '03/28/01/0168' })
  })

  describe('when called', () => {
    it('returns a list of licences that are missing postcode and country fields', async () => {
      const result = await FetchInvalidAddressesService.go()

      expect(result.length).to.equal(4)
      expect(result).to.equal([
        {
          licence_ref: '03/28/01/0165',
          licence_ends: null,
          contact_role: 'Licence holder',
          address_line_1: metadata.contacts[0].addressLine1,
          address_line_2: metadata.contacts[0].addressLine2,
          address_line_3: metadata.contacts[0].addressLine3,
          address_line_4: metadata.contacts[0].addressLine4,
          town: metadata.contacts[0].town,
          county: metadata.contacts[0].county,
          postcode: null,
          country: null
        },
        {
          licence_ref: '03/28/01/0166',
          licence_ends: tomorrow(),
          contact_role: 'Licence holder',
          address_line_1: metadata.contacts[0].addressLine1,
          address_line_2: metadata.contacts[0].addressLine2,
          address_line_3: metadata.contacts[0].addressLine3,
          address_line_4: metadata.contacts[0].addressLine4,
          town: metadata.contacts[0].town,
          county: metadata.contacts[0].county,
          postcode: null,
          country: null
        },
        {
          licence_ref: '03/28/01/0167',
          licence_ends: tomorrow(),
          contact_role: 'Returns to',
          address_line_1: metadata.contacts[0].addressLine1,
          address_line_2: metadata.contacts[0].addressLine2,
          address_line_3: metadata.contacts[0].addressLine3,
          address_line_4: metadata.contacts[0].addressLine4,
          town: metadata.contacts[0].town,
          county: metadata.contacts[0].county,
          postcode: null,
          country: null
        },
        {
          licence_ref: '03/28/01/0168',
          licence_ends: tomorrow(),
          contact_role: 'Returns to',
          address_line_1: metadata.contacts[0].addressLine1,
          address_line_2: metadata.contacts[0].addressLine2,
          address_line_3: metadata.contacts[0].addressLine3,
          address_line_4: metadata.contacts[0].addressLine4,
          town: metadata.contacts[0].town,
          county: metadata.contacts[0].county,
          postcode: null,
          country: null
        }
      ])
    })
  })
})
