'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const ViewReturnLogService = require('../../app/services/return-logs/view-return-log.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Return Logs controller', () => {
  let server

  // Create server before running the tests
  before(async () => {
    server = await init()
  })

  beforeEach(async () => {
    // We silence any calls to server.logger.error and info to try and keep the test output as clean as possible
    Sinon.stub(server.logger, 'error')
    Sinon.stub(server.logger, 'info')

    // We silence sending a notification to our Errbit instance using Airbrake
    Sinon.stub(server.app.airbrake, 'notify').resolvesThis()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('/system/return-logs', () => {
    describe('GET', () => {
      beforeEach(async () => {
        Sinon.stub(ViewReturnLogService, 'go').resolves({
          pageTitle: 'Abstraction return'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions())

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Abstraction return')
        })

        describe('and a version is passed as a query parameter', () => {
          it('passes the version to the service', async () => {
            await server.inject(_getOptions(true, 1))

            const calls = ViewReturnLogService.go.firstCall

            expect(calls.args).to.contain(1)
          })
        })

        describe('and no version is passed as a query parameter', () => {
          it('passes 0 to the service', async () => {
            await server.inject(_getOptions())

            const calls = ViewReturnLogService.go.firstCall

            expect(calls.args).to.contain(0)
          })
        })
      })

      describe('when the request fails', () => {
        describe('because no id was passed', () => {
          it('returns an error', async () => {
            const response = await server.inject(_getOptions(false))

            expect(response.payload).to.contain('Sorry, there is a problem with the service')
          })
        })
      })
    })
  })
})

function _getOptions(id = true, version) {
  const url = new URL('/return-logs', 'http://example.com')

  if (id) {
    url.searchParams.append('id', 'RETURN_LOG_ID')
  }

  if (version) {
    url.searchParams.append('version', version)
  }

  return {
    method: 'GET',
    url: `${url.pathname}${url.search}`,
    auth: {
      strategy: 'session',
      credentials: { scope: ['billing'] }
    }
  }
}
