'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillingAccountsFixture = require('../../../fixtures/billing-accounts.fixtures.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitSelectExistingAddressService = require('../../../../app/services/billing-accounts/setup/submit-select-existing-address.service.js')

describe('Select Existing Address Service', () => {
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
        addressSelected: 'existing'
      }
    })

    it('saves the submitted value', async () => {
      await SubmitSelectExistingAddressService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.data).to.equal(
        {
          addressSelected: 'existing'
        },
        { skip: ['billingAccount'] }
      )
    })

    it('continues the journey', async () => {
      const result = await SubmitSelectExistingAddressService.go(session.id, payload)

      expect(result).to.equal({
        addressSelected: 'existing'
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
      await SubmitSelectExistingAddressService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.data).to.equal(
        {
          addressSelected: 'new'
        },
        { skip: ['billingAccount'] }
      )
    })

    it('continues the journey', async () => {
      const result = await SubmitSelectExistingAddressService.go(session.id, payload)

      expect(result).to.equal({
        addressSelected: 'new'
      })
    })
  })

  describe('when validation fails', () => {
    beforeEach(async () => {
      payload = {}
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitSelectExistingAddressService.go(session.id, payload)

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
