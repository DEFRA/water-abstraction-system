'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things to stub
const LicenceModel = require('../../../app/models/licence.model.js')

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
  let requestQuery

  beforeEach(async () => {
    const queryStub = Sinon.stub(LicenceModel, 'query')

    queryStub.returns({
      select: Sinon.stub().returnsThis(),
      joinRelated: Sinon.stub().returnsThis(),
      orderBy: Sinon.stub().returnsThis(),
      orWhere: Sinon.stub().returnsThis(),
      page: Sinon.stub().resolves({ results: [], total: 0 }),
      where: Sinon.stub().returnsThis()
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called with a query', () => {
    beforeEach(() => {
      requestQuery = { query: 'searchthis' }
    })

    it('returns page data for the view', async () => {
      const result = await SubmitSearchService.go(requestQuery)

      expect(result).to.equal({
        activeNavBar: 'search',
        licences: null,
        noResults: true,
        page: 1,
        pageTitle: 'Search',
        query: 'searchthis',
        showResults: true
      })
    })
  })

  describe('when called without a query', () => {
    beforeEach(() => {
      requestQuery = {}
    })

    it('returns an error message', async () => {
      const result = await SubmitSearchService.go(requestQuery)

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
      requestQuery = { query: '' }
    })

    it('returns an error message', async () => {
      const result = await SubmitSearchService.go(requestQuery)

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
      requestQuery = { query: ' ' }
    })

    it('returns an error message', async () => {
      const result = await SubmitSearchService.go(requestQuery)

      expect(result).to.equal({
        activeNavBar: 'search',
        error: EXPECTED_ERROR,
        pageTitle: 'Search',
        query: ' '
      })
    })
  })
})
