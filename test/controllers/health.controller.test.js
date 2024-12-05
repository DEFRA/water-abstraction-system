'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const DatabaseHealthCheckService = require('../../app/services/health/database-health-check.service.js')
const InfoService = require('../../app/services/health/info.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Health controller', () => {
  let airbrakeStub
  let server

  // Create server before running the tests
  before(async () => {
    server = await init()
  })

  beforeEach(async () => {
    // We silence any calls to server.logger.error made in the plugin to try and keep the test output as clean as
    // possible
    Sinon.stub(server.logger, 'error')

    // We silence sending a notification to our Errbit instance using Airbrake
    airbrakeStub = Sinon.stub(server.app.airbrake, 'notify').resolvesThis()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('GET /health/airbrake', () => {
    const options = {
      method: 'GET',
      url: '/health/airbrake'
    }

    it('returns a 500 error', async () => {
      const response = await server.inject(options)

      expect(response.statusCode).to.equal(500)
    })

    it('causes Airbrake to send a notification', async () => {
      await server.inject(options)

      expect(airbrakeStub.called).to.equal(true)
    })
  })

  describe('GET /health/database', () => {
    const options = {
      method: 'GET',
      url: '/health/database'
    }

    describe('when the request succeeds', () => {
      beforeEach(async () => {
        Sinon.stub(DatabaseHealthCheckService, 'go').resolves()
      })

      it('returns stats about each table', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(200)
      })
    })
  })

  describe('GET /health/info', () => {
    const options = {
      method: 'GET',
      url: '/health/info'
    }

    describe('when the request succeeds', () => {
      beforeEach(async () => {
        Sinon.stub(InfoService, 'go').resolves({
          virusScannerData: 'ClamAV 0.103.6/26738/Fri Dec 2 11:12:06 2022',
          redisConnectivityData: 'ERROR: Command failed: redis-server --version /bin/sh: 1: redis-server: not found',
          addressFacadeData: 'hola',
          chargingModuleData: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0',
          appData: {
            name: 'Service - foreground',
            url: 'http://localhost:8001',
            version: '3.1.2',
            commit: 'e5186e106ac8d7a2873faf5ae09f963fc5db8a1c'
          }
        })
      })

      it('returns stats about each table', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(200)
      })
    })
  })
})
