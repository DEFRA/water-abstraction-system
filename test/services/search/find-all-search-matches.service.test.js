// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Things to stub
import * as DetermineSearchItemsService from '../../../app/services/search/determine-search-items.service.js'
import * as FetchSearchResultsDetailsService from '../../../app/services/search/fetch-search-results-details.service.js'
import * as FetchSearchResultsService from '../../../app/services/search/fetch-search-results.service.js'

// Thing under test
import FindAllSearchMatchesService from '../../../app/services/search/find-all-search-matches.service.js'

describe('Search - Find All Search Matches service', () => {
  let page
  let query
  let resultType
  let userScopes

  beforeEach(() => {
    vi.spyOn(DetermineSearchItemsService, 'default').mockResolvedValue(['billingAccount'])

    vi.spyOn(FetchSearchResultsDetailsService, 'default').mockResolvedValue({
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

    vi.spyOn(FetchSearchResultsService, 'default').mockResolvedValue({
      results: [
        { exact: true, id: 'billing-account-1', type: 'billingAccount' },
        { exact: false, id: 'billing-account-2', type: 'billingAccount' }
      ],
      total: 2
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    beforeEach(() => {
      page = '1'
      query = '12345678'
      resultType = null
      userScopes = ['billing']
    })

    it('returns all the matching data', async () => {
      const result = await FindAllSearchMatchesService(query, resultType, page, userScopes)

      expect(result).toEqual({
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
