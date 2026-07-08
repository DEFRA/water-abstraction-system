// Test framework dependencies

// Test helpers
import http2 from 'node:http2'
const { HTTP_STATUS_FOUND, HTTP_STATUS_OK } = http2.constants
import { postRequestOptions } from '../support/general.js'

// Things we need to stub
import RemoveService from '../../app/services/licence-monitoring-station/remove.service.js'
import SubmitRemoveService from '../../app/services/licence-monitoring-station/submit-remove.service.js'

// For running our service
import { init } from '../../app/server.js'

const licenceMonitoringStationId = 'ab4aff2b-cb01-4070-b896-948d80d61f96'

describe('Licence Monitoring Station - Controller', () => {
  let server

  // Create server before running the tests
  beforeAll(async () => {
    server = await init()
  })

  beforeEach(() => {
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

  describe('licence-monitoring-station/{licenceMonitoringStationId}/remove', () => {
    const path = 'remove'

    describe('GET', () => {
      describe('when the request succeeds', () => {
        beforeEach(() => {
          vi.mock('../../app/services/licence-monitoring-station/remove.service.js')
          RemoveService.mockResolvedValue({ pageTitle: 'You’re about to remove the tag for this licence' })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('You’re about to remove the tag for this licence')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        const monitoringStationId = '8685eadf-15a5-4270-b57e-b9196a23218a'

        beforeEach(() => {
          vi.mock('../../app/services/licence-monitoring-station/submit-remove.service.js')
          SubmitRemoveService.mockResolvedValue()
        })

        it('redirects to the view monitoring station page', async () => {
          const response = await server.inject(_postOptions(path, { monitoringStationId }))

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(`/system/monitoring-stations/${monitoringStationId}`)
        })
      })
    })
  })
})

function _getOptions(path) {
  const url = `/licence-monitoring-station/${licenceMonitoringStationId}/${path}`

  return {
    method: 'GET',
    url,
    auth: {
      strategy: 'session',
      credentials: { scope: ['manage_gauging_station_licence_links'] }
    }
  }
}

function _postOptions(path, payload) {
  return postRequestOptions(
    `/licence-monitoring-station/${licenceMonitoringStationId}/${path}`,
    payload,
    'manage_gauging_station_licence_links'
  )
}
