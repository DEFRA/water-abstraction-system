'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// For running our service
const { init } = require('../../app/server.js')

describe('Landing Page controller', () => {
  let server

  beforeEach(async () => {
    // Create server before each test
    server = await init()

    // We silence calls to server.logger.error in the plugin to keep test output as
    // clean as possible
    Sinon.stub(server.logger, 'error')

    // We silence sending a notification to our Errbit instance using Airbrake
    Sinon.stub(server.app.airbrake, 'notify').resolvesThis()
  })

  describe('GET /landing-page', () => {
    const options = {
      method: 'GET',
      url: '/landing-page'
    }

    it('displays the landing page', async () => {
      const response = await server.inject(options)

      expect(response.statusCode).to.equal(200)

      expect(response.payload).to.include('Landing Page')
      expect(response.payload).to.include('Lorem ipsum')
    })
  })
})
