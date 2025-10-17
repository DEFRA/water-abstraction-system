'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const SearchPresenter = require('../../../app/presenters/search/search.presenter.js')

describe('Search - Search presenter', () => {
  let licences
  let numberOfPages
  let page
  let query
  let returnLogs

  describe('when provided with a valid query that returns results', () => {
    beforeEach(() => {
      query = 'searchthis'
      numberOfPages = 1
      page = 1

      licences = [
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
        }
      ]

      returnLogs = [
        {
          id: 'v1:1:1/2/3:1:2000-01-01:2000-12-31',
          licenceRef: '01/123',
          returnReference: '123',
          region: 'Region',
          regionId: 1,
          status: 'completed'
        }
      ]
    })

    it('correctly displays the results', () => {
      const result = SearchPresenter.go(query, page, numberOfPages, licences, returnLogs)

      expect(result).to.equal({
        licences: [
          {
            id: 'licence-1',
            licenceEndDate: undefined,
            licenceEndedText: undefined,
            licenceHolderName: 'Mr F Surname',
            licenceRef: '01/123'
          }
        ],
        noResults: false,
        page: 1,
        pageTitle: 'Search results',
        query: 'searchthis',
        returnLogs: [
          {
            id: 'v1:1:1/2/3:1:2000-01-01:2000-12-31',
            licenceRef: '01/123',
            returnReference: '123',
            region: 'Region',
            statusText: 'complete'
          }
        ],
        showResults: true
      })
    })
  })

  describe('when provided with a query but there are no results', () => {
    beforeEach(() => {
      query = 'searchthis'
      numberOfPages = 1
      page = 1

      licences = null
      returnLogs = null
    })

    it('reports that there are no results', () => {
      const result = SearchPresenter.go(query, page, numberOfPages, licences, returnLogs)

      expect(result).to.equal({
        licences: null,
        noResults: true,
        page: 1,
        pageTitle: 'Search results',
        query: 'searchthis',
        returnLogs: null,
        showResults: true
      })
    })
  })

  describe('when showing the blank search page', () => {
    beforeEach(() => {
      query = 'searchthis'
      numberOfPages = 1
      page = 1

      licences = null
      returnLogs = null
    })

    it('provides a title without results', () => {
      const result = SearchPresenter.go()

      expect(result).to.equal({
        pageTitle: 'Search',
        query: undefined
      })
    })
  })

  describe('when showing the search page with an error', () => {
    beforeEach(() => {
      query = 'searchthis'
    })

    it('provides just the title and the user-entered query', () => {
      const result = SearchPresenter.go(query)

      expect(result).to.equal({
        pageTitle: 'Search',
        query: 'searchthis'
      })
    })
  })

  describe('when provided with a licence with an end date in the past', () => {
    beforeEach(() => {
      query = 'searchthis'
      numberOfPages = 1
      page = 1

      licences = [
        {
          $ends: () => {
            return {
              date: new Date('2020-12-31'),
              reason: 'expired'
            }
          },
          metadata: {}
        }
      ]

      returnLogs = null
    })

    it('displays the status and the end date', () => {
      const result = SearchPresenter.go(query, page, numberOfPages, licences, returnLogs)

      expect(result.licences[0].licenceEndDate).to.equal('31 December 2020')
      expect(result.licences[0].licenceEndedText).to.equal('expired')
    })
  })

  describe('when provided with a licence with an end date in the future', () => {
    beforeEach(() => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      query = 'searchthis'
      numberOfPages = 1
      page = 1

      licences = [
        {
          $ends: () => {
            return {
              date: tomorrow,
              reason: 'revoked'
            }
          },
          metadata: {}
        }
      ]

      returnLogs = null
    })

    it('displays the end date but not the status', () => {
      const result = SearchPresenter.go(query, page, numberOfPages, licences, returnLogs)

      expect(result.licences[0].licenceEndDate).to.exist()
      expect(result.licences[0].licenceEndedText).to.not.exist()
    })
  })

  describe('when provided with multiple pages of results', () => {
    beforeEach(() => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      query = 'searchthis'
      numberOfPages = 6
      page = 2

      licences = [
        {
          $ends: () => {
            return null
          },
          id: 'licence-1',
          metadata: {}
        }
      ]

      returnLogs = null
    })

    it('provides page information in the title', () => {
      const result = SearchPresenter.go(query, page, numberOfPages, licences, returnLogs)

      expect(result.pageTitle).to.equal('Search results (page 2 of 6)')
    })
  })
})
