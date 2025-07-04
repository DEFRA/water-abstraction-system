'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const ExportService = require('../../app/services/jobs/export/export.service.js')
const ProcessLicenceUpdatesService = require('../../app/services/jobs/licence-updates/process-licence-updates.js')
const ProcessNotificationsStatusUpdatesServiceService = require('../../app/services/jobs/notifications/notifications-status-updates.service.js')
const ProcessReturnLogsService = require('../../app/services/jobs/return-logs/process-return-logs.service.js')
const ProcessCleanService = require('../../app/services/jobs/clean/process-clean.service.js')
const ProcessTimeLimitedLicencesService = require('../../app/services/jobs/time-limited/process-time-limited-licences.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Jobs controller', () => {
  let options
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

  describe('/jobs/clean', () => {
    describe('POST', () => {
      beforeEach(() => {
        options = { method: 'POST', url: '/jobs/clean' }
      })

      describe('when the request succeeds', () => {
        beforeEach(async () => {
          Sinon.stub(ProcessCleanService, 'go').resolves()
        })

        it('returns a 204 response', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(204)
        })
      })
    })
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

  describe('/jobs/notifications-status-updates', () => {
    describe('POST', () => {
      beforeEach(() => {
        options = { method: 'POST', url: '/jobs/notifications-status-updates' }
      })

      describe('when the request succeeds', () => {
        beforeEach(async () => {
          Sinon.stub(ProcessNotificationsStatusUpdatesServiceService, 'go').resolves()
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

  describe('/jobs/return-logs/{cycle}', () => {
    describe('when the requested cycle is summer', () => {
      describe('POST', () => {
        beforeEach(() => {
          options = { method: 'POST', url: '/jobs/return-logs/summer', payload: {} }
        })

        describe('when the request succeeds', () => {
          beforeEach(async () => {
            Sinon.stub(ProcessReturnLogsService, 'go').resolves()
          })

          it('returns a 204 response', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).to.equal(204)
          })
        })
      })
    })

    describe('when the requested cycle is all-year', () => {
      describe('POST', () => {
        beforeEach(() => {
          options = { method: 'POST', url: '/jobs/return-logs/all-year' }
        })

        describe('when the request succeeds', () => {
          beforeEach(async () => {
            Sinon.stub(ProcessReturnLogsService, 'go').resolves()
          })

          it('returns a 204 response', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).to.equal(204)
          })
        })
      })
    })

    describe('when the requested cycle is unknown', () => {
      describe('POST', () => {
        beforeEach(() => {
          options = { method: 'POST', url: '/jobs/return-logs/winter' }
        })

        it('returns a 404 response', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(404)
        })
      })
    })
  })
})
