'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillingAccountHelper = require('../../support/helpers/billing-account.helper.js')
const CompanyHelper = require('../../support/helpers/company.helper.js')

// Things we need to stub
const databaseConfig = require('../../../config/database.config.js')

// Thing under test
const FetchBillingAccountSearchResultsService = require('../../../app/services/search/fetch-billing-account-search-results.service.js')

describe('Search - Fetch billing account search results service', () => {
  const billingAccounts = []
  let company

  before(async () => {
    company = await CompanyHelper.add()

    // Add the billing accounts in non-alphabetical order to prove the ordering in the results
    billingAccounts.push(await BillingAccountHelper.add({ accountNumber: 'Y97327242A', companyId: company.id }))
    billingAccounts.push(await BillingAccountHelper.add({ accountNumber: 'Y97327243A', companyId: company.id }))
    billingAccounts.push(await BillingAccountHelper.add({ accountNumber: 'Y97327241A', companyId: company.id }))
  })

  describe('when matching billing accounts exist', () => {
    it('returns the correctly ordered matching billing accounts', async () => {
      const result = await FetchBillingAccountSearchResultsService.go('Y9732724', 1)

      expect(result).to.equal({
        results: [
          {
            accountNumber: billingAccounts[2].accountNumber,
            createdAt: billingAccounts[2].createdAt,
            id: billingAccounts[2].id,
            name: company.name
          },
          {
            accountNumber: billingAccounts[0].accountNumber,
            createdAt: billingAccounts[0].createdAt,
            id: billingAccounts[0].id,
            name: company.name
          },
          {
            accountNumber: billingAccounts[1].accountNumber,
            createdAt: billingAccounts[1].createdAt,
            id: billingAccounts[1].id,
            name: company.name
          }
        ],
        total: 3
      })
    })
  })

  describe('when only one matching billing account exists', () => {
    it('returns the correct billing account', async () => {
      const result = await FetchBillingAccountSearchResultsService.go('Y97327242', 1)

      expect(result).to.equal({
        results: [
          {
            accountNumber: billingAccounts[0].accountNumber,
            createdAt: billingAccounts[0].createdAt,
            id: billingAccounts[0].id,
            name: company.name
          }
        ],
        total: 1
      })
    })
  })

  describe('when the case of the search text does not match that of the billing account reference', () => {
    it('still returns the correct billing accounts', async () => {
      const result = await FetchBillingAccountSearchResultsService.go('y9732724', 1)

      expect(result).to.equal({
        results: [
          {
            accountNumber: billingAccounts[2].accountNumber,
            createdAt: billingAccounts[2].createdAt,
            id: billingAccounts[2].id,
            name: company.name
          },
          {
            accountNumber: billingAccounts[0].accountNumber,
            createdAt: billingAccounts[0].createdAt,
            id: billingAccounts[0].id,
            name: company.name
          },
          {
            accountNumber: billingAccounts[1].accountNumber,
            createdAt: billingAccounts[1].createdAt,
            id: billingAccounts[1].id,
            name: company.name
          }
        ],
        total: 3
      })
    })
  })

  describe('when multiple pages of results exist', () => {
    beforeEach(() => {
      // Set the page size to 1 to force multiple pages of results
      Sinon.stub(databaseConfig, 'defaultPageSize').value(1)
    })

    afterEach(() => {
      Sinon.restore()
    })

    it('correctly returns the requested page of results', async () => {
      const result = await FetchBillingAccountSearchResultsService.go('Y9732724', 2)

      expect(result).to.equal({
        results: [
          {
            accountNumber: billingAccounts[0].accountNumber,
            createdAt: billingAccounts[0].createdAt,
            id: billingAccounts[0].id,
            name: company.name
          }
        ],
        total: 3
      })
    })
  })

  describe('when no matching billing accounts exist', () => {
    it('returns empty query results', async () => {
      const result = await FetchBillingAccountSearchResultsService.go('Y97327249', 1)

      expect(result).to.equal({
        results: [],
        total: 0
      })
    })
  })

  describe('when searching for an exact match', () => {
    it('returns the correct billing account', async () => {
      const result = await FetchBillingAccountSearchResultsService.go('Y97327243A', 1, true)

      expect(result).to.equal({
        results: [
          {
            accountNumber: billingAccounts[1].accountNumber,
            createdAt: billingAccounts[1].createdAt,
            id: billingAccounts[1].id,
            name: company.name
          }
        ],
        total: 1
      })
    })
  })
})
