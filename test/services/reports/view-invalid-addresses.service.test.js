// Things we want to stub
import * as FetchInvalidAddressesService from '../../../app/services/reports/fetch-invalid-addresses.service.js'

// Thing under test
import ViewInvalidAddressesService from '../../../app/services/reports/view-invalid-addresses.service.js'

describe('Reports - View Invalid Addresses service', () => {
  beforeEach(() => {
    vi.spyOn(FetchInvalidAddressesService, 'default').mockReturnValue(_invalidAddresses())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewInvalidAddressesService()

      expect(result).toEqual({
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
