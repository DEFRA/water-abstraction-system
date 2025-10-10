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
  let queryResults

  async function returnResults() {
    return queryResults
  }

  beforeEach(async () => {
    Sinon.stub(LicenceModel, 'query').returns({
      select: Sinon.stub().returnsThis(),
      joinRelated: Sinon.stub().returnsThis(),
      orderBy: Sinon.stub().returnsThis(),
      orWhere: Sinon.stub().returnsThis(),
      page: Sinon.stub().callsFake(returnResults),
      where: Sinon.stub().returnsThis()
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called with a query', () => {
    beforeEach(() => {
      requestQuery = { query: 'searchthis' }

      queryResults = {
        results: [
          {
            $ends: () => {
              return null
            },
            id: 'licence-1',
            licenceRef: '01/123',
            metadata: {
              Initials: 'F',
              Name: 'Surname',
              Salutation: 'Mr'
            },
            startDate: new Date('2020-01-01')
          },
          {
            $ends: () => {
              return null
            },
            id: 'licence-2',
            licenceRef: '45/678',
            metadata: {
              Initials: 'F',
              Name: 'Surname',
              Salutation: 'Mr'
            },
            startDate: new Date('2020-01-01')
          }
        ],
        total: 2
      }
    })

    it('returns page data for the view', async () => {
      const result = await SubmitSearchService.go(requestQuery)

      expect(result).to.equal({
        activeNavBar: 'search',
        licences: [
          {
            id: 'licence-1',
            licenceEndedText: undefined,
            licenceHolderName: 'Mr F Surname',
            licenceRef: '01/123'
          },
          {
            id: 'licence-2',
            licenceEndedText: undefined,
            licenceHolderName: 'Mr F Surname',
            licenceRef: '45/678'
          }
        ],
        noResults: false,
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

  describe('when called with a query that returns no results', () => {
    beforeEach(() => {
      requestQuery = { query: 'searchthis' }

      queryResults = {
        results: [],
        total: 0
      }
    })

    it('returns page data showing that there are no results', async () => {
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

  describe('when called with a query that returns a single result but the search term does not exactly match the licence number', () => {
    beforeEach(() => {
      requestQuery = { query: 'searchthis' }

      queryResults = {
        results: [
          {
            $ends: () => {
              return null
            },
            id: 'licence-1',
            licenceRef: '01/123',
            metadata: {
              Initials: 'F',
              Name: 'Surname',
              Salutation: 'Mr'
            },
            startDate: new Date('2020-01-01')
          }
        ],
        total: 1
      }
    })

    it('returns page data to show the search results in the normal way', async () => {
      const result = await SubmitSearchService.go(requestQuery)

      expect(result).to.equal({
        activeNavBar: 'search',
        licences: [
          {
            id: 'licence-1',
            licenceEndedText: undefined,
            licenceHolderName: 'Mr F Surname',
            licenceRef: '01/123'
          }
        ],
        noResults: false,
        page: 1,
        pageTitle: 'Search',
        query: 'searchthis',
        showResults: true
      })
    })
  })

  describe('when called with a query that returns a single result and the search term exactly matches the licence number', () => {
    beforeEach(() => {
      requestQuery = { query: '01/123' }

      queryResults = {
        results: [
          {
            $ends: () => {
              return null
            },
            id: 'licence-1',
            licenceRef: '01/123',
            metadata: {
              Initials: 'F',
              Name: 'Surname',
              Salutation: 'Mr'
            },
            startDate: new Date('2020-01-01')
          }
        ],
        total: 1
      }
    })

    it('returns a redirect link to the licence details page', async () => {
      const result = await SubmitSearchService.go(requestQuery)

      expect(result).to.equal({ redirect: '/system/licences/licence-1/summary' })
    })
  })
})
