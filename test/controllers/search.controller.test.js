'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const { HTTP_STATUS_FOUND, HTTP_STATUS_OK } = require('node:http2').constants
const { postRequestOptions } = require('../support/general.js')

// Things we need to stub
const SubmitSearchService = require('../../app/services/search/submit-search.service.js')
const ViewSearchService = require('../../app/services/search/view-search.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Search controller', () => {
  let server

  // Create server before running the tests
  beforeAll(async () => {
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

  afterAll(async () => {
    await server.stop()
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
              pageTitle: 'Search'
            })
          })

          it('returns the page successfully', async () => {
            const response = await server.inject(getOptions)

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('Search')
          })
        })

        describe('and shows search results', () => {
          beforeEach(async () => {
            getOptions.url = '/search?page=1'
            Sinon.stub(ViewSearchService, 'go').resolves({
              pageTitle: 'Search results for "searchthis"',
              pagination: { currentPageNumber: 1, numberOfPages: 2, showingMessage: 'Showing all 2 matches' },
              query: 'searchthis',
              showResults: true,
              noResults: false,
              allSearchMatches: { results: [], total: 2 }
            })
          })

          it('returns the page successfully', async () => {
            const response = await server.inject(getOptions)

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('Search results for &quot;searchthis&quot;')
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

          Sinon.stub(SubmitSearchService, 'go').resolves({ redirect: '/system/search?page=1' })
        })

        it('redirects to the first page of results', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual('/system/search?page=1')
        })
      })

      describe('when the request fails', () => {
        beforeEach(async () => {
          postOptions.payload.query = ''

          Sinon.stub(SubmitSearchService, 'go').resolves({
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

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('There is a problem')
          expect(response.payload).toContain('Query error')
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
