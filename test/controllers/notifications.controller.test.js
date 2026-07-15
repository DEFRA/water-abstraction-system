// Test helpers
import * as NoticesFixture from '../support/fixtures/notices.fixture.js'
import * as NotificationsFixture from '../support/fixtures/notifications.fixture.js'
import LicenceHelper from '../support/helpers/licence.helper.js'
import { generateUUID } from '../../app/lib/general.lib.js'
import http2 from 'node:http2'

// Things we need to stub
import * as DownloadNotificationService from '../../app/services/notifications/download-notification.service.js'
import * as ProcessReturnedLetterService from '../../app/services/notifications/process-returned-letter.service.js'
import * as ViewNotificationService from '../../app/services/notifications/view-notification.service.js'
import notifyConfig from '../../config/notify.config.js'

// For running our service
import { init } from '../../app/server.js'

const { HTTP_STATUS_NOT_FOUND, HTTP_STATUS_NO_CONTENT, HTTP_STATUS_OK } = http2.constants

describe('Notifications controller', () => {
  let licence
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

  describe('Notifications controller', () => {
    describe('/notifications/{id}', () => {
      describe('GET', () => {
        beforeEach(async () => {
          options = {
            method: 'GET',
            url: '/notifications/499247a2-bebf-4a94-87dc-b83af2a133f3',
            auth: {
              strategy: 'session',
              credentials: { scope: ['returns'] }
            }
          }
        })

        describe('when a request is valid', () => {
          beforeEach(async () => {
            licence = {
              id: generateUUID(),
              licenceRef: LicenceHelper.generateLicenceRef()
            }

            const notice = NoticesFixture.returnsInvitation()
            const notification = NotificationsFixture.returnsInvitationEmail(notice)
            notification.event = notice

            vi.spyOn(ViewNotificationService, 'default').mockResolvedValue({
              address: [],
              alertDetails: null,
              backLink: { href: `/system/notices/${notice.id}`, text: `Go back to notice ${notice.referenceCode}` },
              contents: notification.plaintext,
              licenceRef: licence.licenceRef,
              messageType: 'email',
              pageTitle: 'Returns invitation',
              pageTitleCaption: `Licence ${licence.licenceRef}`,
              paperForm: null,
              reference: notice.referenceCode,
              sentDate: '2 April 2025',
              sentBy: notice.issuer,
              sentTo: notification.recipient,
              status: notification.status
            })
          })

          it('returns the page successfully', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain(`Licence ${licence.licenceRef}`)
            expect(response.payload).toContain('Returns invitation')
            expect(response.payload).toContain('Go back to notice')
          })
        })
      })
    })

    describe('/notifications/{id}?id={LICENCE_ID}', () => {
      describe('GET', () => {
        beforeEach(async () => {
          options = {
            method: 'GET',
            url: '/notifications/499247a2-bebf-4a94-87dc-b83af2a133f3?id=LICENCE_ID',
            auth: {
              strategy: 'session',
              credentials: { scope: ['returns'] }
            }
          }
        })

        describe('when a request is valid', () => {
          beforeEach(async () => {
            licence = {
              id: generateUUID(),
              licenceRef: LicenceHelper.generateLicenceRef()
            }

            const notice = NoticesFixture.returnsInvitation()
            const notification = NotificationsFixture.returnsInvitationEmail(notice)
            notification.event = notice

            vi.spyOn(ViewNotificationService, 'default').mockResolvedValue({
              address: [],
              alertDetails: null,
              backLink: { href: `/system/licences/${licence.id}/communications`, text: 'Go back to communications' },
              contents: notification.plaintext,
              licenceRef: licence.licenceRef,
              messageType: 'email',
              pageTitle: 'Returns invitation',
              pageTitleCaption: `Licence ${licence.licenceRef}`,
              paperForm: null,
              reference: notice.referenceCode,
              sentDate: '2 April 2025',
              sentBy: notice.issuer,
              sentTo: notification.recipient,
              status: notification.status
            })
          })

          it('returns the page successfully', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain(`Licence ${licence.licenceRef}`)
            expect(response.payload).toContain('Returns invitation')
            expect(response.payload).toContain('Go back to communications')
          })
        })
      })
    })

    describe('/notifications/{id}?return={RETURN_LOG_ID}', () => {
      describe('GET', () => {
        beforeEach(async () => {
          options = {
            method: 'GET',
            url: '/notifications/499247a2-bebf-4a94-87dc-b83af2a133f3?return=RETURN_LOG_ID',
            auth: {
              strategy: 'session',
              credentials: { scope: ['returns'] }
            }
          }
        })

        describe('when a request is valid', () => {
          beforeEach(async () => {
            licence = {
              id: generateUUID(),
              licenceRef: LicenceHelper.generateLicenceRef()
            }

            const returnLogId = generateUUID()
            const notice = NoticesFixture.returnsInvitation()
            const notification = NotificationsFixture.returnsInvitationEmail(notice)
            notification.event = notice

            vi.spyOn(ViewNotificationService, 'default').mockResolvedValue({
              address: [],
              alertDetails: null,
              backLink: { href: `/system/return-logs/${returnLogId}/details`, text: 'Go back to return log' },
              contents: notification.plaintext,
              licenceRef: licence.licenceRef,
              messageType: 'email',
              pageTitle: 'Returns invitation',
              pageTitleCaption: `Licence ${licence.licenceRef}`,
              paperForm: null,
              reference: notice.referenceCode,
              sentDate: '2 April 2025',
              sentBy: notice.issuer,
              sentTo: notification.recipient,
              status: notification.status
            })
          })

          it('returns the page successfully', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain(`Licence ${licence.licenceRef}`)
            expect(response.payload).toContain('Returns invitation')
            expect(response.payload).toContain('Go back to return log')
          })
        })
      })
    })

    describe('/notifications/{id}/download', () => {
      let buffer

      describe('GET', () => {
        beforeEach(async () => {
          options = {
            method: 'GET',
            url: '/notifications/499247a2-bebf-4a94-87dc-b83af2a133f3/download',
            auth: {
              strategy: 'session',
              credentials: { scope: ['returns'] }
            }
          }

          buffer = Buffer.from('mock file')
        })

        describe('when a request is valid', () => {
          beforeEach(async () => {
            vi.spyOn(DownloadNotificationService, 'default').mockResolvedValue(buffer)
          })

          it('returns the page successfully', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.headers['content-type']).toEqual('application/pdf')
            expect(response.headers['content-disposition']).toContain('inline; filename="letter.pdf"')

            // Check that the payload matches the buffer we stubbed
            expect(response.payload).toEqual(buffer.toString())
          })
        })
      })
    })

    describe('/notifications/callbacks/letters', () => {
      describe('POST', () => {
        beforeEach(() => {
          vi.replaceProperty(notifyConfig, 'callbackToken', 'valid')

          vi.spyOn(ProcessReturnedLetterService, 'default').mockResolvedValue()
        })

        describe('when the request has valid authorization', () => {
          beforeEach(() => {
            options = {
              headers: {
                authorization: `Bearer ${notifyConfig.callbackToken}`
              },
              method: 'POST',
              payload: {
                notification_id: '506c20c7-7741-4c95-85c1-de3fe87314f3',
                reference: 'reference'
              },
              url: '/notifications/callbacks/letters'
            }
          })

          it('returns a 204 response', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).toEqual(HTTP_STATUS_NO_CONTENT)
          })
        })

        describe('when the request has an invalid authorization', () => {
          beforeEach(() => {
            options = {
              headers: {
                authorization: 'Bearer wrong'
              },
              method: 'POST',
              payload: {
                notification_id: '506c20c7-7741-4c95-85c1-de3fe87314f3',
                reference: 'reference'
              },
              url: '/notifications/callbacks/letters'
            }
          })

          it('returns a 404 response', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).toEqual(HTTP_STATUS_NOT_FOUND)
          })
        })
      })
    })
  })
})
