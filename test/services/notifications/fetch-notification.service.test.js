'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, beforeEach, afterEach, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventHelper = require('../../support/helpers/event.helper.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const NoticesFixture = require('../../fixtures/notices.fixture.js')
const NotificationsFixture = require('../../fixtures/notifications.fixture.js')
const NotificationHelper = require('../../support/helpers/notification.helper.js')

// Thing under test
const FetchNotificationService = require('../../../app/services/notifications/fetch-notification.service.js')

describe('Notifications - Fetch Notification service', () => {
  let licence
  let notice
  let notification

  before(async () => {
    licence = await LicenceHelper.add()

    notice = await EventHelper.add(NoticesFixture.returnsPaperForm())
  })

  afterEach(async () => {
    if (notification) {
      await notification.$query().delete()
    }
  })

  after(async () => {
    await notice.$query().delete()
    await licence.$query().delete()
  })

  describe('when a matching notification exists', () => {
    describe('and "licenceID" is provided', () => {
      describe('and the notification has a copy of its "pdf" saved', () => {
        beforeEach(async () => {
          notification = await NotificationHelper.add(NotificationsFixture.paperReturn(notice))
        })

        it('returns the matching notification with its related event and licence data', async () => {
          const result = await FetchNotificationService.go(notification.id, licence.id)

          expect(result).to.equal({
            licence: {
              id: licence.id,
              licenceRef: licence.licenceRef
            },
            notification: {
              createdAt: notification.createdAt,
              id: notification.id,
              messageType: 'letter',
              notifyError: null,
              notifyStatus: 'received',
              personalisation: notification.personalisation,
              plaintext: null,
              recipient: null,
              returnedAt: null,
              status: 'sent',
              hasPdf: true,
              event: {
                createdAt: notice.createdAt,
                id: notice.id,
                issuer: 'admin-internal@wrls.gov.uk',
                referenceCode: notice.referenceCode,
                subtype: 'paperReturnForms',
                sendingAlertType: null
              }
            }
          })
        })
      })

      describe('and the notification does not have copy of its "pdf" saved (legacy)', () => {
        beforeEach(async () => {
          notification = await NotificationHelper.add({
            ...NotificationsFixture.paperReturn(notice),
            pdf: null,
            plaintext:
              'Water Resources Act 1991\n' +
              `Our reference: ${notice.referenceCode}\n` +
              '\n' +
              'Dear licence holder,\n' +
              '\n' +
              '# This is an advance warning that you may be asked to stop or reduce your water abstraction soon.\n' +
              '\n' +
              '# Why you are receiving this notification\n' +
              '\n'
          })
        })

        it('returns the matching notification with its related event and licence data', async () => {
          const result = await FetchNotificationService.go(notification.id, licence.id)

          expect(result).to.equal({
            licence: {
              id: licence.id,
              licenceRef: licence.licenceRef
            },
            notification: {
              createdAt: notification.createdAt,
              id: notification.id,
              messageType: 'letter',
              notifyError: null,
              notifyStatus: 'received',
              personalisation: notification.personalisation,
              plaintext: notification.plaintext,
              returnedAt: null,
              recipient: null,
              status: 'sent',
              hasPdf: false,
              event: {
                createdAt: notice.createdAt,
                id: notice.id,
                issuer: 'admin-internal@wrls.gov.uk',
                referenceCode: notice.referenceCode,
                subtype: 'paperReturnForms',
                sendingAlertType: null
              }
            }
          })
        })
      })

      describe('and the notification has a system error recorded', () => {
        beforeEach(async () => {
          notification = await NotificationHelper.add({
            ...NotificationsFixture.paperReturn(notice),
            notifyError:
              '{"error":"Notify error","message":"StatusCodeError: 500 - {"errors":[{"error":"TimeoutError","message":"Internal server error"}],"status_code":500}"}',
            notifyStatus: null
          })
        })

        it('returns the matching notification with its related event and licence data', async () => {
          const result = await FetchNotificationService.go(notification.id, licence.id)

          expect(result).to.equal({
            licence: {
              id: licence.id,
              licenceRef: licence.licenceRef
            },
            notification: {
              createdAt: notification.createdAt,
              id: notification.id,
              messageType: 'letter',
              notifyError: notification.notifyError,
              notifyStatus: null,
              personalisation: notification.personalisation,
              plaintext: null,
              returnedAt: null,
              recipient: null,
              status: 'sent',
              hasPdf: true,
              event: {
                createdAt: notice.createdAt,
                id: notice.id,
                issuer: 'admin-internal@wrls.gov.uk',
                referenceCode: notice.referenceCode,
                subtype: 'paperReturnForms',
                sendingAlertType: null
              }
            }
          })
        })
      })

      describe('and the notification has a notify error recorded', () => {
        beforeEach(async () => {
          notification = await NotificationHelper.add({
            ...NotificationsFixture.paperReturn(notice),
            notifyStatus: 'permanent-failure'
          })
        })

        it('returns the matching notification with its related event and licence data', async () => {
          const result = await FetchNotificationService.go(notification.id, licence.id)

          expect(result).to.equal({
            licence: {
              id: licence.id,
              licenceRef: licence.licenceRef
            },
            notification: {
              createdAt: notification.createdAt,
              id: notification.id,
              messageType: 'letter',
              notifyError: null,
              notifyStatus: 'permanent-failure',
              personalisation: notification.personalisation,
              plaintext: null,
              returnedAt: null,
              recipient: null,
              status: 'sent',
              hasPdf: true,
              event: {
                createdAt: notice.createdAt,
                id: notice.id,
                issuer: 'admin-internal@wrls.gov.uk',
                referenceCode: notice.referenceCode,
                subtype: 'paperReturnForms',
                sendingAlertType: null
              }
            }
          })
        })
      })
    })

    describe('and "licenceID" is not provided', () => {
      beforeEach(async () => {
        notification = await NotificationHelper.add(NotificationsFixture.paperReturn(notice))
      })

      it('returns null licence data (it makes no difference to the notification data returned)', async () => {
        const result = await FetchNotificationService.go(notification.id)

        expect(result).to.equal({
          licence: null,
          notification: {
            createdAt: notification.createdAt,
            id: notification.id,
            messageType: 'letter',
            notifyError: null,
            notifyStatus: 'received',
            personalisation: notification.personalisation,
            plaintext: null,
            recipient: null,
            returnedAt: null,
            status: 'sent',
            hasPdf: true,
            event: {
              createdAt: notice.createdAt,
              id: notice.id,
              issuer: 'admin-internal@wrls.gov.uk',
              referenceCode: notice.referenceCode,
              subtype: 'paperReturnForms',
              sendingAlertType: null
            }
          }
        })
      })
    })
  })
})
