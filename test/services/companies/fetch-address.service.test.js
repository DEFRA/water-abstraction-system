'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AddressHelper = require('../../support/helpers/address.helper.js')

// Thing under test
const FetchAddressService = require('../../../app/services/companies/fetch-address.service.js')

describe('Companies - Fetch Address service', () => {
  let address

  describe('when there is an address', () => {
    before(async () => {
      address = await AddressHelper.add()
    })

    it('returns the matching address', async () => {
      const result = await FetchAddressService.go(address.id)

      expect(result).to.equal({
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
