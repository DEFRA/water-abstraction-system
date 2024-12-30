'use strict'

// Test framework dependencies
const { describe, it, beforeEach, after } = require('node:test')
const { expect } = require('@hapi/code')

// Test helpers
const BillingAccountHelper = require('../../../support/helpers/billing-account.helper.js')
const { closeConnection } = require('../../../support/database.js')

// Thing under test
const FetchBillingAccountsService = require('../../../../app/services/bill-runs/supplementary/fetch-billing-accounts.service.js')

describe('Fetch Billing Accounts service', () => {
  after(async () => {
    await closeConnection()
  })

  describe('when the service is called with an array of charge version', () => {
    let expectedResult
    let billingAccounts

    beforeEach(async () => {
      // We create three billing accounts but we will only be fetching the first two
      billingAccounts = await Promise.all([
        BillingAccountHelper.add(),
        BillingAccountHelper.add(),
        BillingAccountHelper.add()
      ])

      expectedResult = [
        {
          id: billingAccounts[0].id,
          accountNumber: billingAccounts[0].accountNumber
        },
        {
          id: billingAccounts[1].id,
          accountNumber: billingAccounts[1].accountNumber
        }
      ]
    })

    it('fetches the billing accounts that the charge versions link to', async () => {
      const result = await FetchBillingAccountsService.go([
        { billingAccountId: billingAccounts[0].id },
        { billingAccountId: billingAccounts[1].id }
      ])

      expect(result).to.have.length(2).and.contain(expectedResult)
    })
  })
})
