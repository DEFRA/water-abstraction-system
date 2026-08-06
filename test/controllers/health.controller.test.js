// Test framework
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import http2 from 'node:http2'

import LoggerStub from 'water-abstraction-engine/test/stubs/logger.stub.js'

// Things we need to stub
import * as ViewInfoService from '../../src/services/health/view-info.service.js'

// For running our service
import { init } from '../../src/server.js'

const { HTTP_STATUS_OK } = http2.constants

describe('Health controller', () => {
  let info
  let options
  let server

  // Create server before running the tests
  beforeAll(async () => {
    server = await init()
  })

  beforeEach(async () => {
    // We silence any calls to server.logger made in the plugin to try and keep the test output as clean as possible
    LoggerStub(server.logger)

    // We silence sending a notification to our Errbit instance using Airbrake
    vi.spyOn(server.app.airbrake, 'notify').mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  afterAll(async () => {
    await server.stop()
  })

  describe('GET /health/info', () => {
    beforeEach(() => {
      info = {
        pageTitle: 'Info',
        addressFacadeData: 'hola',
        appData: {
          name: 'Service - foreground',
          url: 'http://localhost:8001',
          version: '3.1.2',
          commit: 'e5186e106ac8d7a2873faf5ae09f963fc5db8a1c'
        },
        chargingModuleData: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0',
        redisConnectivityData: 'ERROR: Command failed: redis-server --version /bin/sh: 1: redis-server: not found',
        virusScannerData: 'ClamAV 0.103.6/26738/Fri Dec 2 11:12:06 2022'
      }

      options = {
        method: 'GET',
        url: `/health/info`
      }
    })

    describe('when the request succeeds', () => {
      beforeEach(async () => {
        vi.spyOn(ViewInfoService, 'default').mockResolvedValue(info)
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).toEqual(HTTP_STATUS_OK)
        expect(response.payload).toContain(info.pageTitle)
      })
    })
  })
})
