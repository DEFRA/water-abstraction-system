'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const { HTTP_STATUS_NO_CONTENT } = require('node:http2').constants

// Things we need to stub
const CheckAllLicenceEndDatesService = require('../../app/services/licences/end-dates/check-all-licence-end-dates.service.js')
const ProcessLicenceEndDateChangesService = require('../../app/services/licences/end-dates/process-licence-end-date-changes.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Licences End Dates controller', () => {
  let options
  let server

  // Create server before running the tests
  beforeAll(async () => {
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

  afterAll(async () => {
    await server.stop()
  })

  describe('/licences/end-dates/check', () => {
    describe('POST', () => {
      beforeEach(() => {
        options = { method: 'POST', url: '/licences/end-dates/check' }
      })

      describe('when the request succeeds', () => {
        beforeEach(async () => {
          Sinon.stub(CheckAllLicenceEndDatesService, 'go').resolves()
        })

        it('returns a 204 response', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_NO_CONTENT)
        })
      })
    })
  })

  describe('/licences/end-dates/process', () => {
    describe('POST', () => {
      beforeEach(() => {
        options = { method: 'POST', url: '/licences/end-dates/process' }
      })

      describe('when the request succeeds', () => {
        beforeEach(async () => {
          Sinon.stub(ProcessLicenceEndDateChangesService, 'go').resolves()
        })

        it('returns a 204 response', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_NO_CONTENT)
        })
      })
    })
  })
})
