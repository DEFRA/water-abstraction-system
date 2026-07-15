// Test helpers
import http2 from 'node:http2'

// Things we need to stub
import * as LoadService from '../../app/services/data/load/load.service.js'
import * as SeedService from '../../app/services/data/seed/seed.service.js'
import * as TearDownService from '../../app/services/data/tear-down/tear-down.service.js'

// For running our service
import { init } from '../../app/server.js'

const { HTTP_STATUS_INTERNAL_SERVER_ERROR, HTTP_STATUS_NO_CONTENT, HTTP_STATUS_OK } = http2.constants

describe('Data controller', () => {
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
    vi.spyOn(server.app.airbrake, 'notify').mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  afterAll(async () => {
    await server.stop()
  })

  describe('/data/dates', () => {
    let options

    describe('GET', () => {
      beforeEach(() => {
        options = {
          method: 'GET',
          url: '/data/dates'
        }
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('billingPeriods')
        })
      })
    })
  })

  describe('/data/load', () => {
    describe('POST', () => {
      const options = {
        method: 'POST',
        url: '/data/load'
      }

      describe('when the request succeeds', () => {
        beforeEach(async () => {
          vi.spyOn(LoadService, 'default').mockResolvedValue({
            regions: ['d0a4123d-1e19-480d-9dd4-f70f3387c4b9']
          })
        })

        it('returns a 200 status and the results', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toEqual('{"regions":["d0a4123d-1e19-480d-9dd4-f70f3387c4b9"]}')
        })
      })

      describe('when the request fails', () => {
        describe('because the LoadService errors', () => {
          beforeEach(async () => {
            vi.spyOn(LoadService, 'default').mockRejectedValue()
          })

          it('returns a 500 status', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).toEqual(HTTP_STATUS_INTERNAL_SERVER_ERROR)
          })
        })
      })
    })
  })

  describe('/data/seed', () => {
    describe('POST', () => {
      const options = {
        method: 'POST',
        url: '/data/seed'
      }

      describe('when the request succeeds', () => {
        beforeEach(async () => {
          vi.spyOn(SeedService, 'default').mockResolvedValue()
        })

        it('displays the correct message', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_NO_CONTENT)
        })
      })

      describe('when the request fails', () => {
        describe('because the SeedService errors', () => {
          beforeEach(async () => {
            vi.spyOn(SeedService, 'default').mockRejectedValue()
          })

          it('returns a 500 status', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).toEqual(HTTP_STATUS_INTERNAL_SERVER_ERROR)
          })
        })
      })
    })
  })

  describe('/data/tear-down', () => {
    describe('POST', () => {
      const options = {
        method: 'POST',
        url: '/data/tear-down'
      }

      describe('when the request succeeds', () => {
        beforeEach(async () => {
          vi.spyOn(TearDownService, 'default').mockResolvedValue()
        })

        it('returns a 204 status', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_NO_CONTENT)
        })
      })

      describe('when the request fails', () => {
        describe('because the TearDownService errors', () => {
          beforeEach(async () => {
            vi.spyOn(TearDownService, 'default').mockRejectedValue()
          })

          it('returns a 500 status', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).toEqual(HTTP_STATUS_INTERNAL_SERVER_ERROR)
          })
        })
      })
    })
  })
})
