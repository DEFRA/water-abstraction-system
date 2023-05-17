'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// For running our service
const { init } = require('../../../app/server.js')

describe('Airbrake controller: GET /status/airbrake', () => {
  let server, airbrakeStub

  const options = {
    method: 'GET',
    url: '/health/airbrake'
  }

  beforeEach(async () => {
    server = await init()

    // We silence any calls to server.logger.error made in the plugin to try and keep the test output as clean as
    // possible
    Sinon.stub(server.logger, 'error')

    // We silence sending a notification to our Errbit instance using Airbrake
    airbrakeStub = Sinon.stub(server.app.airbrake, 'notify').resolvesThis()
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('returns a 500 error', async () => {
    const response = await server.inject(options)

    expect(response.statusCode).to.equal(500)
  })

  it('causes Airbrake to send a notification', async () => {
    await server.inject(options)

    expect(airbrakeStub.called).to.equal(true)
  })
})
