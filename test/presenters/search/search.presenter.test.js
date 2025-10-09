'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const SearchPresenter = require('../../../app/presenters/search/search.presenter.js')

describe('Search - Search presenter', () => {
  let query
  let page
  let licences

  describe('when provided with a valid query that returns results', () => {
    beforeEach(() => {
      query = 'searchthis'
      page = 1
      licences = [
        {
          $ends: () => {
            return null
          },
          id: 'licence-1',
          licenceRef: '01/123',
          metadata: {
            Forename: 'Forename',
            Initials: 'F',
            Name: 'Surname',
            Salutation: 'Mr'
          },
          startDate: new Date('2020-01-01')
        }
      ]
    })

    it('correctly displays the results', () => {
      const result = SearchPresenter.go(query, page, licences)

      expect(result).to.equal({
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

  describe('when provided with a query but there are no results', () => {
    beforeEach(() => {
      query = 'searchthis'
      page = 1
      licences = undefined
    })

    it('reports that there are no results', () => {
      const result = SearchPresenter.go(query, page, licences)

      expect(result).to.equal({
        licences: undefined,
        noResults: true,
        page: 1,
        pageTitle: 'Search',
        query: 'searchthis',
        showResults: true
      })
    })
  })
})
