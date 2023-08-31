'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// For running our service
const { init } = require('../../app/server.js')

describe('Billing Accounts controller', () => {
  let server

  // Create server before each test
  beforeEach(async () => {
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

  describe('POST /billing-accounts/{invoiceAccountId}/change-address', () => {
    const options = {
      method: 'POST',
      url: '/billing-accounts/7fa2f044-b29e-483a-99b6-e16db0db0f58/change-address'
    }

    describe('when the request succeeds', () => {
      it('returns a 201 status', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(201)
      })
    })
  })
})
