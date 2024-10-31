'use strict'

// Test framework dependencies

const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = Code

// Test helpers
const { postRequestOptions } = require('../support/general.js')

// Things we need to stub
const LoadService = require('../../app/services/data/load/load.service.js')
const SeedService = require('../../app/services/data/seed/seed.service.js')
const SubmitDeduplicateService = require('../../app/services/data/deduplicate/submit-deduplicate.service.js')
const TearDownService = require('../../app/services/data/tear-down/tear-down.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Data controller', () => {
  let server

  beforeEach(async () => {
    // Create server before each test
    server = await init()

    // We silence any calls to server.logger.error made in the plugin to try and keep the test output as clean as
    // possible
    Sinon.stub(server.logger, 'error')

    // We silence sending a notification to our Errbit instance using Airbrake
    Sinon.stub(server.app.airbrake, 'notify').resolvesThis()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('/data/deduplicate', () => {
    const auth = {
      strategy: 'session',
      credentials: { scope: ['billing'] }
    }

    let options

    describe('GET', () => {
      beforeEach(() => {
        options = {
          method: 'GET',
          url: '/data/deduplicate',
          auth
        }
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('De-duplicate a licence')
        })
      })
    })

    describe('POST', () => {
      const licenceRef = '01/120'

      describe('when a request is valid', () => {
        beforeEach(async () => {
          options = postRequestOptions('/data/deduplicate', { 'licence-ref': licenceRef })

          Sinon.stub(SubmitDeduplicateService, 'go').resolves({ licenceRef })
        })

        it('redirects to the search page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal(`/licences?query=${licenceRef}`)
        })
      })

      describe('when a request is invalid', () => {
        beforeEach(async () => {
          options = postRequestOptions('/data/deduplicate')

          Sinon.stub(SubmitDeduplicateService, 'go').resolves({
            error: { text: 'Enter a licence reference to de-dupe' }
          })
        })

        it('re-renders the page with an error message', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('There is a problem')
          expect(response.payload).to.contain('Enter a licence reference to de-dupe')
        })
      })
    })
  })

  describe('/data/load', () => {
    describe('POST', () => {
      const options = {
        method: 'POST',
        url: '/data/load'
      }

      describe('when the request succeeds', () => {
        beforeEach(async () => {
          Sinon.stub(LoadService, 'go').resolves({
            regions: ['d0a4123d-1e19-480d-9dd4-f70f3387c4b9']
          })
        })

        it('returns a 200 status and the results', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.equal('{"regions":["d0a4123d-1e19-480d-9dd4-f70f3387c4b9"]}')
        })
      })

      describe('when the request fails', () => {
        describe('because the LoadService errors', () => {
          beforeEach(async () => {
            Sinon.stub(LoadService, 'go').rejects()
          })

          it('returns a 500 status', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).to.equal(500)
          })
        })
      })
    })
  })

  describe('/data/seed', () => {
    describe('POST', () => {
      const options = {
        method: 'POST',
        url: '/data/seed'
      }

      describe('when the request succeeds', () => {
        beforeEach(async () => {
          Sinon.stub(SeedService, 'go').resolves()
        })

        it('displays the correct message', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(204)
        })
      })

      describe('when the request fails', () => {
        describe('because the SeedService errors', () => {
          beforeEach(async () => {
            Sinon.stub(SeedService, 'go').rejects()
          })

          it('returns a 500 status', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).to.equal(500)
          })
        })
      })
    })
  })

  describe('/data/tear-down', () => {
    describe('POST', () => {
      const options = {
        method: 'POST',
        url: '/data/tear-down'
      }

      describe('when the request succeeds', () => {
        beforeEach(async () => {
          Sinon.stub(TearDownService, 'go').resolves()
        })

        it('returns a 204 status', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(204)
        })
      })

      describe('when the request fails', () => {
        describe('because the TearDownService errors', () => {
          beforeEach(async () => {
            Sinon.stub(TearDownService, 'go').rejects()
          })

          it('returns a 500 status', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).to.equal(500)
          })
        })
      })
    })
  })
})
