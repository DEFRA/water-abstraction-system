'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, after } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const InfoService = require('../../../app/services/health/info.service.js')

// For running our service
const { init } = require('../../../app/server.js')

describe('Info controller', () => {
  let server

  // Create server before each test
  beforeEach(async () => {
    server = await init()
  })

  after(() => {
    Sinon.restore()
  })

  describe('Info controller: GET /health/info', () => {
    const options = {
      method: 'GET',
      url: '/health/info'
    }

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
