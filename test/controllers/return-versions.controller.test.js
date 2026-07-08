// Test framework dependencies

// Test helpers
import http2 from 'node:http2'
const { HTTP_STATUS_OK } = http2.constants

// Things we need to stub
import * as ViewService from '../../app/services/return-versions/view.service.js'

// For running our service
import { init } from '../../app/server.js'

describe('Return Versions controller', () => {
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

  describe('/return-versions/{id}', () => {
    const id = '2a075724-b66c-410e-9fc8-b964077204f2'

    describe('GET', () => {
      beforeEach(async () => {
        vi.spyOn(ViewService, 'default').mockResolvedValue({
          pageTitle: 'Requirements for returns valid from'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject({
            method: 'GET',
            url: `/return-versions/${id}/`,
            auth: {
              strategy: 'session',
              credentials: { scope: ['view_charge_versions'] }
            }
          })

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Requirements for returns valid from')
        })
      })
    })
  })
})
