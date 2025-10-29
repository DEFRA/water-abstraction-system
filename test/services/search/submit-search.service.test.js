'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things to stub
const FindSingleSearchMatchService = require('../../../app/services/search/find-single-search-match.service.js')

// Thing under test
const SubmitSearchService = require('../../../app/services/search/submit-search.service.js')

const EXPECTED_ERROR = {
  errorList: [
    {
      href: '#query',
      text: 'Enter a licence number, customer name, returns ID, registered email address or monitoring station'
    }
  ],
  query: {
    text: 'Enter a licence number, customer name, returns ID, registered email address or monitoring station'
  }
}

describe('Search - Submit search service', () => {
  let payload
  let yar
  let yarSpy

  beforeEach(() => {
    yarSpy = Sinon.spy()
    yar = { set: yarSpy }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called with a valid query', () => {
    beforeEach(() => {
      payload = { query: 'searchthis' }
      Sinon.stub(FindSingleSearchMatchService, 'go').resolves()
    })

    it('sets the session value and returns a redirect to the search results page', async () => {
      const result = await SubmitSearchService.go(payload, yar)

      expect(yarSpy.calledOnceWithExactly('searchQuery', 'searchthis')).to.be.true()
      expect(result).to.equal({ redirect: '/system/search?page=1' })
    })
  })

  describe('when called without a valid query', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns an error message', async () => {
      const result = await SubmitSearchService.go(payload, yar)

      expect(result).to.equal({
        activeNavBar: 'search',
        error: EXPECTED_ERROR,
        pageTitle: 'Search',
        query: undefined,
        showResults: false
      })

      expect(yarSpy.called).to.be.false()
    })
  })

  describe('when called with a query that matches a single record that should be redirected', () => {
    beforeEach(() => {
      payload = { query: 'searchthis' }
      Sinon.stub(FindSingleSearchMatchService, 'go').resolves('/system/licences/licence-1/summary')
    })

    it('sets the session value and returns a redirect to the required page', async () => {
      const result = await SubmitSearchService.go(payload, yar)

      expect(yarSpy.calledOnceWithExactly('searchQuery', 'searchthis')).to.be.true()
      expect(result).to.equal({ redirect: '/system/licences/licence-1/summary' })
    })
  })
})
