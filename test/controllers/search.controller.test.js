'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { postRequestOptions } = require('../support/general.js')

// Things we need to stub
const SubmitSearchService = require('../../app/services/search/submit-search.service.js')
const ViewSearchService = require('../../app/services/search/view-search.service.js')
const ViewSearchResultsService = require('../../app/services/search/view-search-results.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Search controller', () => {
  let server

  // Create server before running the tests
  before(async () => {
    server = await init()
  })

  beforeEach(async () => {
    // We silence any calls to server.logger.error made in the plugin to try and keep the test output as clean as
    // possible
    Sinon.stub(server.logger, 'error')

    // We silence sending a notification to our Errbit instance using Airbrake
    Sinon.stub(server.app.airbrake, 'notify').resolvesThis()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('/search', () => {
    describe('GET', () => {
      let getOptions

      beforeEach(async () => {
        getOptions = _getOptions()
      })

      describe('when the request succeeds', () => {
        describe('and provides the search page', () => {
          beforeEach(async () => {
            Sinon.stub(ViewSearchService, 'go').resolves({
              activeNavBar: 'search',
              pageTitle: 'Search'
            })
          })

          it('returns the page successfully', async () => {
            const response = await server.inject(getOptions)

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('Search')
          })
        })

        describe('and results in a redirect', () => {
          beforeEach(async () => {
            getOptions.url = '/search?page=1'
            Sinon.stub(ViewSearchResultsService, 'go').resolves({ redirect: '/system/licences/licence-1/summary' })
          })

          it('redirects to the appropriate location', async () => {
            const response = await server.inject(getOptions)

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/licences/licence-1/summary')
          })
        })

        describe('and shows search results', () => {
          beforeEach(async () => {
            getOptions.url = '/search?page=1'
            Sinon.stub(ViewSearchResultsService, 'go').resolves({
              activeNavBar: 'search',
              pageTitle: 'Search results (page 1 of 2)',
              pagination: { numberOfPages: 2 },
              query: 'searchthis',
              showResults: true,
              noResults: false,
              licences: []
            })
          })

          it('returns the page successfully', async () => {
            const response = await server.inject(getOptions)

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('Search results (page 1 of 2)')
          })
        })
      })
    })

    describe('POST', () => {
      let postOptions

      beforeEach(async () => {
        postOptions = _postOptions()
      })

      describe('when the request succeeds', () => {
        beforeEach(async () => {
          postOptions.payload.query = 'searchthis'

          Sinon.stub(SubmitSearchService, 'go').resolves({})
        })

        it('redirects to the first page of results', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal('/system/search?page=1')
        })
      })

      describe('when the request fails', () => {
        beforeEach(async () => {
          postOptions.payload.query = ''

          Sinon.stub(SubmitSearchService, 'go').resolves({
            activeNavBar: 'search',
            error: {
              errorList: [
                {
                  href: '#$query',
                  text: 'Query error'
                }
              ],
              query: 'Query error'
            },
            pageTitle: 'Search'
          })
        })

        it('returns the page with an error message', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('There is a problem')
          expect(response.payload).to.contain('Query error')
        })
      })
    })
  })
})

function _getOptions() {
  return {
    method: 'GET',
    url: '/search',
    auth: {
      strategy: 'session',
      credentials: { scope: [], user: { id: 1000 } }
    }
  }
}

function _postOptions() {
  return postRequestOptions('/search?page=1', {}, [])
}
