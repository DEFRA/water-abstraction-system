'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const ExportService = require('../../app/services/jobs/export/export.service.js')
const ProcessTimeLimitedLicencesService = require('../../app/services/jobs/time-limited/process-time-limited-licences.service.js')

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

  describe('/jobs/export', () => {
    describe('GET', () => {
      beforeEach(() => {
        options = { method: 'GET', url: '/jobs/export' }
      })

      describe('when the request succeeds', () => {
        beforeEach(async () => {
          Sinon.stub(ExportService, 'go').resolves()
        })

        it('displays the correct message', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(204)
        })
      })
    })
  })

  describe('/jobs/time-limited', () => {
    describe('POST', () => {
      beforeEach(() => {
        options = { method: 'POST', url: '/jobs/time-limited' }
      })

      describe('when the request succeeds', () => {
        beforeEach(async () => {
          Sinon.stub(ProcessTimeLimitedLicencesService, 'go').resolves()
        })

        it('displays the correct message', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(204)
        })
      })
    })
  })
})
