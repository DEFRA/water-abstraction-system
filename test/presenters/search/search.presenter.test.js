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

  describe('when provided with a query', () => {
    beforeEach(() => {
      query = 'searchthis'
    })

    it('correctly returns the query', () => {
      const result = SearchPresenter.go(query)

      expect(result).to.equal({
        pageTitle: 'Search',
        query: 'searchthis'
      })
    })
  })

  describe('when no query is provided', () => {
    beforeEach(() => {
      query = undefined
    })

    it('returns an empty query string', () => {
      const result = SearchPresenter.go(query)

      expect(result).to.equal({
        pageTitle: 'Search',
        query: ''
      })
    })
  })
})
