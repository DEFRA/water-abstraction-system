'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const SubmitSearchService = require('../../../app/services/search/submit-search.service.js')

const EXPECTED_ERROR = {
  errorList: [
    {
      href: '#$query',
      text: 'Enter a licence number, customer name, returns ID, registered email address or monitoring station'
    }
  ],
  query: 'Enter a licence number, customer name, returns ID, registered email address or monitoring station'
}

describe('Search - Submit search service', () => {
  let query

  describe('when called with a query', () => {
    beforeEach(() => {
      query = 'searchthis'
    })

    it('returns page data for the view', async () => {
      const result = await SubmitSearchService.go(query)

      expect(result).to.equal({
        activeNavBar: 'search',
        pageTitle: 'Search',
        query: 'searchthis'
      })
    })
  })

  describe('when called with a missing query', () => {
    beforeEach(() => {
      query = null
    })

    it('returns page data with an error message', async () => {
      const result = await SubmitSearchService.go(query)

      expect(result).to.equal({
        activeNavBar: 'search',
        error: EXPECTED_ERROR,
        pageTitle: 'Search',
        query: ''
      })
    })
  })

  describe('when called with a blank query', () => {
    beforeEach(() => {
      query = ''
    })

    it('returns page data with an error message', async () => {
      const result = await SubmitSearchService.go(query)

      expect(result).to.equal({
        activeNavBar: 'search',
        error: EXPECTED_ERROR,
        pageTitle: 'Search',
        query: ''
      })
    })
  })

  describe('when called with a whitespace query', () => {
    beforeEach(() => {
      query = ' '
    })

    it('returns page data with an error message', async () => {
      const result = await SubmitSearchService.go(query)

      expect(result).to.equal({
        activeNavBar: 'search',
        error: EXPECTED_ERROR,
        pageTitle: 'Search',
        query: ' '
      })
    })
  })
})
