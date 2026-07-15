// Test helpers
import http2 from 'node:http2'

// Things we need to stub
import * as ViewService from '../../app/services/licence-versions/view.service.js'

// For running our service
import { init } from '../../app/server.js'
const { HTTP_STATUS_OK } = http2.constants

describe('Licence Versions controller', () => {
  let options
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

  describe('/licence-versions/{id}', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = {
          method: 'GET',
          url: '/licence-versions/123',
          auth: {
            strategy: 'session',
            credentials: { scope: [] }
          }
        }
      })

      describe('when a request is valid', () => {
        beforeEach(async () => {
          vi.spyOn(ViewService, 'default').mockResolvedValue({ pageTitle: 'Licence version starting' })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Licence version starting')
        })
      })
    })
  })
})
