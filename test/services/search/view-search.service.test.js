'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ViewSearchService = require('../../../app/services/search/view-search.service.js')

describe('Search - View Search service', () => {
  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewSearchService.go()

      expect(result).to.equal({
        activeNavBar: 'search',
        pageTitle: 'Search',
        query: undefined,
        showResults: false
      })
    })
  })
})
