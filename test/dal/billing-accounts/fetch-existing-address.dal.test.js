'use strict'

// Test helpers
const AddressHelper = require('../../support/helpers/address.helper.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Thing under test
const FetchExistingAddress = require('../../../app/dal/billing-accounts/fetch-existing-address.dal.js')

describe('DAL - Fetch Existing Address dal', () => {
  let address

  beforeAll(async () => {
    address = await AddressHelper.add()
  })

  afterAll(async () => {
    await address.$query().delete()
  })

  describe('when there is a matching address found', () => {
    it('returns the matching address', async () => {
      const result = await FetchExistingAddress.go(address.id)

      expect(result).toEqual({
        address1: address.address1,
        address2: address.address2,
        address3: address.address3,
        address4: address.address4,
        address5: null,
        address6: null,
        id: address.id,
        postcode: address.postcode
      })
    })
  })

  describe('when there are no matching addresses found', () => {
    it('returns "undefined', async () => {
      const result = await FetchExistingAddress.go(generateUUID())

      expect(result).toBeUndefined()
    })
  })
})
