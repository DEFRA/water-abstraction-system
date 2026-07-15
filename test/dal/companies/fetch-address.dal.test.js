// Test helpers
import AddressHelper from '../../support/helpers/address.helper.js'

// Thing under test
import FetchAddressDal from '../../../app/dal/companies/fetch-address.dal.js'

describe('Companies - Fetch Address dal', () => {
  let address

  describe('when there is an address', () => {
    beforeAll(async () => {
      address = await AddressHelper.add()
    })

    it('returns the matching address', async () => {
      const result = await FetchAddressDal(address.id)

      expect(result).toEqual({
        id: address.id,
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
