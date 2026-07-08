// Test framework dependencies

// Test helpers
import http2 from 'node:http2'
const { HTTP_STATUS_NOT_FOUND, HTTP_STATUS_NO_CONTENT } = http2.constants

// Things we need to stub
import ExportService from '../../app/services/jobs/export/export.service.js'
import ProcessCleanService from '../../app/services/jobs/clean/process-clean.service.js'
import ProcessCustomerFilesService from '../../app/services/jobs/customer-files/process-customer-files.service.js'
import ProcessLicenceUpdatesService from '../../app/services/jobs/licence-updates/process-licence-updates.service.js'
import ProcessNotificationStatusService from '../../app/services/jobs/notification-status/process-notification-status.service.js'
import ProcessRenewalInvitationsService from '../../app/services/jobs/renewal-invitations/process-renewal-invitations.service.js'
import ProcessReturnLogsService from '../../app/services/jobs/return-logs/process-return-logs.service.js'
import ProcessTimeLimitedLicencesService from '../../app/services/jobs/time-limited/process-time-limited-licences.service.js'

// For running our service
import { init } from '../../app/server.js'

describe('Jobs controller', () => {
  let options
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

  describe('/jobs/clean', () => {
    describe('POST', () => {
      beforeEach(() => {
        options = { method: 'POST', url: '/jobs/clean' }
      })

      describe('when the request succeeds', () => {
        beforeEach(() => {
          vi.mock('../../app/services/jobs/clean/process-clean.service.js')
          ProcessCleanService.mockResolvedValue()
        })

        it('returns a 204 response', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_NO_CONTENT)
        })
      })
    })
  })

  describe('/jobs/customer-files/{days}', () => {
    describe('POST', () => {
      beforeEach(() => {
        options = { method: 'POST', url: '/jobs/customer-files/7' }
      })

      describe('when the request succeeds', () => {
        beforeEach(() => {
          vi.mock('../../app/services/jobs/customer-files/process-customer-files.service.js')
          ProcessCustomerFilesService.mockResolvedValue()
        })

        it('returns a 204 response', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_NO_CONTENT)
        })
      })
    })
  })

  describe('/jobs/export', () => {
    describe('POST', () => {
      beforeEach(() => {
        options = { method: 'POST', url: '/jobs/export' }
      })

      describe('when the request succeeds', () => {
        beforeEach(() => {
          vi.mock('../../app/services/jobs/export/export.service.js')
          ExportService.mockResolvedValue()
        })

        it('returns a 204 response', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_NO_CONTENT)
        })
      })
    })
  })

  describe('/jobs/licence-updates', () => {
    describe('POST', () => {
      beforeEach(() => {
        options = { method: 'POST', url: '/jobs/licence-updates' }
      })

      describe('when the request succeeds', () => {
        beforeEach(() => {
          vi.mock('../../app/services/jobs/licence-updates/process-licence-updates.service.js')
          ProcessLicenceUpdatesService.mockResolvedValue()
        })

        it('returns a 204 response', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_NO_CONTENT)
        })
      })
    })
  })

  describe('/jobs/notification-status', () => {
    describe('POST', () => {
      beforeEach(() => {
        options = { method: 'POST', url: '/jobs/notification-status' }
      })

      describe('when the request succeeds', () => {
        beforeEach(() => {
          vi.mock('../../app/services/jobs/notification-status/process-notification-status.service.js')
          ProcessNotificationStatusService.mockResolvedValue()
        })

        it('returns a 204 response', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_NO_CONTENT)
        })
      })
    })
  })

  describe('/jobs/time-limited', () => {
    describe('POST', () => {
      beforeEach(() => {
        options = { method: 'POST', url: '/jobs/time-limited' }
      })

      describe('when the request succeeds', () => {
        beforeEach(() => {
          vi.mock('../../app/services/jobs/time-limited/process-time-limited-licences.service.js')
          ProcessTimeLimitedLicencesService.mockResolvedValue()
        })

        it('returns a 204 response', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_NO_CONTENT)
        })
      })
    })
  })

  describe('/jobs/renewal-invitations/{days}', () => {
    describe('POST', () => {
      beforeEach(() => {
        options = { method: 'POST', url: '/jobs/renewal-invitations/300' }
      })

      describe('when the request succeeds', () => {
        beforeEach(() => {
          vi.mock('../../app/services/jobs/renewal-invitations/process-renewal-invitations.service.js')
          ProcessRenewalInvitationsService.mockResolvedValue()
        })

        it('returns a 204 response', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_NO_CONTENT)
        })

        it('calls the "ProcessRenewalInvitationsService"', async () => {
          await server.inject(options)

          expect(ProcessRenewalInvitationsService.go).toHaveBeenCalled()
        })
      })
    })
  })

  describe('/jobs/return-logs/{cycle}', () => {
    describe('when the requested cycle is summer', () => {
      describe('POST', () => {
        beforeEach(() => {
          options = { method: 'POST', url: '/jobs/return-logs/summer', payload: {} }
        })

        describe('when the request succeeds', () => {
          beforeEach(() => {
            vi.mock('../../app/services/jobs/return-logs/process-return-logs.service.js')
            ProcessReturnLogsService.mockResolvedValue()
          })

          it('returns a 204 response', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).toEqual(HTTP_STATUS_NO_CONTENT)
          })
        })
      })
    })

    describe('when the requested cycle is all-year', () => {
      describe('POST', () => {
        beforeEach(() => {
          options = { method: 'POST', url: '/jobs/return-logs/all-year' }
        })

        describe('when the request succeeds', () => {
          beforeEach(() => {
            vi.mock('../../app/services/jobs/return-logs/process-return-logs.service.js')
            ProcessReturnLogsService.mockResolvedValue()
          })

          it('returns a 204 response', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).toEqual(HTTP_STATUS_NO_CONTENT)
          })
        })
      })
    })

    describe('when the requested cycle is unknown', () => {
      describe('POST', () => {
        beforeEach(() => {
          options = { method: 'POST', url: '/jobs/return-logs/winter' }
        })

        it('returns a 404 response', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_NOT_FOUND)
        })
      })
    })
  })
})
