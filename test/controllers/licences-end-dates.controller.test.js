// Test framework
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import http2 from 'node:http2'

// Things we need to stub
import * as CheckAllLicenceEndDatesService from '../../app/services/licences/end-dates/check-all-licence-end-dates.service.js'
import * as ProcessLicenceEndDateChangesService from '../../app/services/licences/end-dates/process-licence-end-date-changes.service.js'

// For running our service
import { init } from '../../app/server.js'

const { HTTP_STATUS_NO_CONTENT } = http2.constants

describe('Licences End Dates controller', () => {
  let options
  let server

  // Create server before running the tests
  beforeAll(async () => {
    server = await init()
  })

  beforeEach(async () => {
    // We silence any calls to server.logger.error and info to try and keep the test output as clean as possible
    vi.spyOn(server.logger, 'error').mockImplementation(() => {})
    vi.spyOn(server.logger, 'info').mockImplementation(() => {})

    // We silence sending a notification to our Errbit instance using Airbrake
    vi.spyOn(server.app.airbrake, 'notify').mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  afterAll(async () => {
    await server.stop()
  })

  describe('/licences/end-dates/check', () => {
    describe('POST', () => {
      beforeEach(() => {
        options = { method: 'POST', url: '/licences/end-dates/check' }
      })

      describe('when the request succeeds', () => {
        beforeEach(async () => {
          vi.spyOn(CheckAllLicenceEndDatesService, 'default').mockResolvedValue()
        })

        it('returns a 204 response', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_NO_CONTENT)
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
        beforeEach(async () => {
          vi.spyOn(ProcessLicenceEndDateChangesService, 'default').mockResolvedValue()
        })

        it('returns a 204 response', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_NO_CONTENT)
        })
      })
    })
  })
})
