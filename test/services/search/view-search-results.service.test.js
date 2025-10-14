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
const ViewSearchResultsService = require('../../../app/services/search/view-search-results.service.js')

describe('Search - View search results service', () => {
  let page
  let queryResults
  let searchQuery

  async function returnResults() {
    return queryResults
  }

  beforeEach(() => {
    Sinon.stub(LicenceModel, 'query').returns({
      select: Sinon.stub().returnsThis(),
      joinRelated: Sinon.stub().returnsThis(),
      orderBy: Sinon.stub().returnsThis(),
      orWhere: Sinon.stub().returnsThis(),
      page: Sinon.stub().callsFake(returnResults),
      where: Sinon.stub().returnsThis()
    })

    page = 1
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    beforeEach(() => {
      searchQuery = 'searchthis'

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
            }
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
            }
          }
        ],
        total: 2
      }
    })

    it('returns page data for the view', async () => {
      const result = await ViewSearchResultsService.go(searchQuery, page)

      expect(result).to.equal({
        activeNavBar: 'search',
        licences: [
          {
            id: 'licence-1',
            licenceEndDate: undefined,
            licenceEndedText: undefined,
            licenceHolderName: 'Mr F Surname',
            licenceRef: '01/123'
          },
          {
            id: 'licence-2',
            licenceEndDate: undefined,
            licenceEndedText: undefined,
            licenceHolderName: 'Mr F Surname',
            licenceRef: '45/678'
          }
        ],
        noResults: false,
        page: 1,
        pageTitle: 'Search results',
        pagination: {
          numberOfPages: 1
        },
        query: 'searchthis',
        showResults: true
      })
    })
  })

  describe('when called with a query that returns no results', () => {
    beforeEach(() => {
      searchQuery = 'searchthis'

      queryResults = {
        results: [],
        total: 0
      }
    })

    it('returns page data showing that there are no results', async () => {
      const result = await ViewSearchResultsService.go(searchQuery, page)

      expect(result).to.equal({
        activeNavBar: 'search',
        licences: null,
        noResults: true,
        page: 1,
        pageTitle: 'Search results',
        pagination: {
          numberOfPages: 0
        },
        query: 'searchthis',
        showResults: true
      })
    })
  })

  describe('when called with a query that returns a single result', () => {
    beforeEach(() => {
      queryResults = {
        results: [
          {
            $ends: () => {
              return null
            },
            id: 'licence-1',
            licenceRef: 'this-is-the-licence-you-are-looking-for',
            metadata: {
              Initials: 'F',
              Name: 'Surname',
              Salutation: 'Mr'
            }
          }
        ],
        total: 1
      }
    })

    describe('but the search term does not exactly match the licence number', () => {
      beforeEach(() => {
        searchQuery = 'not-the-licence-you-are-looking-for'
      })

      it('returns page data in the normal way without a redirect', async () => {
        const result = await ViewSearchResultsService.go(searchQuery, page)

        expect(result.redirect).to.not.exist()
      })
    })

    describe('and the search term exactly matches the licence number', () => {
      beforeEach(() => {
        searchQuery = 'this-is-the-licence-you-are-looking-for'
      })

      it('returns a redirect link to the licence details page', async () => {
        const result = await ViewSearchResultsService.go(searchQuery, page)

        expect(result).to.equal({ redirect: '/system/licences/licence-1/summary' })
      })
    })
  })
})
