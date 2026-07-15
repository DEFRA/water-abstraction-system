// Test helpers
import http2 from 'node:http2'

// Things we need to stub
import * as ViewManageService from '../../app/services/manage/view-manage.service.js'

// For running our service
import { init } from '../../app/server.js'

const { HTTP_STATUS_OK } = http2.constants

describe('Manage controller', () => {
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

  describe('/manage', () => {
    describe('GET', () => {
      beforeEach(async () => {
        vi.spyOn(ViewManageService, 'default').mockResolvedValue({
          pageTitle: 'Manage reports and notices'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions())

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Manage reports and notices')
        })
      })
    })
  })
})

function _getOptions() {
  return {
    method: 'GET',
    url: '/manage',
    auth: {
      strategy: 'session',
      credentials: { scope: ['hof_notifications'], user: { id: 1000 } }
    }
  }
}
