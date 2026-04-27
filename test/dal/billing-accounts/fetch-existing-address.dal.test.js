'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, after, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AddressHelper = require('../../support/helpers/address.helper.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Thing under test
const FetchExistingAddress = require('../../../app/dal/billing-accounts/fetch-existing-address.dal.js')

describe('DAL - Fetch Existing Address dal', () => {
  let address

  before(async () => {
    address = await AddressHelper.add()
  })

  after(async () => {
    await address.$query().delete()
  })

  describe('when there is a matching address found', () => {
    it('returns an array of address lines', async () => {
      const result = await FetchExistingAddress.go(address.id)

      expect(result).to.equal({
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
    it('returns an empty array', async () => {
      const result = await FetchExistingAddress.go(generateUUID())

      expect(result).to.be.undefined()
    })
  })
})
