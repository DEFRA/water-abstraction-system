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
  let auth
  let payload
  let yar
  let yarSpy

  beforeEach(() => {
    auth = {
      credentials: {
        scope: ['billing']
      }
    }

    yarSpy = Sinon.spy()
    yar = { set: yarSpy }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called with a valid query', () => {
    beforeEach(() => {
      payload = { query: 'searchthis', resultType: 'monitoringStation' }
    })

    it('sets the session value and returns a redirect to the search results page', async () => {
      const result = await SubmitSearchService.go(auth, payload, yar)

      expect(yarSpy.calledWithExactly('searchQuery', 'searchthis')).to.be.true()
      expect(yarSpy.calledWithExactly('searchResultType', 'monitoringStation')).to.be.true()
      expect(result).to.equal({ redirect: '/system/search?page=1' })
    })
  })

  describe('when called without a valid query', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns an error message', async () => {
      const result = await SubmitSearchService.go(auth, payload, yar)

      expect(result).to.equal({
        activeNavBar: 'search',
        filterItems: [
          {
            checked: false,
            text: 'Billing accounts',
            value: 'billingAccount'
          },
          {
            checked: false,
            text: 'Licence holders',
            value: 'licenceHolder'
          },
          {
            checked: false,
            text: 'Licences',
            value: 'licence'
          },
          {
            checked: false,
            text: 'Monitoring stations',
            value: 'monitoringStation'
          },
          {
            checked: false,
            text: 'Return logs',
            value: 'returnLog'
          },
          {
            checked: false,
            text: 'Users',
            value: 'user'
          }
        ],
        error: EXPECTED_ERROR,
        pageTitle: 'Search',
        query: undefined,
        resultType: undefined,
        showResults: false
      })

      expect(yarSpy.called).to.be.false()
    })
  })

  describe('when called called to clear the filter', () => {
    beforeEach(() => {
      payload = { query: 'searchthis', resultType: 'monitoringStation', clearFilter: 'reset' }
    })

    it('sets the session value and returns a redirect to the search results page', async () => {
      const result = await SubmitSearchService.go(auth, payload, yar)

      expect(yarSpy.calledWithExactly('searchQuery', 'searchthis')).to.be.true()
      expect(yarSpy.calledWithExactly('searchResultType', 'all')).to.be.true()
      expect(result).to.equal({ redirect: '/system/search?page=1' })
    })
  })
})
