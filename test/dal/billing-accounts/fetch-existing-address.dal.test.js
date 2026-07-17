// Test framework
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import AddressHelper from '../../support/helpers/address.helper.js'
import { generateUUID } from '../../support/generators.js'

// Thing under test
import FetchExistingAddress from '../../../app/dal/billing-accounts/fetch-existing-address.dal.js'

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
      const result = await FetchExistingAddress(address.id)

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
      const result = await FetchExistingAddress(generateUUID())

      expect(result).toBeUndefined()
    })
  })
})
