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
const DownloadReturnLogService = require('../../app/services/return-logs/download-return-log.service.js')
const SubmitViewReturnLogService = require('../../app/services/return-logs/submit-view-return-log.service.js')
const ViewReturnLogService = require('../../app/services/return-logs/view-return-log.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Return Logs controller', () => {
  let server

  // Create server before running the tests
  before(async () => {
    server = await init()
  })

  beforeEach(() => {
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
      beforeEach(() => {
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
            await server.inject(_getOptions(1))

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
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        beforeEach(() => {
          Sinon.stub(SubmitViewReturnLogService, 'go').resolves()
        })

        it('redirects back to the "view return log" page', async () => {
          const response = await server.inject(_postOptions())

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal('/system/return-logs/RETURN_ID')
        })
      })
    })
  })

  describe('/system/return-logs/download', () => {
    describe('GET', () => {
      let getOptions

      beforeEach(() => {
        getOptions = {
          method: 'GET',
          url: `/return-logs/RETURN_ID/download?version=1`,
          auth: {
            strategy: 'session',
            credentials: { scope: ['billing'] }
          }
        }
      })

      describe('when a request is valid', () => {
        beforeEach(() => {
          Sinon.stub(DownloadReturnLogService, 'go').returns({ data: 'test', type: 'type/csv', filename: 'test.csv' })
        })

        it('returns the file successfully', async () => {
          const response = await server.inject(getOptions)

          expect(response.statusCode).to.equal(200)
          expect(response.headers['content-type']).to.equal('type/csv')
          expect(response.headers['content-disposition']).to.equal('attachment; filename="test.csv"')
          expect(response.payload).to.equal('test')
        })
      })
    })
  })
})

function _getOptions(version) {
  const url = _url(version)

  return {
    method: 'GET',
    url: `${url.pathname}${url.search}`,
    auth: {
      strategy: 'session',
      credentials: { scope: ['billing'] }
    }
  }
}

function _postOptions(payload) {
  const url = _url()

  return postRequestOptions(url.pathname, payload)
}

function _url(version) {
  const url = new URL('/return-logs/RETURN_ID', 'http://example.com')

  if (version) {
    url.searchParams.append('version', version)
  }

  return url
}
