// Test framework
import { describe, expect, it } from 'vitest'

// Test helpers
import { formatDateObjectToISO } from 'water-abstraction-engine/lib/dates.lib.js'
import { tomorrow } from 'water-abstraction-engine/test/general.js'

// Thing under test
import ViewInvalidAddressesPresenter from '../../../src/presenters/reports/view-invalid-addresses.presenter.js'

describe('Reports - View invalid addresses presenter', () => {
  describe('when there are no addresses to display', () => {
    it('returns the basic page data', async () => {
      const result = await ViewInvalidAddressesPresenter([])

      expect(result).toEqual({
        backLink: { href: '/system/manage', text: 'Go back to manage' },
        invalidAddresses: [],
        pageTitle: 'Invalid addresses',
        tableCaption: 'Showing 0 invalid addresses'
      })
    })
  })

  describe('when there are addresses to display', () => {
    it('returns the formatted page data', async () => {
      const result = await ViewInvalidAddressesPresenter(_invalidAddresses())

      expect(result).toEqual({
        backLink: { href: '/system/manage', text: 'Go back to manage' },
        invalidAddresses: [
          {
            addressLines: [
              'Address Line 1: ENVIRONMENT AGENCY',
              'Address Line 2: HORIZON HOUSE',
              'Address Line 3: DEANERY ROAD',
              'Address Line 4: ',
              'Town: BRISTOL',
              'County: AVON'
            ],
            contactRole: 'Licence holder',
            licenceEnds: null,
            licenceRef: '03/28/01/0165'
          },
          {
            addressLines: [
              'Address Line 1: ENVIRONMENT AGENCY',
              'Address Line 2: HORIZON HOUSE',
              'Address Line 3: ',
              'Address Line 4: DEANERY ROAD',
              'Town: BRISTOL',
              'County: '
            ],
            contactRole: 'Licence holder',
            licenceEnds: formatDateObjectToISO(tomorrow()),
            licenceRef: '03/28/01/0166'
          },
          {
            addressLines: [
              'Address Line 1: ENVIRONMENT AGENCY',
              'Address Line 2: ',
              'Address Line 3: HORIZON HOUSE',
              'Address Line 4: DEANERY ROAD',
              'Town: ',
              'County: AVON'
            ],
            contactRole: 'Returns to',
            licenceEnds: formatDateObjectToISO(tomorrow()),
            licenceRef: '03/28/01/0167'
          },
          {
            addressLines: [
              'Address Line 1: ',
              'Address Line 2: ',
              'Address Line 3: ENVIRONMENT AGENCY',
              'Address Line 4: DEANERY ROAD',
              'Town: ',
              'County: '
            ],
            contactRole: 'Returns to',
            licenceEnds: formatDateObjectToISO(tomorrow()),
            licenceRef: '03/28/01/0168'
          },
          {
            addressLines: [
              'Address Line 1: ENVIRONMENT AGENCY',
              'Address Line 2: (Facilities) HORIZON HOUSE',
              'Address Line 3: DEANERY ROAD',
              'Address Line 4: ',
              'Town: BRISTOL',
              'County: AVON',
              'Postcode: BS1 5AH',
              'Country: United Kingdom'
            ],
            contactRole: 'Returns to',
            licenceEnds: null,
            licenceRef: '03/28/01/0170'
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
      address_line_1: 'ENVIRONMENT AGENCY',
      address_line_2: 'HORIZON HOUSE',
      address_line_3: 'DEANERY ROAD',
      address_line_4: null,
      contact_role: 'Licence holder',
      country: null,
      county: 'AVON',
      licence_ends: null,
      licence_ref: '03/28/01/0165',
      postcode: null,
      town: 'BRISTOL'
    },
    {
      address_line_1: 'ENVIRONMENT AGENCY',
      address_line_2: 'HORIZON HOUSE',
      address_line_3: null,
      address_line_4: 'DEANERY ROAD',
      contact_role: 'Licence holder',
      country: null,
      county: null,
      licence_ends: tomorrow(),
      licence_ref: '03/28/01/0166',
      postcode: null,
      town: 'BRISTOL'
    },
    {
      address_line_1: 'ENVIRONMENT AGENCY',
      address_line_2: null,
      address_line_3: 'HORIZON HOUSE',
      address_line_4: 'DEANERY ROAD',
      contact_role: 'Returns to',
      country: null,
      county: 'AVON',
      licence_ends: tomorrow(),
      licence_ref: '03/28/01/0167',
      postcode: null,
      town: null
    },
    {
      address_line_1: null,
      address_line_2: null,
      address_line_3: 'ENVIRONMENT AGENCY',
      address_line_4: 'DEANERY ROAD',
      contact_role: 'Returns to',
      country: null,
      county: null,
      licence_ends: tomorrow(),
      licence_ref: '03/28/01/0168',
      postcode: null,
      town: null
    },
    {
      address_line_1: 'ENVIRONMENT AGENCY',
      address_line_2: '(Facilities) HORIZON HOUSE',
      address_line_3: 'DEANERY ROAD',
      address_line_4: null,
      contact_role: 'Returns to',
      country: 'United Kingdom',
      county: 'AVON',
      licence_ends: null,
      licence_ref: '03/28/01/0170',
      postcode: 'BS1 5AH',
      town: 'BRISTOL'
    }
  ]
}
