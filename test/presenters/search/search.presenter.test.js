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
    })

    it('correctly displays the results', () => {
      const result = SearchPresenter.go(query, page, numberOfPages, licences)

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
        showResults: true
      })
    })
  })

  describe('when no query is provided', () => {
    beforeEach(() => {
      query = undefined
      page = undefined
    })

    it('returns an empty query string', () => {
      const result = SearchPresenter.go(query, page)

      expect(result).to.equal({
        pageTitle: 'Search',
        query: ''
      })
    })
  })

  describe('when an unsearchable query, e.g. whitespace, is provided', () => {
    beforeEach(() => {
      query = ' '
      page = undefined
    })

    it('returns the original query text', () => {
      const result = SearchPresenter.go(query, page)

      expect(result).to.equal({
        pageTitle: 'Search',
        query: ' '
      })
    })
  })

  describe('when provided with a query but there are no results', () => {
    beforeEach(() => {
      query = 'searchthis'
      numberOfPages = 1
      page = 1
      licences = undefined
    })

    it('reports that there are no results', () => {
      const result = SearchPresenter.go(query, page, numberOfPages, licences)

      expect(result).to.equal({
        licences: undefined,
        noResults: true,
        page: 1,
        pageTitle: 'Search results',
        query: 'searchthis',
        showResults: true
      })
    })
  })

  describe('when provided with an end date in the past', () => {
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
    })

    it('displays the status and the end date', () => {
      const result = SearchPresenter.go(query, page, numberOfPages, licences)

      expect(result.licences[0].licenceEndDate).to.equal('31 December 2020')
      expect(result.licences[0].licenceEndedText).to.equal('expired in 2020')
    })
  })

  describe('when provided with an end date in the future', () => {
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
    })

    it('displays the end date but not the status', () => {
      const result = SearchPresenter.go(query, page, numberOfPages, licences)

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
    })

    it('provides page information in the title', () => {
      const result = SearchPresenter.go(query, page, numberOfPages, licences)

      expect(result.pageTitle).to.equal('Search results (page 2 of 6)')
    })
  })
})
