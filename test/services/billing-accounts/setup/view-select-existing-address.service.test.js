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
const ViewSelectExistingAddressService = require('../../../../app/services/billing-accounts/setup/view-select-existing-address.service.js')

describe('Billing Accounts - Setup - Select Existing Address Service', () => {
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

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewSelectExistingAddressService.go(session.id)

      expect(result).to.equal({
        backLink: {
          href: `/system/billing-accounts/setup/${session.id}/select-account`,
          text: 'Back'
        },
        pageTitle: `Select an existing address for ${session.billingAccount.company.name}`,
        pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`
      })
    })
  })
})
