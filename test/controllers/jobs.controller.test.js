'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const ExportService = require('../../app/services/jobs/export/export.service.js')
const ProcessLicenceUpdatesService = require('../../app/services/jobs/licence-updates/process-licence-updates.js')
const ProcessSessionStorageCleanupService = require('../../app/services/jobs/session-cleanup/process-session-storage-cleanup.service.js')
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
    describe('POST', () => {
      beforeEach(() => {
        options = { method: 'POST', url: '/jobs/export' }
      })

      describe('when the request succeeds', () => {
        beforeEach(async () => {
          Sinon.stub(ExportService, 'go').resolves()
        })

        it('returns a 204 response', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(204)
        })
      })
    })
  })

  describe('/jobs/licence-updates', () => {
    describe('POST', () => {
      beforeEach(() => {
        options = { method: 'POST', url: '/jobs/licence-updates' }
      })

      describe('when the request succeeds', () => {
        beforeEach(async () => {
          Sinon.stub(ProcessLicenceUpdatesService, 'go').resolves()
        })

        it('returns a 204 response', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(204)
        })
      })
    })
  })

  describe('/jobs/session-cleanup', () => {
    describe('POST', () => {
      beforeEach(() => {
        options = { method: 'POST', url: '/jobs/session-cleanup' }
      })

      describe('when the request succeeds', () => {
        beforeEach(async () => {
          Sinon.stub(ProcessSessionStorageCleanupService, 'go').resolves()
        })

        it('returns a 204 response', async () => {
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

        it('returns a 204 response', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(204)
        })
      })
    })
  })
})
