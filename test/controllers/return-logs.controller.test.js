// Test helpers
import http2 from 'node:http2'
import { postRequestOptions } from '../support/general.js'

// Things we need to stub
import * as DownloadReturnLogService from '../../app/services/return-logs/download-return-log.service.js'
import * as SubmitDetailsService from '../../app/services/return-logs/submit-details.service.js'
import * as ViewCommunicationsService from '../../app/services/return-logs/view-communications.service.js'
import * as ViewDetailsService from '../../app/services/return-logs/view-details.service.js'

// For running our service
import { init } from '../../app/server.js'
const { HTTP_STATUS_FOUND, HTTP_STATUS_OK } = http2.constants

describe('Return Logs controller', () => {
  const returnLogId = '168026d8-f29b-4165-8726-734c6b14adec'
  let getOptions
  let postOptions
  let server

  // Create server before running the tests
  beforeAll(async () => {
    server = await init()
  })

  beforeEach(() => {
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

  describe('/system/return-logs/{id}/communications', () => {
    describe('GET', () => {
      beforeEach(() => {
        getOptions = {
          method: 'GET',
          url: `/return-logs/${returnLogId}/communications`,
          auth: {
            strategy: 'session',
            credentials: { scope: ['billing'] }
          }
        }

        vi.spyOn(ViewCommunicationsService, 'default').mockResolvedValue({ pageTitle: 'Communications' })
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(getOptions)

        expect(response.statusCode).toEqual(HTTP_STATUS_OK)
        expect(response.payload).toContain('Communications')
      })
    })
  })

  describe('/system/return-logs/{id}/details', () => {
    describe('GET', () => {
      beforeEach(() => {
        getOptions = {
          method: 'GET',
          url: `/return-logs/${returnLogId}/details`,
          auth: {
            strategy: 'session',
            credentials: { scope: ['billing'] }
          }
        }

        vi.spyOn(ViewDetailsService, 'default').mockResolvedValue({ pageTitle: 'Return details' })
      })

      describe('and no version is passed as a query parameter', () => {
        it('passes 0 to the service and returns the page successfully', async () => {
          const response = await server.inject(getOptions)

          const calls = ViewDetailsService.default.mock.calls[0]

          expect(calls).toContain(0)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Return details')
        })
      })

      describe('and a version is passed as a query parameter', () => {
        beforeEach(() => {
          getOptions.url += '?version=1'
        })

        it('passes the version to the service and returns the page successfully', async () => {
          const response = await server.inject(getOptions)

          const calls = ViewDetailsService.default.mock.calls[0]

          expect(calls).toContain(1)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Return details')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        beforeEach(() => {
          postOptions = postRequestOptions(`/return-logs/${returnLogId}/details`, null)

          vi.spyOn(SubmitDetailsService, 'default').mockResolvedValue()
        })

        it('redirects back to the "return details" page', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(`/system/return-logs/${returnLogId}/details`)
        })
      })
    })
  })

  describe('/system/return-logs/download', () => {
    describe('GET', () => {
      let getOptions

      beforeEach(() => {
        getOptions = {
          method: 'GET',
          url: `/return-logs/${returnLogId}/download?version=1`,
          auth: {
            strategy: 'session',
            credentials: { scope: ['billing'] }
          }
        }
      })

      describe('when a request is valid', () => {
        beforeEach(() => {
          vi.spyOn(DownloadReturnLogService, 'default').mockReturnValue({
            data: 'test',
            type: 'type/csv',
            filename: 'test.csv'
          })
        })

        it('returns the file successfully', async () => {
          const response = await server.inject(getOptions)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.headers['content-type']).toEqual('type/csv')
          expect(response.headers['content-disposition']).toEqual('attachment; filename="test.csv"')
          expect(response.payload).toEqual('test')
        })
      })
    })
  })
})
