'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const SeedService = require('../../app/services/data/seed/seed.service.js')
const TearDownService = require('../../app/services/data/tear-down/tear-down.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Data controller', () => {
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

  describe('POST /data/seed', () => {
    const options = {
      method: 'POST',
      url: '/data/seed'
    }

    describe('when the request succeeds', () => {
      beforeEach(async () => {
        Sinon.stub(SeedService, 'go').resolves()
      })

      it('displays the correct message', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(204)
      })
    })

    describe('when the request fails', () => {
      describe('because the SeedService errors', () => {
        beforeEach(async () => {
          Sinon.stub(SeedService, 'go').rejects()
        })

        it('returns a 500 status', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(500)
        })
      })
    })
  })

  describe('POST /data/tear-down', () => {
    const options = {
      method: 'POST',
      url: '/data/tear-down'
    }

    describe('when the request succeeds', () => {
      beforeEach(async () => {
        Sinon.stub(TearDownService, 'go').resolves()
      })

      it('returns a 204 status', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(204)
      })
    })

    describe('when the request fails', () => {
      describe('because the TearDownService errors', () => {
        beforeEach(async () => {
          Sinon.stub(TearDownService, 'go').rejects()
        })

        it('returns a 500 status', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(500)
        })
      })
    })
  })
})
