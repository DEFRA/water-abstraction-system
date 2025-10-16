'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { formatDateObjectToISO } = require('../../../app/lib/dates.lib.js')
const { tomorrow } = require('../../support/general.js')

// Thing under test
const ViewInvalidAddressesPresenter = require('../../../app/presenters/reports/view-invalid-addresses.presenter.js')

describe('Reports - View invalid addresses presenter', () => {
  describe('when there are no addresses to display', () => {
    it('returns the basic page data', async () => {
      const result = await ViewInvalidAddressesPresenter.go([])

      expect(result).to.equal({
        backLink: { href: '/system/manage', text: 'Go back to manage' },
        invalidAddresses: [],
        pageTitle: 'Invalid addresses',
        tableCaption: 'Showing 0 invalid addresses'
      })
    })
  })

  describe('when there are addresses to display', () => {
    it('returns the formatted page data', async () => {
      const result = await ViewInvalidAddressesPresenter.go(_invalidAddresses())

      expect(result).to.equal({
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
              'County: AVON',
              'Town: BRISTOL'
            ]
          },
          {
            licenceRef: '03/28/01/0166',
            licenceEnds: formatDateObjectToISO(tomorrow()),
            contactRole: 'Licence holder',
            addressLines: [
              'Address Line 1: ENVIRONMENT AGENCY',
              'Address Line 2: HORIZON HOUSE',
              'Address Line 3: ',
              'Address Line 4: DEANERY ROAD',
              'County: ',
              'Town: BRISTOL'
            ]
          },
          {
            licenceRef: '03/28/01/0167',
            licenceEnds: formatDateObjectToISO(tomorrow()),
            contactRole: 'Returns to',
            addressLines: [
              'Address Line 1: ENVIRONMENT AGENCY',
              'Address Line 2: ',
              'Address Line 3: HORIZON HOUSE',
              'Address Line 4: DEANERY ROAD',
              'County: AVON',
              'Town: '
            ]
          },
          {
            licenceRef: '03/28/01/0168',
            licenceEnds: formatDateObjectToISO(tomorrow()),
            contactRole: 'Returns to',
            addressLines: [
              'Address Line 1: ',
              'Address Line 2: ',
              'Address Line 3: ENVIRONMENT AGENCY',
              'Address Line 4: DEANERY ROAD',
              'County: ',
              'Town: '
            ]
          },
          {
            licenceRef: '03/28/01/0170',
            licenceEnds: null,
            contactRole: 'Returns to',
            addressLines: [
              'Address Line 1: ENVIRONMENT AGENCY',
              'Address Line 2: (Facilities) HORIZON HOUSE',
              'Address Line 3: DEANERY ROAD',
              'Address Line 4: ',
              'County: AVON',
              'Town: BRISTOL',
              'Postcode: BS1 5AH',
              'Country: United Kingdom'
            ]
          }
        ],
        pageTitle: 'Invalid addresses',
        tableCaption: 'Showing 5 invalid addresses'
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
    },
    {
      licence_ref: '03/28/01/0166',
      licence_ends: tomorrow(),
      contact_role: 'Licence holder',
      address_line_1: 'ENVIRONMENT AGENCY',
      address_line_2: 'HORIZON HOUSE',
      address_line_3: null,
      address_line_4: 'DEANERY ROAD',
      town: 'BRISTOL',
      county: null,
      postcode: null,
      country: null
    },
    {
      licence_ref: '03/28/01/0167',
      licence_ends: tomorrow(),
      contact_role: 'Returns to',
      address_line_1: 'ENVIRONMENT AGENCY',
      address_line_2: null,
      address_line_3: 'HORIZON HOUSE',
      address_line_4: 'DEANERY ROAD',
      town: null,
      county: 'AVON',
      postcode: null,
      country: null
    },
    {
      licence_ref: '03/28/01/0168',
      licence_ends: tomorrow(),
      contact_role: 'Returns to',
      address_line_1: null,
      address_line_2: null,
      address_line_3: 'ENVIRONMENT AGENCY',
      address_line_4: 'DEANERY ROAD',
      town: null,
      county: null,
      postcode: null,
      country: null
    },
    {
      licence_ref: '03/28/01/0170',
      licence_ends: null,
      contact_role: 'Returns to',
      address_line_1: 'ENVIRONMENT AGENCY',
      address_line_2: '(Facilities) HORIZON HOUSE',
      address_line_3: 'DEANERY ROAD',
      address_line_4: null,
      town: 'BRISTOL',
      county: 'AVON',
      postcode: 'BS1 5AH',
      country: 'United Kingdom'
    }
  ]
}
