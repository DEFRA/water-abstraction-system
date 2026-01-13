'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { HTTP_STATUS_NOT_FOUND, HTTP_STATUS_NO_CONTENT, HTTP_STATUS_OK } = require('node:http2').constants
const NoticesFixture = require('../support/fixtures/notices.fixture.js')
const NotificationsFixture = require('../support/fixtures/notifications.fixture.js')
const { generateUUID } = require('../../app/lib/general.lib.js')
const { generateLicenceRef } = require('../support/helpers/licence.helper.js')

// Things we need to stub
const DownloadNotificationService = require('../../app/services/notifications/download-notification.service.js')
const ProcessReturnedLetterService = require('../../app/services/notifications/process-returned-letter.service.js')
const ViewNotificationService = require('../../app/services/notifications/view-notification.service.js')
const notifyConfig = require('../../config/notify.config.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Notifications controller', () => {
  let licence
  let options
  let server

  // Create server before running the tests
  before(async () => {
    server = await init()
  })

  beforeEach(async () => {
    // We silence any calls to server.logger.error made in the plugin to try and keep the test output as clean as
    // possible
    Sinon.stub(server.logger, 'error')

    // We silence sending a notification to our Errbit instance using Airbrake
    Sinon.stub(server.app.airbrake, 'notify').resolvesThis()
  })

  afterEach(() => {
    Sinon.restore()
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
              licenceRef: generateLicenceRef()
            }

            const notice = NoticesFixture.returnsInvitation()
            const notification = NotificationsFixture.returnsInvitationEmail(notice)
            notification.event = notice

            Sinon.stub(ViewNotificationService, 'go').resolves({
              activeNavBar: 'search',
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

            expect(response.statusCode).to.equal(HTTP_STATUS_OK)
            expect(response.payload).to.contain(`Licence ${licence.licenceRef}`)
            expect(response.payload).to.contain('Returns invitation')
            expect(response.payload).to.contain('Go back to notice')
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
              licenceRef: generateLicenceRef()
            }

            const notice = NoticesFixture.returnsInvitation()
            const notification = NotificationsFixture.returnsInvitationEmail(notice)
            notification.event = notice

            Sinon.stub(ViewNotificationService, 'go').resolves({
              activeNavBar: 'search',
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

            expect(response.statusCode).to.equal(HTTP_STATUS_OK)
            expect(response.payload).to.contain(`Licence ${licence.licenceRef}`)
            expect(response.payload).to.contain('Returns invitation')
            expect(response.payload).to.contain('Go back to communications')
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
              licenceRef: generateLicenceRef()
            }

            const returnLogId = generateUUID()
            const notice = NoticesFixture.returnsInvitation()
            const notification = NotificationsFixture.returnsInvitationEmail(notice)
            notification.event = notice

            Sinon.stub(ViewNotificationService, 'go').resolves({
              activeNavBar: 'search',
              address: [],
              alertDetails: null,
              backLink: { href: `/system/return-logs/${returnLogId}`, text: 'Go back to return log' },
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

            expect(response.statusCode).to.equal(HTTP_STATUS_OK)
            expect(response.payload).to.contain(`Licence ${licence.licenceRef}`)
            expect(response.payload).to.contain('Returns invitation')
            expect(response.payload).to.contain('Go back to return log')
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
            Sinon.stub(DownloadNotificationService, 'go').resolves(buffer)
          })

          it('returns the page successfully', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).to.equal(HTTP_STATUS_OK)
            expect(response.headers['content-type']).to.equal('application/pdf')
            expect(response.headers['content-disposition']).to.contain('inline; filename="letter.pdf"')

            // Check that the payload matches the buffer we stubbed
            expect(response.payload).to.equal(buffer.toString())
          })
        })
      })
    })

    describe('/notifications/callbacks/letters', () => {
      describe('POST', () => {
        beforeEach(() => {
          Sinon.stub(notifyConfig, 'callbackToken').value('valid')

          Sinon.stub(ProcessReturnedLetterService, 'go').resolves()
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

            expect(response.statusCode).to.equal(HTTP_STATUS_NO_CONTENT)
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

            expect(response.statusCode).to.equal(HTTP_STATUS_NOT_FOUND)
          })
        })
      })
    })
  })
})
