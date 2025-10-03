'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const QuerySearchService = require('../../app/services/search/submit-search.service.js')
const ViewSearchService = require('../../app/services/search/view-search.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Search - Search controller', () => {
  let server
  let getOptions

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

    getOptions = _getOptions()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('/search', () => {
    describe('GET', () => {
      describe('when the request succeeds', () => {
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

      describe('when the request is an empty query', () => {
        beforeEach(async () => {
          getOptions.url = '/search?query='
          Sinon.stub(QuerySearchService, 'go').resolves({
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
          const response = await server.inject(getOptions)

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
