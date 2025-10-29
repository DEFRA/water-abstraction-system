'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we want to stub
const FetchInvalidAddressesService = require('../../../app/services/reports/fetch-invalid-addresses.service.js')

// Thing under test
const ViewInvalidAddressesService = require('../../../app/services/reports/view-invalid-addresses.service.js')

describe('Reports - View Invalid Addresses service', () => {
  beforeEach(() => {
    Sinon.stub(FetchInvalidAddressesService, 'go').returns(_invalidAddresses())
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewInvalidAddressesService.go()

      expect(result).to.equal({
        activeNavBar: 'manage',
        backLink: { href: '/system/manage', text: 'Go back to manage' },
        invalidAddresses: [
          {
            licenceRef: '03/28/01/0165',
            licenceEnds: null,
            contactRole: 'Licence holder',
            addressLines: [
              'Address Line 1: ENVIRONMENT AGENCY',
              'Address Line 2: HORIZON HOUSE',
              'Address Line 3: DEANERY ROAD',
              'Address Line 4: ',
              'Town: BRISTOL',
              'County: AVON'
            ]
          }
        ],
        pageTitle: 'Invalid addresses',
        tableCaption: 'Showing 1 invalid addresses'
      })
    })
  })
})

function _invalidAddresses() {
  return [
    {
      licence_ref: '03/28/01/0165',
      licence_ends: null,
      contact_role: 'Licence holder',
      address_line_1: 'ENVIRONMENT AGENCY',
      address_line_2: 'HORIZON HOUSE',
      address_line_3: 'DEANERY ROAD',
      address_line_4: null,
      town: 'BRISTOL',
      county: 'AVON',
      postcode: null,
      country: null
    }
  ]
}
