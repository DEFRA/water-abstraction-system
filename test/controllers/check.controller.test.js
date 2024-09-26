'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

const ProcessLicenceReturnLogsService = require('../../app/services/jobs/return-logs/process-licence-return-logs.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Jobs controller', () => {
  let options
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

  describe('/check/licence-return-logs', () => {
    describe('when the request succeeds', () => {
      describe('POST', () => {
        beforeEach(() => {
          options = {
            method: 'POST',
            url: '/check/licence-return-logs',
            payload: {
              licenceReference: 'abc123'
            }
          }
          Sinon.stub(ProcessLicenceReturnLogsService, 'go').resolves()
        })

        it('returns a 204 response', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(204)
        })
      })
    })

    describe('when the request does not have a licence reference', () => {
      describe('POST', () => {
        beforeEach(() => {
          options = {
            method: 'POST',
            url: '/check/licence-return-logs',
            payload: {}
          }
        })

        it('returns a 404 response', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(404)
        })
      })
    })
  })
})
