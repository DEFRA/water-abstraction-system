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

  describe('when provided with a query', () => {
    beforeEach(() => {
      query = 'searchthis'
      page = 1
    })

    it('correctly returns the results', () => {
      const result = SearchPresenter.go(query, page)

      expect(result).to.equal({
        licences: undefined,
        page: 1,
        pageTitle: 'Search',
        query: 'searchthis'
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
})
