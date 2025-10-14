'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

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

  describe('when called with a query', () => {
    beforeEach(() => {
      payload = { query: 'searchthis' }
    })

    it('sets the session value', async () => {
      await SubmitSearchService.go(payload, yar)

      expect(yarSpy.calledOnceWithExactly('searchQuery', 'searchthis')).to.be.true()
    })
  })

  describe('when called without a query', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns an error message', async () => {
      const result = await SubmitSearchService.go(payload, yar)

      expect(result).to.equal({
        activeNavBar: 'search',
        error: EXPECTED_ERROR,
        pageTitle: 'Search',
        query: ''
      })

      expect(yarSpy.called).to.be.false()
    })
  })

  describe('when called with a blank query', () => {
    beforeEach(() => {
      payload = { query: '' }
    })

    it('returns an error message', async () => {
      const result = await SubmitSearchService.go(payload, yar)

      expect(result).to.equal({
        activeNavBar: 'search',
        error: EXPECTED_ERROR,
        pageTitle: 'Search',
        query: ''
      })

      expect(yarSpy.called).to.be.false()
    })
  })

  describe('when called with a whitespace query', () => {
    beforeEach(() => {
      payload = { query: ' ' }
    })

    it('returns an error message', async () => {
      const result = await SubmitSearchService.go(payload, yar)

      expect(result).to.equal({
        activeNavBar: 'search',
        error: EXPECTED_ERROR,
        pageTitle: 'Search',
        query: ' '
      })

      expect(yarSpy.called).to.be.false()
    })
  })
})
