'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things to stub
const DetermineSearchItemsService = require('../../../app/services/search/determine-search-items.service.js')
const FetchSearchResultsDetailsService = require('../../../app/services/search/fetch-search-results-details.service.js')
const FetchSearchResultsService = require('../../../app/services/search/fetch-search-results.service.js')

// Thing under test
const FindAllSearchMatchesService = require('../../../app/services/search/find-all-search-matches.service.js')

describe('Search - Find all search matches service', () => {
  let page
  let query
  let resultType
  let userScopes

  beforeEach(() => {
    Sinon.stub(DetermineSearchItemsService, 'go').resolves(['billingAccount'])

    Sinon.stub(FetchSearchResultsDetailsService, 'go').resolves({
      billingAccount: [
        {
          accountNumber: 'A12345678A',
          id: 'billing-account-1'
        },
        {
          accountNumber: 'B12345678A',
          id: 'billing-account-2'
        }
      ]
    })

    Sinon.stub(FetchSearchResultsService, 'go').resolves({
      results: [
        { exact: true, id: 'billing-account-1', type: 'billingAccount' },
        { exact: false, id: 'billing-account-2', type: 'billingAccount' }
      ],
      total: 2
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    beforeEach(() => {
      page = 1
      query = '12345678'
      resultType = null
      userScopes = ['billing']
    })

    it('returns all the matching data', async () => {
      const result = await FindAllSearchMatchesService.go(query, resultType, page, userScopes)

      expect(result).to.equal({
        results: [
          {
            exact: true,
            model: {
              accountNumber: 'A12345678A',
              id: 'billing-account-1'
            },
            type: 'billingAccount'
          },
          {
            exact: false,
            model: {
              accountNumber: 'B12345678A',
              id: 'billing-account-2'
            },
            type: 'billingAccount'
          }
        ],
        total: 2
      })
    })
  })
})
