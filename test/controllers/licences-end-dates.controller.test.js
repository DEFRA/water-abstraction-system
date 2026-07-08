// Test framework dependencies

// Test helpers
import http2 from 'node:http2'
const { HTTP_STATUS_NO_CONTENT } = http2.constants

// Things we need to stub
import CheckAllLicenceEndDatesService from '../../app/services/licences/end-dates/check-all-licence-end-dates.service.js'
import ProcessLicenceEndDateChangesService from '../../app/services/licences/end-dates/process-licence-end-date-changes.service.js'

// For running our service
import { init } from '../../app/server.js'

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
          vi.mock('../../app/services/licences/end-dates/check-all-licence-end-dates.service.js')
          CheckAllLicenceEndDatesService.mockResolvedValue()
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
          vi.mock('../../app/services/licences/end-dates/process-licence-end-date-changes.service.js')
          ProcessLicenceEndDateChangesService.mockResolvedValue()
        })

        it('returns a 204 response', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_NO_CONTENT)
        })
      })
    })
  })
})
