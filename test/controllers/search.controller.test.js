// Test helpers
import http2 from 'node:http2'
import { postRequestOptions } from '../support/general.js'

// Things we need to stub
import * as SubmitSearchService from '../../app/services/search/submit-search.service.js'
import * as ViewSearchService from '../../app/services/search/view-search.service.js'

// For running our service
import { init } from '../../app/server.js'

const { HTTP_STATUS_FOUND, HTTP_STATUS_OK } = http2.constants

describe('Search controller', () => {
  let server

  // Create server before running the tests
  beforeAll(async () => {
    server = await init()
  })

  beforeEach(async () => {
    // We silence any calls to server.logger.error made in the plugin to try and keep the test output as clean as
    // possible
    vi.spyOn(server.logger, 'error').mockImplementation(() => {})

    // We silence sending a notification to our Errbit instance using Airbrake
    vi.spyOn(server.app.airbrake, 'notify').mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
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
            vi.spyOn(ViewSearchService, 'default').mockResolvedValue({
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
            vi.spyOn(ViewSearchService, 'default').mockResolvedValue({
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

          vi.spyOn(SubmitSearchService, 'default').mockResolvedValue({ redirect: '/system/search?page=1' })
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

          vi.spyOn(SubmitSearchService, 'default').mockResolvedValue({
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
