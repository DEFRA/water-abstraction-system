'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillingAccountsFixture = require('../../../support/fixtures/billing-accounts.fixtures.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitFAOService = require('../../../../app/services/billing-accounts/setup/submit-fao.service.js')

describe('Billing Accounts - Setup - Submit FAO Service', () => {
  let payload
  let session
  let sessionData

  beforeEach(async () => {
    sessionData = {
      billingAccount: BillingAccountsFixture.billingAccount().billingAccount
    }

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called with a "yes" value', () => {
    beforeEach(async () => {
      payload = {
        fao: 'yes'
      }
    })

    it('saves the submitted value', async () => {
      await SubmitFAOService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.data).to.equal(
        {
          fao: 'yes'
        },
        { skip: ['billingAccount'] }
      )
    })

    it('continues the journey', async () => {
      const result = await SubmitFAOService.go(session.id, payload)

      expect(result).to.equal({
        fao: 'yes'
      })
    })
  })

  describe('when called with a "no" value', () => {
    beforeEach(async () => {
      payload = {
        fao: 'no'
      }
    })

    it('saves the submitted value', async () => {
      await SubmitFAOService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.data).to.equal(
        {
          fao: 'no'
        },
        { skip: ['billingAccount'] }
      )
    })

    it('continues the journey', async () => {
      const result = await SubmitFAOService.go(session.id, payload)

      expect(result).to.equal({
        fao: 'no'
      })
    })
  })

  describe('when validation fails', () => {
    it('returns page data for the view, with errors', async () => {
      const result = await SubmitFAOService.go(session.id, {})

      expect(result.error).to.equal({
        errorList: [
          {
            href: '#fao',
            text: 'Select if you need to add an FAO'
          }
        ],
        fao: { text: 'Select if you need to add an FAO' }
      })
    })
  })
})
