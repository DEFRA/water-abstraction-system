'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const CheckAllLicenceEndDatesService = require('../../app/services/licences/end-dates/check-all-licence-end-dates.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Licences End Dates controller', () => {
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

          expect(response.statusCode).to.equal(204)
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
        it('returns a 204 response', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(204)
        })
      })
    })
  })
})
