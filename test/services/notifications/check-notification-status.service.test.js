'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const NoticesFixture = require('../../support/fixtures/notices.fixture.js')
const NotificationsFixture = require('../../support/fixtures/notifications.fixture.js')

// Things we need to stub
const GlobalNotifierStub = require('../../support/stubs/global-notifier.stub.js')
const LicenceMonitoringStationModel = require('../../../app/models/licence-monitoring-station.model.js')
const NotificationModel = require('../../../app/models/notification.model.js')
const ReturnLogModel = require('../../../app/models/return-log.model.js')
const ViewMessageDataRequest = require('../../../app/requests/notify/view-message-data.request.js')

// Thing under test
const CheckNotificationStatusService = require('../../../app/services/notifications/check-notification-status.service.js')

describe('Notifications - Check Notification Status service', () => {
  let licenceMonitoringStationPatchStub
  let notice
  let notification
  let notificationPatchStub
  let notifierStub
  let returnLogPatchStub
  let returnLogWhereInStub

  beforeEach(() => {
    notificationPatchStub = Sinon.stub().returnsThis()
    Sinon.stub(NotificationModel, 'query').returns({
      patch: notificationPatchStub,
      findById: Sinon.stub().resolves()
    })

    licenceMonitoringStationPatchStub = Sinon.stub().returnsThis()
    Sinon.stub(LicenceMonitoringStationModel, 'query').returns({
      patch: licenceMonitoringStationPatchStub,
      findById: Sinon.stub().resolves()
    })

    returnLogPatchStub = Sinon.stub().returnsThis()

    notifierStub = GlobalNotifierStub.build(Sinon)
    globalThis.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    delete globalThis.GlobalNotifier
  })

  describe('when the notification is an "abstraction alert"', () => {
    beforeEach(() => {
      notice = NoticesFixture.alertStop()
    })

    describe('and is a letter', () => {
      beforeEach(() => {
        notification = NotificationsFixture.abstractionAlertLetter(notice)
        notification.status = 'pending'
      })

      describe('and Notify returns a "pending" status', () => {
        beforeEach(() => {
          Sinon.stub(ViewMessageDataRequest, 'send').resolves({
            succeeded: true,
            response: {
              statusCode: 200,
              body: {
                status: 'accepted'
              }
            }
          })
        })

        it('does nothing', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(notificationPatchStub.called).toBe(false)
          expect(licenceMonitoringStationPatchStub.called).toBe(false)
          expect(returnLogPatchStub.called).toBe(false)
        })
      })

      describe('and Notify returns "sent" status', () => {
        beforeEach(() => {
          Sinon.stub(ViewMessageDataRequest, 'send').resolves({
            succeeded: true,
            response: {
              statusCode: 200,
              body: {
                status: 'received'
              }
            }
          })
        })

        it('updates the status of the notification to "sent"', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(notificationPatchStub.called).toBe(true)
          expect(notificationPatchStub.firstCall.args[0]).toMatchObject({ notifyStatus: 'received', status: 'sent' })
        })

        it('updates the linked licence monitoring station record', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(licenceMonitoringStationPatchStub.called).toBe(true)
          expect(licenceMonitoringStationPatchStub.firstCall.args[0]).toEqual({
            status: notification.personalisation.sending_alert_type,
            statusUpdatedAt: notification.createdAt
          })
        })
      })

      describe('and Notify returns "failed" status', () => {
        beforeEach(() => {
          Sinon.stub(ViewMessageDataRequest, 'send').resolves({
            succeeded: true,
            response: {
              statusCode: 200,
              body: {
                status: 'validation-failed'
              }
            }
          })
        })

        it('updates the status of the notification to "error"', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(notificationPatchStub.called).toBe(true)
          expect(notificationPatchStub.firstCall.args[0]).toMatchObject({
            notifyStatus: 'validation-failed',
            status: 'error'
          })
        })

        it('does not update the linked licence monitoring station record', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(licenceMonitoringStationPatchStub.called).toBe(false)
        })
      })

      describe('and Notify returns an "unknown" status', () => {
        beforeEach(() => {
          Sinon.stub(ViewMessageDataRequest, 'send').resolves({
            succeeded: true,
            response: {
              statusCode: 200,
              body: {
                status: 'unrecognised'
              }
            }
          })
        })

        it('does nothing', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(notificationPatchStub.called).toBe(false)
          expect(licenceMonitoringStationPatchStub.called).toBe(false)
          expect(returnLogPatchStub.called).toBe(false)
        })
      })
    })

    describe('and is an email', () => {
      beforeEach(() => {
        notification = NotificationsFixture.abstractionAlertEmail(notice)
        notification.status = 'pending'
      })

      describe('and Notify returns a "pending" status', () => {
        beforeEach(() => {
          Sinon.stub(ViewMessageDataRequest, 'send').resolves({
            succeeded: true,
            response: {
              statusCode: 200,
              body: {
                status: 'accepted'
              }
            }
          })
        })

        it('does nothing', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(notificationPatchStub.called).toBe(false)
          expect(licenceMonitoringStationPatchStub.called).toBe(false)
          expect(returnLogPatchStub.called).toBe(false)
        })
      })

      describe('and Notify returns "sent" status', () => {
        beforeEach(() => {
          Sinon.stub(ViewMessageDataRequest, 'send').resolves({
            succeeded: true,
            response: {
              statusCode: 200,
              body: {
                status: 'delivered'
              }
            }
          })
        })

        it('updates the status of the notification to "sent"', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(notificationPatchStub.called).toBe(true)
          expect(notificationPatchStub.firstCall.args[0]).toMatchObject({ notifyStatus: 'delivered', status: 'sent' })
        })

        it('updates the linked licence monitoring station record', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(licenceMonitoringStationPatchStub.called).toBe(true)
          expect(licenceMonitoringStationPatchStub.firstCall.args[0]).toEqual({
            status: notification.personalisation.sending_alert_type,
            statusUpdatedAt: notification.createdAt
          })
        })
      })

      describe('and Notify returns "failed" status', () => {
        beforeEach(() => {
          Sinon.stub(ViewMessageDataRequest, 'send').resolves({
            succeeded: true,
            response: {
              statusCode: 200,
              body: {
                status: 'technical-failure'
              }
            }
          })
        })

        it('updates the status of the notification to "error"', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(notificationPatchStub.called).toBe(true)
          expect(notificationPatchStub.firstCall.args[0]).toMatchObject({
            notifyStatus: 'technical-failure',
            status: 'error'
          })
        })

        it('does not update the linked licence monitoring station record', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(licenceMonitoringStationPatchStub.called).toBe(false)
        })
      })

      describe('and Notify returns an "unknown" status', () => {
        beforeEach(() => {
          Sinon.stub(ViewMessageDataRequest, 'send').resolves({
            succeeded: true,
            response: {
              statusCode: 200,
              body: {
                status: 'unrecognised'
              }
            }
          })
        })

        it('does nothing', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(notificationPatchStub.called).toBe(false)
          expect(licenceMonitoringStationPatchStub.called).toBe(false)
          expect(returnLogPatchStub.called).toBe(false)
        })
      })
    })
  })

  describe('when the notification is a "paper return"', () => {
    beforeEach(() => {
      notice = NoticesFixture.returnsPaperForm()
      notification = NotificationsFixture.paperReturn(notice)
      notification.status = 'pending'

      returnLogWhereInStub = Sinon.stub().resolves()
      Sinon.stub(ReturnLogModel, 'query').returns({
        patch: returnLogPatchStub,
        where: Sinon.stub().returnsThis(),
        whereIn: returnLogWhereInStub
      })
    })

    describe('and Notify returns a "pending" status', () => {
      beforeEach(() => {
        // NOTE: The service only uses the `status` field from the Notify result. If you want to see a full
        // representation look at test/requests/notify/view-message-data.request.test.js
        Sinon.stub(ViewMessageDataRequest, 'send').resolves({
          succeeded: true,
          response: {
            statusCode: 200,
            body: {
              status: 'pending-virus-check'
            }
          }
        })
      })

      it('does nothing', async () => {
        await CheckNotificationStatusService.go(notification)

        expect(notificationPatchStub.called).toBe(false)
        expect(licenceMonitoringStationPatchStub.called).toBe(false)
        expect(returnLogPatchStub.called).toBe(false)
      })
    })

    describe('and Notify returns a "sent" status', () => {
      beforeEach(() => {
        // NOTE: The service only uses the `status` field from the Notify result. If you want to see a full
        // representation look at test/requests/notify/view-message-data.request.test.js
        Sinon.stub(ViewMessageDataRequest, 'send').resolves({
          succeeded: true,
          response: {
            statusCode: 200,
            body: {
              status: 'received'
            }
          }
        })
      })

      it('updates the status of the notification to "sent"', async () => {
        await CheckNotificationStatusService.go(notification)

        expect(notificationPatchStub.called).toBe(true)
        expect(notificationPatchStub.firstCall.args[0]).toMatchObject({ notifyStatus: 'received', status: 'sent' })
      })

      it('does not attempt to update anything in licence monitoring stations', async () => {
        await CheckNotificationStatusService.go(notification)

        expect(licenceMonitoringStationPatchStub.called).toBe(false)
      })

      describe('and the contact type was "licence holder" or "single use"', () => {
        it('attempts to set the due date for the linked return log records', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(returnLogPatchStub.called).toBe(true)
          expect(returnLogPatchStub.firstCall.args[0]).toMatchObject({
            dueDate: notification.dueDate,
            sentDate: notification.createdAt
          })

          expect(returnLogWhereInStub.called).toBe(true)
          expect(returnLogWhereInStub.firstCall.args[0]).toEqual('id')
          expect(returnLogWhereInStub.firstCall.args[1]).toEqual(notification.returnLogIds)
        })
      })

      describe('and the contact type was NOT "licence holder" or "single use"', () => {
        beforeEach(() => {
          notification.contactType = 'returns to'
        })

        it('does not attempt to set the due date for the linked return log records.', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(returnLogPatchStub.called).toBe(false)
        })
      })
    })

    describe('and Notify returns a "failed" status', () => {
      beforeEach(() => {
        Sinon.stub(ViewMessageDataRequest, 'send').resolves({
          succeeded: true,
          response: {
            statusCode: 200,
            body: {
              status: 'temporary-failure'
            }
          }
        })
      })

      it('updates the status of the notification to "error"', async () => {
        await CheckNotificationStatusService.go(notification)

        expect(notificationPatchStub.called).toBe(true)
        expect(notificationPatchStub.firstCall.args[0]).toMatchObject({
          notifyStatus: 'temporary-failure',
          status: 'error'
        })
      })
    })

    describe('and Notify returns a "cancelled" status', () => {
      beforeEach(() => {
        Sinon.stub(ViewMessageDataRequest, 'send').resolves({
          succeeded: true,
          response: {
            statusCode: 200,
            body: {
              status: 'cancelled'
            }
          }
        })
      })

      it('updates the status of the notification to "cancelled"', async () => {
        await CheckNotificationStatusService.go(notification)

        expect(notificationPatchStub.called).toBe(true)
        expect(notificationPatchStub.firstCall.args[0]).toMatchObject({
          notifyStatus: 'cancelled',
          status: 'cancelled'
        })
      })
    })

    describe('and Notify returns an "unknown" status', () => {
      beforeEach(() => {
        Sinon.stub(ViewMessageDataRequest, 'send').resolves({
          succeeded: true,
          response: {
            statusCode: 200,
            body: {
              status: 'unrecognised'
            }
          }
        })
      })

      it('does nothing', async () => {
        await CheckNotificationStatusService.go(notification)

        expect(notificationPatchStub.called).toBe(false)
        expect(licenceMonitoringStationPatchStub.called).toBe(false)
        expect(returnLogPatchStub.called).toBe(false)
      })
    })
  })

  describe('when the notification is a "returns invitation"', () => {
    beforeEach(() => {
      notice = NoticesFixture.returnsInvitation()

      returnLogWhereInStub = Sinon.stub().resolves()
      Sinon.stub(ReturnLogModel, 'query').returns({
        patch: returnLogPatchStub,
        where: Sinon.stub().returnsThis(),
        whereIn: returnLogWhereInStub
      })
    })

    describe('and is a letter', () => {
      beforeEach(() => {
        notification = NotificationsFixture.returnsInvitationLetter(notice)
        notification.status = 'pending'
      })

      describe('and Notify returns a "pending" status', () => {
        beforeEach(() => {
          // NOTE: The service only uses the `status` field from the Notify result. If you want to see a full
          // representation look at test/requests/notify/view-message-data.request.test.js
          Sinon.stub(ViewMessageDataRequest, 'send').resolves({
            succeeded: true,
            response: {
              statusCode: 200,
              body: {
                status: 'sending'
              }
            }
          })
        })

        it('does nothing', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(notificationPatchStub.called).toBe(false)
          expect(licenceMonitoringStationPatchStub.called).toBe(false)
          expect(returnLogPatchStub.called).toBe(false)
        })
      })

      describe('and Notify returns a "received" status', () => {
        beforeEach(() => {
          // NOTE: The service only uses the `status` field from the Notify result. If you want to see a full
          // representation look at test/requests/notify/view-message-data.request.test.js
          Sinon.stub(ViewMessageDataRequest, 'send').resolves({
            succeeded: true,
            response: {
              statusCode: 200,
              body: {
                status: 'received'
              }
            }
          })
        })

        it('updates the status of the notification to "sent"', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(notificationPatchStub.called).toBe(true)
          expect(notificationPatchStub.firstCall.args[0]).toMatchObject({ notifyStatus: 'received', status: 'sent' })
        })

        it('does not attempt to update anything in licence monitoring stations', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(licenceMonitoringStationPatchStub.called).toBe(false)
        })

        describe('and the contact type was "licence holder" or "single use"', () => {
          it('attempts to set the due date for the linked return log records', async () => {
            await CheckNotificationStatusService.go(notification)

            expect(returnLogPatchStub.called).toBe(true)
            expect(returnLogPatchStub.firstCall.args[0]).toMatchObject({
              dueDate: notification.dueDate,
              sentDate: notification.createdAt
            })

            expect(returnLogWhereInStub.called).toBe(true)
            expect(returnLogWhereInStub.firstCall.args[0]).toEqual('id')
            expect(returnLogWhereInStub.firstCall.args[1]).toEqual(notification.returnLogIds)
          })
        })

        describe('and the contact type was NOT "licence holder" or "single use"', () => {
          beforeEach(() => {
            notification.contactType = 'returns to'
          })

          it('does not attempt to set the due date for the linked return log records.', async () => {
            await CheckNotificationStatusService.go(notification)

            expect(returnLogPatchStub.called).toBe(false)
          })
        })
      })

      describe('and Notify returns a "failed" status', () => {
        beforeEach(() => {
          Sinon.stub(ViewMessageDataRequest, 'send').resolves({
            succeeded: true,
            response: {
              statusCode: 200,
              body: {
                status: 'temporary-failure'
              }
            }
          })
        })

        it('updates the status of the notification to "error"', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(notificationPatchStub.called).toBe(true)
          expect(notificationPatchStub.firstCall.args[0]).toMatchObject({
            notifyStatus: 'temporary-failure',
            status: 'error'
          })
        })
      })

      describe('and Notify returns an "unknown" status', () => {
        beforeEach(() => {
          Sinon.stub(ViewMessageDataRequest, 'send').resolves({
            succeeded: true,
            response: {
              statusCode: 200,
              body: {
                status: 'unrecognised'
              }
            }
          })
        })

        it('does nothing', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(notificationPatchStub.called).toBe(false)
          expect(licenceMonitoringStationPatchStub.called).toBe(false)
          expect(returnLogPatchStub.called).toBe(false)
        })
      })
    })

    describe('and is an email', () => {
      beforeEach(() => {
        notification = NotificationsFixture.returnsInvitationEmail(notice)
        notification.status = 'pending'
      })

      describe('and Notify returns a "pending" status', () => {
        beforeEach(() => {
          Sinon.stub(ViewMessageDataRequest, 'send').resolves({
            succeeded: true,
            response: {
              statusCode: 200,
              body: {
                status: 'created'
              }
            }
          })
        })

        it('does nothing', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(notificationPatchStub.called).toBe(false)
          expect(licenceMonitoringStationPatchStub.called).toBe(false)
          expect(returnLogPatchStub.called).toBe(false)
        })
      })

      describe('and Notify returns a "sent" status', () => {
        beforeEach(() => {
          Sinon.stub(ViewMessageDataRequest, 'send').resolves({
            succeeded: true,
            response: {
              statusCode: 200,
              body: {
                status: 'delivered'
              }
            }
          })
        })

        it('updates the status of the notification to "sent"', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(notificationPatchStub.called).toBe(true)
          expect(notificationPatchStub.firstCall.args[0]).toMatchObject({ notifyStatus: 'delivered', status: 'sent' })
        })

        it('does not attempt to update anything in licence monitoring stations', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(licenceMonitoringStationPatchStub.called).toBe(false)
        })

        describe('and the contact type was "primary user" or "single use"', () => {
          it('attempts to set the due date for the linked return log records', async () => {
            await CheckNotificationStatusService.go(notification)

            expect(returnLogPatchStub.called).toBe(true)
            expect(returnLogPatchStub.firstCall.args[0]).toMatchObject({
              dueDate: notification.dueDate,
              sentDate: notification.createdAt
            })

            expect(returnLogWhereInStub.called).toBe(true)
            expect(returnLogWhereInStub.firstCall.args[0]).toEqual('id')
            expect(returnLogWhereInStub.firstCall.args[1]).toEqual(notification.returnLogIds)
          })
        })

        describe('and the contact type was NOT "primary user" or "single use"', () => {
          beforeEach(() => {
            notification.contactType = 'returns user'
          })

          it('does not attempt to set the due date for the linked return log records.', async () => {
            await CheckNotificationStatusService.go(notification)

            expect(returnLogPatchStub.called).toBe(false)
          })
        })
      })

      describe('and Notify returns a "failed" status', () => {
        beforeEach(() => {
          Sinon.stub(ViewMessageDataRequest, 'send').resolves({
            succeeded: true,
            response: {
              statusCode: 200,
              body: {
                status: 'permanent-failure'
              }
            }
          })
        })

        it('updates the status of the notification to "error"', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(notificationPatchStub.called).toBe(true)
          expect(notificationPatchStub.firstCall.args[0]).toMatchObject({
            notifyStatus: 'permanent-failure',
            status: 'error'
          })
        })
      })

      describe('and Notify returns an "unknown" status', () => {
        beforeEach(() => {
          Sinon.stub(ViewMessageDataRequest, 'send').resolves({
            succeeded: true,
            response: {
              statusCode: 200,
              body: {
                status: 'unrecognised'
              }
            }
          })
        })

        it('does nothing', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(notificationPatchStub.called).toBe(false)
          expect(licenceMonitoringStationPatchStub.called).toBe(false)
          expect(returnLogPatchStub.called).toBe(false)
        })
      })
    })
  })

  describe('when the notification is a "returns invitation ad-hoc"', () => {
    beforeEach(() => {
      notice = NoticesFixture.returnsInvitation()

      returnLogWhereInStub = Sinon.stub().resolves()
      Sinon.stub(ReturnLogModel, 'query').returns({
        patch: returnLogPatchStub,
        where: Sinon.stub().returnsThis(),
        whereIn: returnLogWhereInStub
      })
    })

    describe('and is a letter', () => {
      beforeEach(() => {
        notification = NotificationsFixture.returnsInvitationAdHocLetter(notice)
        notification.status = 'pending'
      })

      describe('and Notify returns a "pending" status', () => {
        beforeEach(() => {
          // NOTE: The service only uses the `status` field from the Notify result. If you want to see a full
          // representation look at test/requests/notify/view-message-data.request.test.js
          Sinon.stub(ViewMessageDataRequest, 'send').resolves({
            succeeded: true,
            response: {
              statusCode: 200,
              body: {
                status: 'sending'
              }
            }
          })
        })

        it('does nothing', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(notificationPatchStub.called).toBe(false)
          expect(licenceMonitoringStationPatchStub.called).toBe(false)
          expect(returnLogPatchStub.called).toBe(false)
        })
      })

      describe('and Notify returns a "received" status', () => {
        beforeEach(() => {
          // NOTE: The service only uses the `status` field from the Notify result. If you want to see a full
          // representation look at test/requests/notify/view-message-data.request.test.js
          Sinon.stub(ViewMessageDataRequest, 'send').resolves({
            succeeded: true,
            response: {
              statusCode: 200,
              body: {
                status: 'received'
              }
            }
          })
        })

        it('updates the status of the notification to "sent"', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(notificationPatchStub.called).toBe(true)
          expect(notificationPatchStub.firstCall.args[0]).toMatchObject({ notifyStatus: 'received', status: 'sent' })
        })

        it('does not attempt to update anything in licence monitoring stations', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(licenceMonitoringStationPatchStub.called).toBe(false)
        })

        describe('and the contact type was "licence holder" or "single use"', () => {
          it('attempts to set the due date for the linked return log records', async () => {
            await CheckNotificationStatusService.go(notification)

            expect(returnLogPatchStub.called).toBe(true)
            expect(returnLogPatchStub.firstCall.args[0]).toMatchObject({
              dueDate: notification.dueDate,
              sentDate: notification.createdAt
            })

            expect(returnLogWhereInStub.called).toBe(true)
            expect(returnLogWhereInStub.firstCall.args[0]).toEqual('id')
            expect(returnLogWhereInStub.firstCall.args[1]).toEqual(notification.returnLogIds)
          })
        })

        describe('and the contact type was NOT "licence holder" or "single use"', () => {
          beforeEach(() => {
            notification.contactType = 'returns to'
          })

          it('does not attempt to set the due date for the linked return log records.', async () => {
            await CheckNotificationStatusService.go(notification)

            expect(returnLogPatchStub.called).toBe(false)
          })
        })
      })

      describe('and Notify returns a "failed" status', () => {
        beforeEach(() => {
          Sinon.stub(ViewMessageDataRequest, 'send').resolves({
            succeeded: true,
            response: {
              statusCode: 200,
              body: {
                status: 'temporary-failure'
              }
            }
          })
        })

        it('updates the status of the notification to "error"', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(notificationPatchStub.called).toBe(true)
          expect(notificationPatchStub.firstCall.args[0]).toMatchObject({
            notifyStatus: 'temporary-failure',
            status: 'error'
          })
        })
      })

      describe('and Notify returns an "unknown" status', () => {
        beforeEach(() => {
          Sinon.stub(ViewMessageDataRequest, 'send').resolves({
            succeeded: true,
            response: {
              statusCode: 200,
              body: {
                status: 'unrecognised'
              }
            }
          })
        })

        it('does nothing', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(notificationPatchStub.called).toBe(false)
          expect(licenceMonitoringStationPatchStub.called).toBe(false)
          expect(returnLogPatchStub.called).toBe(false)
        })
      })
    })

    describe('and is an email', () => {
      beforeEach(() => {
        notification = NotificationsFixture.returnsInvitationAdHocEmail(notice)
        notification.status = 'pending'
      })

      describe('and Notify returns a "pending" status', () => {
        beforeEach(() => {
          Sinon.stub(ViewMessageDataRequest, 'send').resolves({
            succeeded: true,
            response: {
              statusCode: 200,
              body: {
                status: 'created'
              }
            }
          })
        })

        it('does nothing', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(notificationPatchStub.called).toBe(false)
          expect(licenceMonitoringStationPatchStub.called).toBe(false)
          expect(returnLogPatchStub.called).toBe(false)
        })
      })

      describe('and Notify returns a "sent" status', () => {
        beforeEach(() => {
          Sinon.stub(ViewMessageDataRequest, 'send').resolves({
            succeeded: true,
            response: {
              statusCode: 200,
              body: {
                status: 'delivered'
              }
            }
          })
        })

        it('updates the status of the notification to "sent"', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(notificationPatchStub.called).toBe(true)
          expect(notificationPatchStub.firstCall.args[0]).toMatchObject({ notifyStatus: 'delivered', status: 'sent' })
        })

        it('does not attempt to update anything in licence monitoring stations', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(licenceMonitoringStationPatchStub.called).toBe(false)
        })

        describe('and the contact type was "primary user" or "single use"', () => {
          it('attempts to set the due date for the linked return log records', async () => {
            await CheckNotificationStatusService.go(notification)

            expect(returnLogPatchStub.called).toBe(true)
            expect(returnLogPatchStub.firstCall.args[0]).toMatchObject({
              dueDate: notification.dueDate,
              sentDate: notification.createdAt
            })

            expect(returnLogWhereInStub.called).toBe(true)
            expect(returnLogWhereInStub.firstCall.args[0]).toEqual('id')
            expect(returnLogWhereInStub.firstCall.args[1]).toEqual(notification.returnLogIds)
          })
        })

        describe('and the contact type was NOT "primary user" or "single use"', () => {
          beforeEach(() => {
            notification.contactType = 'returns user'
          })

          it('does not attempt to set the due date for the linked return log records.', async () => {
            await CheckNotificationStatusService.go(notification)

            expect(returnLogPatchStub.called).toBe(false)
          })
        })
      })

      describe('and Notify returns a "failed" status', () => {
        beforeEach(() => {
          Sinon.stub(ViewMessageDataRequest, 'send').resolves({
            succeeded: true,
            response: {
              statusCode: 200,
              body: {
                status: 'permanent-failure'
              }
            }
          })
        })

        it('updates the status of the notification to "error"', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(notificationPatchStub.called).toBe(true)
          expect(notificationPatchStub.firstCall.args[0]).toMatchObject({
            notifyStatus: 'permanent-failure',
            status: 'error'
          })
        })
      })

      describe('and Notify returns an "unknown" status', () => {
        beforeEach(() => {
          Sinon.stub(ViewMessageDataRequest, 'send').resolves({
            succeeded: true,
            response: {
              statusCode: 200,
              body: {
                status: 'unrecognised'
              }
            }
          })
        })

        it('does nothing', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(notificationPatchStub.called).toBe(false)
          expect(licenceMonitoringStationPatchStub.called).toBe(false)
          expect(returnLogPatchStub.called).toBe(false)
        })
      })
    })
  })

  describe('when the notification is a "returns invitation alternate"', () => {
    beforeEach(() => {
      notice = NoticesFixture.returnsInvitation()

      returnLogWhereInStub = Sinon.stub().resolves()
      Sinon.stub(ReturnLogModel, 'query').returns({
        patch: returnLogPatchStub,
        where: Sinon.stub().returnsThis(),
        whereIn: returnLogWhereInStub
      })

      // NOTE: We only create letters for return invitations alternate, so we skip splitting the tests into 'letter' and
      // 'email'
      notification = NotificationsFixture.returnsInvitationAlternateLetter(notice)
      notification.status = 'pending'
    })

    describe('and Notify returns a "pending" status', () => {
      beforeEach(() => {
        // NOTE: The service only uses the `status` field from the Notify result. If you want to see a full
        // representation look at test/requests/notify/view-message-data.request.test.js
        Sinon.stub(ViewMessageDataRequest, 'send').resolves({
          succeeded: true,
          response: {
            statusCode: 200,
            body: {
              status: 'sending'
            }
          }
        })
      })

      it('does nothing', async () => {
        await CheckNotificationStatusService.go(notification)

        expect(notificationPatchStub.called).toBe(false)
        expect(licenceMonitoringStationPatchStub.called).toBe(false)
        expect(returnLogPatchStub.called).toBe(false)
      })
    })

    describe('and Notify returns a "received" status', () => {
      beforeEach(() => {
        // NOTE: The service only uses the `status` field from the Notify result. If you want to see a full
        // representation look at test/requests/notify/view-message-data.request.test.js
        Sinon.stub(ViewMessageDataRequest, 'send').resolves({
          succeeded: true,
          response: {
            statusCode: 200,
            body: {
              status: 'received'
            }
          }
        })
      })

      it('updates the status of the notification to "sent"', async () => {
        await CheckNotificationStatusService.go(notification)

        expect(notificationPatchStub.called).toBe(true)
        expect(notificationPatchStub.firstCall.args[0]).toMatchObject({ notifyStatus: 'received', status: 'sent' })
      })

      it('does not attempt to update anything in licence monitoring stations', async () => {
        await CheckNotificationStatusService.go(notification)

        expect(licenceMonitoringStationPatchStub.called).toBe(false)
      })

      describe('and the contact type was "licence holder" or "single use"', () => {
        it('attempts to set the due date for the linked return log records', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(returnLogPatchStub.called).toBe(true)
          expect(returnLogPatchStub.firstCall.args[0]).toMatchObject({
            dueDate: notification.dueDate,
            sentDate: notification.createdAt
          })

          expect(returnLogWhereInStub.called).toBe(true)
          expect(returnLogWhereInStub.firstCall.args[0]).toEqual('id')
          expect(returnLogWhereInStub.firstCall.args[1]).toEqual(notification.returnLogIds)
        })
      })

      describe('and the contact type was NOT "licence holder" or "single use"', () => {
        beforeEach(() => {
          notification.contactType = 'returns to'
        })

        it('does not attempt to set the due date for the linked return log records.', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(returnLogPatchStub.called).toBe(false)
        })
      })
    })

    describe('and Notify returns a "failed" status', () => {
      beforeEach(() => {
        Sinon.stub(ViewMessageDataRequest, 'send').resolves({
          succeeded: true,
          response: {
            statusCode: 200,
            body: {
              status: 'temporary-failure'
            }
          }
        })
      })

      it('updates the status of the notification to "error"', async () => {
        await CheckNotificationStatusService.go(notification)

        expect(notificationPatchStub.called).toBe(true)
        expect(notificationPatchStub.firstCall.args[0]).toMatchObject({
          notifyStatus: 'temporary-failure',
          status: 'error'
        })
      })
    })

    describe('and Notify returns an "unknown" status', () => {
      beforeEach(() => {
        Sinon.stub(ViewMessageDataRequest, 'send').resolves({
          succeeded: true,
          response: {
            statusCode: 200,
            body: {
              status: 'unrecognised'
            }
          }
        })
      })

      it('does nothing', async () => {
        await CheckNotificationStatusService.go(notification)

        expect(notificationPatchStub.called).toBe(false)
        expect(licenceMonitoringStationPatchStub.called).toBe(false)
        expect(returnLogPatchStub.called).toBe(false)
      })
    })
  })

  describe('when the notification is a "returns reminder"', () => {
    beforeEach(() => {
      notice = NoticesFixture.returnsReminder()
    })

    describe('and is a letter', () => {
      beforeEach(() => {
        notification = NotificationsFixture.returnsReminderLetter(notice)
        notification.status = 'pending'
      })

      describe('and Notify returns a "pending" status', () => {
        beforeEach(() => {
          // NOTE: The service only uses the `status` field from the Notify result. If you want to see a full
          // representation look at test/requests/notify/view-message-data.request.test.js
          Sinon.stub(ViewMessageDataRequest, 'send').resolves({
            succeeded: true,
            response: {
              statusCode: 200,
              body: {
                status: 'sending'
              }
            }
          })
        })

        it('does nothing', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(notificationPatchStub.called).toBe(false)
          expect(licenceMonitoringStationPatchStub.called).toBe(false)
          expect(returnLogPatchStub.called).toBe(false)
        })
      })

      describe('and Notify returns a "sent" status', () => {
        beforeEach(() => {
          // NOTE: The service only uses the `status` field from the Notify result. If you want to see a full
          // representation look at test/requests/notify/view-message-data.request.test.js
          Sinon.stub(ViewMessageDataRequest, 'send').resolves({
            succeeded: true,
            response: {
              statusCode: 200,
              body: {
                status: 'received'
              }
            }
          })
        })

        it('updates the status of the notification to "sent"', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(notificationPatchStub.called).toBe(true)
          expect(notificationPatchStub.firstCall.args[0]).toMatchObject({ notifyStatus: 'received', status: 'sent' })
        })
      })

      describe('and Notify returns a "failed" status', () => {
        beforeEach(() => {
          Sinon.stub(ViewMessageDataRequest, 'send').resolves({
            succeeded: true,
            response: {
              statusCode: 200,
              body: {
                status: 'temporary-failure'
              }
            }
          })
        })

        it('updates the status of the notification to "error"', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(notificationPatchStub.called).toBe(true)
          expect(notificationPatchStub.firstCall.args[0]).toMatchObject({
            notifyStatus: 'temporary-failure',
            status: 'error'
          })
        })
      })

      describe('and Notify returns an "unknown" status', () => {
        beforeEach(() => {
          Sinon.stub(ViewMessageDataRequest, 'send').resolves({
            succeeded: true,
            response: {
              statusCode: 200,
              body: {
                status: 'unrecognised'
              }
            }
          })
        })

        it('does nothing', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(notificationPatchStub.called).toBe(false)
          expect(licenceMonitoringStationPatchStub.called).toBe(false)
          expect(returnLogPatchStub.called).toBe(false)
        })
      })
    })

    describe('and is an email', () => {
      beforeEach(() => {
        notification = NotificationsFixture.returnsReminderEmail(notice)
        notification.status = 'pending'
      })

      describe('and Notify returns a "pending" status', () => {
        beforeEach(() => {
          Sinon.stub(ViewMessageDataRequest, 'send').resolves({
            succeeded: true,
            response: {
              statusCode: 200,
              body: {
                status: 'created'
              }
            }
          })
        })

        it('does nothing', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(notificationPatchStub.called).toBe(false)
          expect(licenceMonitoringStationPatchStub.called).toBe(false)
          expect(returnLogPatchStub.called).toBe(false)
        })
      })

      describe('and Notify returns a "sent" status', () => {
        beforeEach(() => {
          Sinon.stub(ViewMessageDataRequest, 'send').resolves({
            succeeded: true,
            response: {
              statusCode: 200,
              body: {
                status: 'delivered'
              }
            }
          })
        })

        it('updates the status of the notification to "sent"', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(notificationPatchStub.called).toBe(true)
          expect(notificationPatchStub.firstCall.args[0]).toMatchObject({ notifyStatus: 'delivered', status: 'sent' })
        })
      })

      describe('and Notify returns a "failed" status', () => {
        beforeEach(() => {
          Sinon.stub(ViewMessageDataRequest, 'send').resolves({
            succeeded: true,
            response: {
              statusCode: 200,
              body: {
                status: 'permanent-failure'
              }
            }
          })
        })

        it('updates the status of the notification to "error"', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(notificationPatchStub.called).toBe(true)
          expect(notificationPatchStub.firstCall.args[0]).toMatchObject({
            notifyStatus: 'permanent-failure',
            status: 'error'
          })
        })
      })

      describe('and Notify returns an "unknown" status', () => {
        beforeEach(() => {
          Sinon.stub(ViewMessageDataRequest, 'send').resolves({
            succeeded: true,
            response: {
              statusCode: 200,
              body: {
                status: 'unrecognised'
              }
            }
          })
        })

        it('does nothing', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(notificationPatchStub.called).toBe(false)
          expect(licenceMonitoringStationPatchStub.called).toBe(false)
          expect(returnLogPatchStub.called).toBe(false)
        })
      })
    })
  })

  describe('when checking the notification status fails', () => {
    beforeEach(() => {
      Sinon.stub(ViewMessageDataRequest, 'send').resolves({
        succeeded: false,
        response: {
          statusCode: 404,
          body: {
            errors: [
              {
                error: 'NoResultFound',
                message: 'No result found'
              }
            ],
            status_code: 404
          }
        }
      })
    })

    it('does nothing', async () => {
      await CheckNotificationStatusService.go(notification)

      expect(notificationPatchStub.called).toBe(false)
      expect(licenceMonitoringStationPatchStub.called).toBe(false)
      expect(returnLogPatchStub.called).toBe(false)
    })

    it('logs the failure', async () => {
      await CheckNotificationStatusService.go(notification)

      const errorLogArgs = notifierStub.omfg.firstCall.args

      expect(notifierStub.omfg.calledWith('Check notification status failed')).toBe(true)
      expect(errorLogArgs[1]).toEqual({
        notifyId: notification.notifyId,
        response: {
          statusCode: 404,
          body: {
            errors: [
              {
                error: 'NoResultFound',
                message: 'No result found'
              }
            ],
            status_code: 404
          }
        }
      })
      expect(errorLogArgs[2]).toBeUndefined()
    })
  })

  describe('when persisting the changes fails', () => {
    const error = new Error('Boom')

    beforeEach(() => {
      notice = NoticesFixture.returnsInvitation()
      notification = NotificationsFixture.returnsInvitationEmail(notice)
      notification.status = 'pending'

      Sinon.stub(ViewMessageDataRequest, 'send').resolves({
        succeeded: true,
        response: {
          statusCode: 200,
          body: {
            status: 'delivered'
          }
        }
      })

      returnLogWhereInStub = Sinon.stub().rejects(error)
      Sinon.stub(ReturnLogModel, 'query').returns({
        patch: returnLogPatchStub,
        where: Sinon.stub().returnsThis(),
        whereIn: returnLogWhereInStub
      })
    })

    it('makes no changes and logs the failure', async () => {
      await CheckNotificationStatusService.go(notification)

      const errorLogArgs = notifierStub.omfg.firstCall.args

      expect(notifierStub.omfg.calledWith('Check notification status failed')).toBe(true)
      expect(errorLogArgs[1]).toEqual(notification)
      expect(errorLogArgs[2]).toEqual(error)
    })
  })
})
