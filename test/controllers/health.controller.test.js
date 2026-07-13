// Test framework dependencies

// Test helpers
import http2 from 'node:http2'

// Things we need to stub
import * as DatabaseHealthCheckService from '../../app/services/health/database-health-check.service.js'
import * as InfoService from '../../app/services/health/info.service.js'

// For running our service
import { init } from '../../app/server.js'
const { HTTP_STATUS_INTERNAL_SERVER_ERROR, HTTP_STATUS_OK } = http2.constants

describe('Health controller', () => {
  let airbrakeStub
  let server

  // Create server before running the tests
  beforeAll(async () => {
    server = await init()
  })

  beforeEach(async () => {
    // We silence any calls to server.logger.error made in the plugin to try and keep the test output as clean as
    // possible
    vi.spyOn(server.logger, 'error').mockImplementation(() => {})

    // We silence sending a notification to our Errbit instance using Airbrake
    airbrakeStub = vi.spyOn(server.app.airbrake, 'notify').mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  afterAll(async () => {
    await server.stop()
  })

  describe('GET /health/airbrake', () => {
    const options = {
      method: 'GET',
      url: '/health/airbrake'
    }

    it('returns a 500 error', async () => {
      const response = await server.inject(options)

      expect(response.statusCode).toEqual(HTTP_STATUS_INTERNAL_SERVER_ERROR)
    })

    it('causes Airbrake to send a notification', async () => {
      await server.inject(options)

      expect(airbrakeStub).toHaveBeenCalled()
    })
  })

  describe('GET /health/database', () => {
    const options = {
      method: 'GET',
      url: '/health/database'
    }

    describe('when the request succeeds', () => {
      beforeEach(async () => {
        vi.spyOn(DatabaseHealthCheckService, 'default').mockResolvedValue()
      })

      it('returns stats about each table', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).toEqual(HTTP_STATUS_OK)
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
        vi.spyOn(InfoService, 'default').mockResolvedValue({
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

        expect(response.statusCode).toEqual(HTTP_STATUS_OK)
      })
    })
  })
})
