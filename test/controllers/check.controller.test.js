// Test helpers
import http2 from 'node:http2'

// For running our service
import { init } from '../../app/server.js'

const { HTTP_STATUS_NO_CONTENT } = http2.constants

describe('Check controller', () => {
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

  describe('/check/placeholder', () => {
    describe('POST', () => {
      beforeEach(() => {
        options = { method: 'POST', payload: { id: '506c20c7-7741-4c95-85c1-de3fe87314f3' }, url: '/check/placeholder' }
      })

      describe('when the request succeeds', () => {
        it('returns a 204 response', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_NO_CONTENT)
        })
      })
    })
  })
})
