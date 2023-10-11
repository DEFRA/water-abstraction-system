'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const ProcessTimeLimitedLicencesService = require('../../app/services/charge-elements/process-time-limited-licences.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Charge Elements controller', () => {
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

  describe('POST /charge-elements/time-limited', () => {
    const options = {
      method: 'POST',
      url: '/charge-elements/time-limited'
    }

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
