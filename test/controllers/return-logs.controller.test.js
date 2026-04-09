'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { HTTP_STATUS_FOUND, HTTP_STATUS_OK } = require('node:http2').constants
const { postRequestOptions } = require('../support/general.js')

// Things we need to stub
const DownloadReturnLogService = require('../../app/services/return-logs/download-return-log.service.js')
const SubmitDetailsService = require('../../app/services/return-logs/submit-details.service.js')
const ViewCommunicationsService = require('../../app/services/return-logs/view-communications.service.js')
const ViewDetailsService = require('../../app/services/return-logs/view-details.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Return Logs controller', () => {
  const returnLogId = '168026d8-f29b-4165-8726-734c6b14adec'
  let getOptions
  let postOptions
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

  describe('/system/return-logs/{id}/communications', () => {
    describe('GET', () => {
      beforeEach(() => {
        getOptions = {
          method: 'GET',
          url: `/return-logs/${returnLogId}/communications`,
          auth: {
            strategy: 'session',
            credentials: { scope: ['billing'] }
          }
        }

        Sinon.stub(ViewCommunicationsService, 'go').resolves({ pageTitle: 'Communications' })
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(getOptions)

        expect(response.statusCode).to.equal(HTTP_STATUS_OK)
        expect(response.payload).to.contain('Communications')
      })
    })
  })

  describe('/system/return-logs/{id}/details', () => {
    describe('GET', () => {
      beforeEach(() => {
        getOptions = {
          method: 'GET',
          url: `/return-logs/${returnLogId}/details`,
          auth: {
            strategy: 'session',
            credentials: { scope: ['billing'] }
          }
        }

        Sinon.stub(ViewDetailsService, 'go').resolves({ pageTitle: 'Return details' })
      })

      describe('and no version is passed as a query parameter', () => {
        it('passes 0 to the service and returns the page successfully', async () => {
          const response = await server.inject(getOptions)

          const calls = ViewDetailsService.go.firstCall

          expect(calls.args).to.contain(0)

          expect(response.statusCode).to.equal(HTTP_STATUS_OK)
          expect(response.payload).to.contain('Return details')
        })
      })

      describe('and a version is passed as a query parameter', () => {
        beforeEach(() => {
          getOptions.url += '?version=1'
        })

        it('passes the version to the service and returns the page successfully', async () => {
          const response = await server.inject(getOptions)

          const calls = ViewDetailsService.go.firstCall

          expect(calls.args).to.contain(1)

          expect(response.statusCode).to.equal(HTTP_STATUS_OK)
          expect(response.payload).to.contain('Return details')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        beforeEach(() => {
          postOptions = postRequestOptions(`/return-logs/${returnLogId}/details`, null)

          Sinon.stub(SubmitDetailsService, 'go').resolves()
        })

        it('redirects back to the "return details" page', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).to.equal(HTTP_STATUS_FOUND)
          expect(response.headers.location).to.equal(`/system/return-logs/${returnLogId}/details`)
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
          url: `/return-logs/${returnLogId}/download?version=1`,
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

          expect(response.statusCode).to.equal(HTTP_STATUS_OK)
          expect(response.headers['content-type']).to.equal('type/csv')
          expect(response.headers['content-disposition']).to.equal('attachment; filename="test.csv"')
          expect(response.payload).to.equal('test')
        })
      })
    })
  })
})
