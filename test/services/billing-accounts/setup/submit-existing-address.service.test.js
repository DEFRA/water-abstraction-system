'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Test helpers
const BillingAccountsFixture = require('../../../fixtures/billing-accounts.fixtures.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Things to stub
const FetchExistingAddressesService = require('../../../../app/services/billing-accounts/setup/fetch-existing-addresses.service.js')

// Thing under test
const SubmitExistingAddressService = require('../../../../app/services/billing-accounts/setup/submit-existing-address.service.js')

describe('Billing Accounts - Setup - Submit Existing Address Service', () => {
  const addresses = _addresses()
  let payload
  let session
  let sessionData

  beforeEach(async () => {
    sessionData = {
      billingAccount: BillingAccountsFixture.billingAccount().billingAccount
    }

    session = await SessionHelper.add({ data: sessionData })
  })

  afterEach(async () => {
    await session.$query().delete()
  })

  describe('when the user picks an existing address', () => {
    beforeEach(async () => {
      payload = {
        addressSelected: generateUUID()
      }
    })

    it('saves the submitted value', async () => {
      await SubmitExistingAddressService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.data).to.equal(
        {
          addressSelected: payload.addressSelected
        },
        { skip: ['billingAccount'] }
      )
    })

    it('continues the journey', async () => {
      const result = await SubmitExistingAddressService.go(session.id, payload)

      expect(result).to.equal({
        addressSelected: payload.addressSelected
      })
    })
  })

  describe('when the user picks to set up a new address', () => {
    beforeEach(async () => {
      payload = {
        addressSelected: 'new'
      }
    })

    it('saves the submitted value', async () => {
      await SubmitExistingAddressService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.data).to.equal(
        {
          addressSelected: 'new'
        },
        { skip: ['billingAccount'] }
      )
    })

    it('continues the journey', async () => {
      const result = await SubmitExistingAddressService.go(session.id, payload)

      expect(result).to.equal({
        addressSelected: 'new'
      })
    })
  })

  describe('when validation fails', () => {
    beforeEach(async () => {
      payload = {}
      Sinon.stub(FetchExistingAddressesService, 'go').returns(addresses)
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitExistingAddressService.go(session.id, payload)

      expect(result.error).to.equal({
        errorList: [
          {
            href: '#addressSelected',
            text: `Select an existing address for ${session.billingAccount.company.name}`
          }
        ],
        addressSelected: { text: `Select an existing address for ${session.billingAccount.company.name}` }
      })
    })
  })
})

function _addresses() {
  return [
    {
      address: {
        id: generateUUID(),
        address1: 'ENVIRONMENT AGENCY',
        address2: 'HORIZON HOUSE',
        address3: 'DEANERY ROAD',
        address4: 'BRISTOL',
        address5: 'BRISTOLSHIRE',
        address6: null,
        postcode: 'BS1 5AH'
      }
    }
  ]
}
