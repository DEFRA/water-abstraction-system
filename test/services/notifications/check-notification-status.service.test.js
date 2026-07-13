// Test framework dependencies

// Test helpers
import * as NoticesFixture from '../../support/fixtures/notices.fixture.js'
import * as NotificationsFixture from '../../support/fixtures/notifications.fixture.js'

// Things we need to stub
import GlobalNotifierStub from '../../support/stubs/global-notifier.stub.js'
import LicenceMonitoringStationModel from '../../../app/models/licence-monitoring-station.model.js'
import NotificationModel from '../../../app/models/notification.model.js'
import ReturnLogModel from '../../../app/models/return-log.model.js'
import * as ViewMessageDataRequest from '../../../app/requests/notify/view-message-data.request.js'

// Thing under test
import CheckNotificationStatusService from '../../../app/services/notifications/check-notification-status.service.js'

describe('Notifications - Check Notification Status service', () => {
  let licenceMonitoringStationPatchStub
  let notice
  let notification
  let notificationPatchStub
  let notifierStub
  let returnLogPatchStub
  let returnLogWhereInStub

  beforeEach(() => {
    notificationPatchStub = vi.fn().mockReturnThis()
    vi.spyOn(NotificationModel, 'query').mockReturnValue({
      patch: notificationPatchStub,
      findById: vi.fn().mockResolvedValue()
    })

    licenceMonitoringStationPatchStub = vi.fn().mockReturnThis()
    vi.spyOn(LicenceMonitoringStationModel, 'query').mockReturnValue({
      patch: licenceMonitoringStationPatchStub,
      findById: vi.fn().mockResolvedValue()
    })

    returnLogPatchStub = vi.fn().mockReturnThis()

    notifierStub = GlobalNotifierStub()
    globalThis.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    vi.restoreAllMocks()
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
          vi.spyOn(ViewMessageDataRequest, 'send').mockResolvedValue({
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
          await CheckNotificationStatusService(notification)

          expect(notificationPatchStub).not.toHaveBeenCalled()
          expect(licenceMonitoringStationPatchStub).not.toHaveBeenCalled()
          expect(returnLogPatchStub).not.toHaveBeenCalled()
        })
      })

      describe('and Notify returns "sent" status', () => {
        beforeEach(() => {
          vi.spyOn(ViewMessageDataRequest, 'send').mockResolvedValue({
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
          await CheckNotificationStatusService(notification)

          expect(notificationPatchStub).toHaveBeenCalled()
          expect(notificationPatchStub.mock.calls[0][0]).toMatchObject({ notifyStatus: 'received', status: 'sent' })
        })

        it('updates the linked licence monitoring station record', async () => {
          await CheckNotificationStatusService(notification)

          expect(licenceMonitoringStationPatchStub).toHaveBeenCalled()
          expect(licenceMonitoringStationPatchStub.mock.calls[0][0]).toEqual({
            status: notification.personalisation.sending_alert_type,
            statusUpdatedAt: notification.createdAt
          })
        })
      })

      describe('and Notify returns "failed" status', () => {
        beforeEach(() => {
          vi.spyOn(ViewMessageDataRequest, 'send').mockResolvedValue({
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
          await CheckNotificationStatusService(notification)

          expect(notificationPatchStub).toHaveBeenCalled()
          expect(notificationPatchStub.mock.calls[0][0]).toMatchObject({
            notifyStatus: 'validation-failed',
            status: 'error'
          })
        })

        it('does not update the linked licence monitoring station record', async () => {
          await CheckNotificationStatusService(notification)

          expect(licenceMonitoringStationPatchStub).not.toHaveBeenCalled()
        })
      })

      describe('and Notify returns an "unknown" status', () => {
        beforeEach(() => {
          vi.spyOn(ViewMessageDataRequest, 'send').mockResolvedValue({
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
          await CheckNotificationStatusService(notification)

          expect(notificationPatchStub).not.toHaveBeenCalled()
          expect(licenceMonitoringStationPatchStub).not.toHaveBeenCalled()
          expect(returnLogPatchStub).not.toHaveBeenCalled()
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
          vi.spyOn(ViewMessageDataRequest, 'send').mockResolvedValue({
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
          await CheckNotificationStatusService(notification)

          expect(notificationPatchStub).not.toHaveBeenCalled()
          expect(licenceMonitoringStationPatchStub).not.toHaveBeenCalled()
          expect(returnLogPatchStub).not.toHaveBeenCalled()
        })
      })

      describe('and Notify returns "sent" status', () => {
        beforeEach(() => {
          vi.spyOn(ViewMessageDataRequest, 'send').mockResolvedValue({
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
          await CheckNotificationStatusService(notification)

          expect(notificationPatchStub).toHaveBeenCalled()
          expect(notificationPatchStub.mock.calls[0][0]).toMatchObject({ notifyStatus: 'delivered', status: 'sent' })
        })

        it('updates the linked licence monitoring station record', async () => {
          await CheckNotificationStatusService(notification)

          expect(licenceMonitoringStationPatchStub).toHaveBeenCalled()
          expect(licenceMonitoringStationPatchStub.mock.calls[0][0]).toEqual({
            status: notification.personalisation.sending_alert_type,
            statusUpdatedAt: notification.createdAt
          })
        })
      })

      describe('and Notify returns "failed" status', () => {
        beforeEach(() => {
          vi.spyOn(ViewMessageDataRequest, 'send').mockResolvedValue({
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
          await CheckNotificationStatusService(notification)

          expect(notificationPatchStub).toHaveBeenCalled()
          expect(notificationPatchStub.mock.calls[0][0]).toMatchObject({
            notifyStatus: 'technical-failure',
            status: 'error'
          })
        })

        it('does not update the linked licence monitoring station record', async () => {
          await CheckNotificationStatusService(notification)

          expect(licenceMonitoringStationPatchStub).not.toHaveBeenCalled()
        })
      })

      describe('and Notify returns an "unknown" status', () => {
        beforeEach(() => {
          vi.spyOn(ViewMessageDataRequest, 'send').mockResolvedValue({
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
          await CheckNotificationStatusService(notification)

          expect(notificationPatchStub).not.toHaveBeenCalled()
          expect(licenceMonitoringStationPatchStub).not.toHaveBeenCalled()
          expect(returnLogPatchStub).not.toHaveBeenCalled()
        })
      })
    })
  })

  describe('when the notification is a "paper return"', () => {
    beforeEach(() => {
      notice = NoticesFixture.returnsPaperForm()
      notification = NotificationsFixture.paperReturn(notice)
      notification.status = 'pending'

      returnLogWhereInStub = vi.fn().mockResolvedValue()
      vi.spyOn(ReturnLogModel, 'query').mockReturnValue({
        patch: returnLogPatchStub,
        where: vi.fn().mockReturnThis(),
        whereIn: returnLogWhereInStub
      })
    })

    describe('and Notify returns a "pending" status', () => {
      beforeEach(() => {
        // NOTE: The service only uses the `status` field from the Notify result. If you want to see a full
        // representation look at test/requests/notify/view-message-data.request.test.js
        vi.spyOn(ViewMessageDataRequest, 'send').mockResolvedValue({
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
        await CheckNotificationStatusService(notification)

        expect(notificationPatchStub).not.toHaveBeenCalled()
        expect(licenceMonitoringStationPatchStub).not.toHaveBeenCalled()
        expect(returnLogPatchStub).not.toHaveBeenCalled()
      })
    })

    describe('and Notify returns a "sent" status', () => {
      beforeEach(() => {
        // NOTE: The service only uses the `status` field from the Notify result. If you want to see a full
        // representation look at test/requests/notify/view-message-data.request.test.js
        vi.spyOn(ViewMessageDataRequest, 'send').mockResolvedValue({
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
        await CheckNotificationStatusService(notification)

        expect(notificationPatchStub).toHaveBeenCalled()
        expect(notificationPatchStub.mock.calls[0][0]).toMatchObject({ notifyStatus: 'received', status: 'sent' })
      })

      it('does not attempt to update anything in licence monitoring stations', async () => {
        await CheckNotificationStatusService(notification)

        expect(licenceMonitoringStationPatchStub).not.toHaveBeenCalled()
      })

      describe('and the contact type was "licence holder" or "single use"', () => {
        it('attempts to set the due date for the linked return log records', async () => {
          await CheckNotificationStatusService(notification)

          expect(returnLogPatchStub).toHaveBeenCalled()
          expect(returnLogPatchStub.mock.calls[0][0]).toMatchObject({
            dueDate: notification.dueDate,
            sentDate: notification.createdAt
          })

          expect(returnLogWhereInStub).toHaveBeenCalled()
          expect(returnLogWhereInStub.mock.calls[0][0]).toEqual('id')
          expect(returnLogWhereInStub.mock.calls[0][1]).toEqual(notification.returnLogIds)
        })
      })

      describe('and the contact type was NOT "licence holder" or "single use"', () => {
        beforeEach(() => {
          notification.contactType = 'returns to'
        })

        it('does not attempt to set the due date for the linked return log records.', async () => {
          await CheckNotificationStatusService(notification)

          expect(returnLogPatchStub).not.toHaveBeenCalled()
        })
      })
    })

    describe('and Notify returns a "failed" status', () => {
      beforeEach(() => {
        vi.spyOn(ViewMessageDataRequest, 'send').mockResolvedValue({
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
        await CheckNotificationStatusService(notification)

        expect(notificationPatchStub).toHaveBeenCalled()
        expect(notificationPatchStub.mock.calls[0][0]).toMatchObject({
          notifyStatus: 'temporary-failure',
          status: 'error'
        })
      })
    })

    describe('and Notify returns a "cancelled" status', () => {
      beforeEach(() => {
        vi.spyOn(ViewMessageDataRequest, 'send').mockResolvedValue({
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
        await CheckNotificationStatusService(notification)

        expect(notificationPatchStub).toHaveBeenCalled()
        expect(notificationPatchStub.mock.calls[0][0]).toMatchObject({
          notifyStatus: 'cancelled',
          status: 'cancelled'
        })
      })
    })

    describe('and Notify returns an "unknown" status', () => {
      beforeEach(() => {
        vi.spyOn(ViewMessageDataRequest, 'send').mockResolvedValue({
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
        await CheckNotificationStatusService(notification)

        expect(notificationPatchStub).not.toHaveBeenCalled()
        expect(licenceMonitoringStationPatchStub).not.toHaveBeenCalled()
        expect(returnLogPatchStub).not.toHaveBeenCalled()
      })
    })
  })

  describe('when the notification is a "returns invitation"', () => {
    beforeEach(() => {
      notice = NoticesFixture.returnsInvitation()

      returnLogWhereInStub = vi.fn().mockResolvedValue()
      vi.spyOn(ReturnLogModel, 'query').mockReturnValue({
        patch: returnLogPatchStub,
        where: vi.fn().mockReturnThis(),
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
          vi.spyOn(ViewMessageDataRequest, 'send').mockResolvedValue({
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
          await CheckNotificationStatusService(notification)

          expect(notificationPatchStub).not.toHaveBeenCalled()
          expect(licenceMonitoringStationPatchStub).not.toHaveBeenCalled()
          expect(returnLogPatchStub).not.toHaveBeenCalled()
        })
      })

      describe('and Notify returns a "received" status', () => {
        beforeEach(() => {
          // NOTE: The service only uses the `status` field from the Notify result. If you want to see a full
          // representation look at test/requests/notify/view-message-data.request.test.js
          vi.spyOn(ViewMessageDataRequest, 'send').mockResolvedValue({
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
          await CheckNotificationStatusService(notification)

          expect(notificationPatchStub).toHaveBeenCalled()
          expect(notificationPatchStub.mock.calls[0][0]).toMatchObject({ notifyStatus: 'received', status: 'sent' })
        })

        it('does not attempt to update anything in licence monitoring stations', async () => {
          await CheckNotificationStatusService(notification)

          expect(licenceMonitoringStationPatchStub).not.toHaveBeenCalled()
        })

        describe('and the contact type was "licence holder" or "single use"', () => {
          it('attempts to set the due date for the linked return log records', async () => {
            await CheckNotificationStatusService(notification)

            expect(returnLogPatchStub).toHaveBeenCalled()
            expect(returnLogPatchStub.mock.calls[0][0]).toMatchObject({
              dueDate: notification.dueDate,
              sentDate: notification.createdAt
            })

            expect(returnLogWhereInStub).toHaveBeenCalled()
            expect(returnLogWhereInStub.mock.calls[0][0]).toEqual('id')
            expect(returnLogWhereInStub.mock.calls[0][1]).toEqual(notification.returnLogIds)
          })
        })

        describe('and the contact type was NOT "licence holder" or "single use"', () => {
          beforeEach(() => {
            notification.contactType = 'returns to'
          })

          it('does not attempt to set the due date for the linked return log records.', async () => {
            await CheckNotificationStatusService(notification)

            expect(returnLogPatchStub).not.toHaveBeenCalled()
          })
        })
      })

      describe('and Notify returns a "failed" status', () => {
        beforeEach(() => {
          vi.spyOn(ViewMessageDataRequest, 'send').mockResolvedValue({
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
          await CheckNotificationStatusService(notification)

          expect(notificationPatchStub).toHaveBeenCalled()
          expect(notificationPatchStub.mock.calls[0][0]).toMatchObject({
            notifyStatus: 'temporary-failure',
            status: 'error'
          })
        })
      })

      describe('and Notify returns an "unknown" status', () => {
        beforeEach(() => {
          vi.spyOn(ViewMessageDataRequest, 'send').mockResolvedValue({
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
          await CheckNotificationStatusService(notification)

          expect(notificationPatchStub).not.toHaveBeenCalled()
          expect(licenceMonitoringStationPatchStub).not.toHaveBeenCalled()
          expect(returnLogPatchStub).not.toHaveBeenCalled()
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
          vi.spyOn(ViewMessageDataRequest, 'send').mockResolvedValue({
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
          await CheckNotificationStatusService(notification)

          expect(notificationPatchStub).not.toHaveBeenCalled()
          expect(licenceMonitoringStationPatchStub).not.toHaveBeenCalled()
          expect(returnLogPatchStub).not.toHaveBeenCalled()
        })
      })

      describe('and Notify returns a "sent" status', () => {
        beforeEach(() => {
          vi.spyOn(ViewMessageDataRequest, 'send').mockResolvedValue({
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
          await CheckNotificationStatusService(notification)

          expect(notificationPatchStub).toHaveBeenCalled()
          expect(notificationPatchStub.mock.calls[0][0]).toMatchObject({ notifyStatus: 'delivered', status: 'sent' })
        })

        it('does not attempt to update anything in licence monitoring stations', async () => {
          await CheckNotificationStatusService(notification)

          expect(licenceMonitoringStationPatchStub).not.toHaveBeenCalled()
        })

        describe('and the contact type was "primary user" or "single use"', () => {
          it('attempts to set the due date for the linked return log records', async () => {
            await CheckNotificationStatusService(notification)

            expect(returnLogPatchStub).toHaveBeenCalled()
            expect(returnLogPatchStub.mock.calls[0][0]).toMatchObject({
              dueDate: notification.dueDate,
              sentDate: notification.createdAt
            })

            expect(returnLogWhereInStub).toHaveBeenCalled()
            expect(returnLogWhereInStub.mock.calls[0][0]).toEqual('id')
            expect(returnLogWhereInStub.mock.calls[0][1]).toEqual(notification.returnLogIds)
          })
        })

        describe('and the contact type was NOT "primary user" or "single use"', () => {
          beforeEach(() => {
            notification.contactType = 'returns user'
          })

          it('does not attempt to set the due date for the linked return log records.', async () => {
            await CheckNotificationStatusService(notification)

            expect(returnLogPatchStub).not.toHaveBeenCalled()
          })
        })
      })

      describe('and Notify returns a "failed" status', () => {
        beforeEach(() => {
          vi.spyOn(ViewMessageDataRequest, 'send').mockResolvedValue({
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
          await CheckNotificationStatusService(notification)

          expect(notificationPatchStub).toHaveBeenCalled()
          expect(notificationPatchStub.mock.calls[0][0]).toMatchObject({
            notifyStatus: 'permanent-failure',
            status: 'error'
          })
        })
      })

      describe('and Notify returns an "unknown" status', () => {
        beforeEach(() => {
          vi.spyOn(ViewMessageDataRequest, 'send').mockResolvedValue({
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
          await CheckNotificationStatusService(notification)

          expect(notificationPatchStub).not.toHaveBeenCalled()
          expect(licenceMonitoringStationPatchStub).not.toHaveBeenCalled()
          expect(returnLogPatchStub).not.toHaveBeenCalled()
        })
      })
    })
  })

  describe('when the notification is a "returns invitation ad-hoc"', () => {
    beforeEach(() => {
      notice = NoticesFixture.returnsInvitation()

      returnLogWhereInStub = vi.fn().mockResolvedValue()
      vi.spyOn(ReturnLogModel, 'query').mockReturnValue({
        patch: returnLogPatchStub,
        where: vi.fn().mockReturnThis(),
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
          vi.spyOn(ViewMessageDataRequest, 'send').mockResolvedValue({
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
          await CheckNotificationStatusService(notification)

          expect(notificationPatchStub).not.toHaveBeenCalled()
          expect(licenceMonitoringStationPatchStub).not.toHaveBeenCalled()
          expect(returnLogPatchStub).not.toHaveBeenCalled()
        })
      })

      describe('and Notify returns a "received" status', () => {
        beforeEach(() => {
          // NOTE: The service only uses the `status` field from the Notify result. If you want to see a full
          // representation look at test/requests/notify/view-message-data.request.test.js
          vi.spyOn(ViewMessageDataRequest, 'send').mockResolvedValue({
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
          await CheckNotificationStatusService(notification)

          expect(notificationPatchStub).toHaveBeenCalled()
          expect(notificationPatchStub.mock.calls[0][0]).toMatchObject({ notifyStatus: 'received', status: 'sent' })
        })

        it('does not attempt to update anything in licence monitoring stations', async () => {
          await CheckNotificationStatusService(notification)

          expect(licenceMonitoringStationPatchStub).not.toHaveBeenCalled()
        })

        describe('and the contact type was "licence holder" or "single use"', () => {
          it('attempts to set the due date for the linked return log records', async () => {
            await CheckNotificationStatusService(notification)

            expect(returnLogPatchStub).toHaveBeenCalled()
            expect(returnLogPatchStub.mock.calls[0][0]).toMatchObject({
              dueDate: notification.dueDate,
              sentDate: notification.createdAt
            })

            expect(returnLogWhereInStub).toHaveBeenCalled()
            expect(returnLogWhereInStub.mock.calls[0][0]).toEqual('id')
            expect(returnLogWhereInStub.mock.calls[0][1]).toEqual(notification.returnLogIds)
          })
        })

        describe('and the contact type was NOT "licence holder" or "single use"', () => {
          beforeEach(() => {
            notification.contactType = 'returns to'
          })

          it('does not attempt to set the due date for the linked return log records.', async () => {
            await CheckNotificationStatusService(notification)

            expect(returnLogPatchStub).not.toHaveBeenCalled()
          })
        })
      })

      describe('and Notify returns a "failed" status', () => {
        beforeEach(() => {
          vi.spyOn(ViewMessageDataRequest, 'send').mockResolvedValue({
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
          await CheckNotificationStatusService(notification)

          expect(notificationPatchStub).toHaveBeenCalled()
          expect(notificationPatchStub.mock.calls[0][0]).toMatchObject({
            notifyStatus: 'temporary-failure',
            status: 'error'
          })
        })
      })

      describe('and Notify returns an "unknown" status', () => {
        beforeEach(() => {
          vi.spyOn(ViewMessageDataRequest, 'send').mockResolvedValue({
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
          await CheckNotificationStatusService(notification)

          expect(notificationPatchStub).not.toHaveBeenCalled()
          expect(licenceMonitoringStationPatchStub).not.toHaveBeenCalled()
          expect(returnLogPatchStub).not.toHaveBeenCalled()
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
          vi.spyOn(ViewMessageDataRequest, 'send').mockResolvedValue({
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
          await CheckNotificationStatusService(notification)

          expect(notificationPatchStub).not.toHaveBeenCalled()
          expect(licenceMonitoringStationPatchStub).not.toHaveBeenCalled()
          expect(returnLogPatchStub).not.toHaveBeenCalled()
        })
      })

      describe('and Notify returns a "sent" status', () => {
        beforeEach(() => {
          vi.spyOn(ViewMessageDataRequest, 'send').mockResolvedValue({
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
          await CheckNotificationStatusService(notification)

          expect(notificationPatchStub).toHaveBeenCalled()
          expect(notificationPatchStub.mock.calls[0][0]).toMatchObject({ notifyStatus: 'delivered', status: 'sent' })
        })

        it('does not attempt to update anything in licence monitoring stations', async () => {
          await CheckNotificationStatusService(notification)

          expect(licenceMonitoringStationPatchStub).not.toHaveBeenCalled()
        })

        describe('and the contact type was "primary user" or "single use"', () => {
          it('attempts to set the due date for the linked return log records', async () => {
            await CheckNotificationStatusService(notification)

            expect(returnLogPatchStub).toHaveBeenCalled()
            expect(returnLogPatchStub.mock.calls[0][0]).toMatchObject({
              dueDate: notification.dueDate,
              sentDate: notification.createdAt
            })

            expect(returnLogWhereInStub).toHaveBeenCalled()
            expect(returnLogWhereInStub.mock.calls[0][0]).toEqual('id')
            expect(returnLogWhereInStub.mock.calls[0][1]).toEqual(notification.returnLogIds)
          })
        })

        describe('and the contact type was NOT "primary user" or "single use"', () => {
          beforeEach(() => {
            notification.contactType = 'returns user'
          })

          it('does not attempt to set the due date for the linked return log records.', async () => {
            await CheckNotificationStatusService(notification)

            expect(returnLogPatchStub).not.toHaveBeenCalled()
          })
        })
      })

      describe('and Notify returns a "failed" status', () => {
        beforeEach(() => {
          vi.spyOn(ViewMessageDataRequest, 'send').mockResolvedValue({
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
          await CheckNotificationStatusService(notification)

          expect(notificationPatchStub).toHaveBeenCalled()
          expect(notificationPatchStub.mock.calls[0][0]).toMatchObject({
            notifyStatus: 'permanent-failure',
            status: 'error'
          })
        })
      })

      describe('and Notify returns an "unknown" status', () => {
        beforeEach(() => {
          vi.spyOn(ViewMessageDataRequest, 'send').mockResolvedValue({
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
          await CheckNotificationStatusService(notification)

          expect(notificationPatchStub).not.toHaveBeenCalled()
          expect(licenceMonitoringStationPatchStub).not.toHaveBeenCalled()
          expect(returnLogPatchStub).not.toHaveBeenCalled()
        })
      })
    })
  })

  describe('when the notification is a "returns invitation alternate"', () => {
    beforeEach(() => {
      notice = NoticesFixture.returnsInvitation()

      returnLogWhereInStub = vi.fn().mockResolvedValue()
      vi.spyOn(ReturnLogModel, 'query').mockReturnValue({
        patch: returnLogPatchStub,
        where: vi.fn().mockReturnThis(),
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
        vi.spyOn(ViewMessageDataRequest, 'send').mockResolvedValue({
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
        await CheckNotificationStatusService(notification)

        expect(notificationPatchStub).not.toHaveBeenCalled()
        expect(licenceMonitoringStationPatchStub).not.toHaveBeenCalled()
        expect(returnLogPatchStub).not.toHaveBeenCalled()
      })
    })

    describe('and Notify returns a "received" status', () => {
      beforeEach(() => {
        // NOTE: The service only uses the `status` field from the Notify result. If you want to see a full
        // representation look at test/requests/notify/view-message-data.request.test.js
        vi.spyOn(ViewMessageDataRequest, 'send').mockResolvedValue({
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
        await CheckNotificationStatusService(notification)

        expect(notificationPatchStub).toHaveBeenCalled()
        expect(notificationPatchStub.mock.calls[0][0]).toMatchObject({ notifyStatus: 'received', status: 'sent' })
      })

      it('does not attempt to update anything in licence monitoring stations', async () => {
        await CheckNotificationStatusService(notification)

        expect(licenceMonitoringStationPatchStub).not.toHaveBeenCalled()
      })

      describe('and the contact type was "licence holder" or "single use"', () => {
        it('attempts to set the due date for the linked return log records', async () => {
          await CheckNotificationStatusService(notification)

          expect(returnLogPatchStub).toHaveBeenCalled()
          expect(returnLogPatchStub.mock.calls[0][0]).toMatchObject({
            dueDate: notification.dueDate,
            sentDate: notification.createdAt
          })

          expect(returnLogWhereInStub).toHaveBeenCalled()
          expect(returnLogWhereInStub.mock.calls[0][0]).toEqual('id')
          expect(returnLogWhereInStub.mock.calls[0][1]).toEqual(notification.returnLogIds)
        })
      })

      describe('and the contact type was NOT "licence holder" or "single use"', () => {
        beforeEach(() => {
          notification.contactType = 'returns to'
        })

        it('does not attempt to set the due date for the linked return log records.', async () => {
          await CheckNotificationStatusService(notification)

          expect(returnLogPatchStub).not.toHaveBeenCalled()
        })
      })
    })

    describe('and Notify returns a "failed" status', () => {
      beforeEach(() => {
        vi.spyOn(ViewMessageDataRequest, 'send').mockResolvedValue({
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
        await CheckNotificationStatusService(notification)

        expect(notificationPatchStub).toHaveBeenCalled()
        expect(notificationPatchStub.mock.calls[0][0]).toMatchObject({
          notifyStatus: 'temporary-failure',
          status: 'error'
        })
      })
    })

    describe('and Notify returns an "unknown" status', () => {
      beforeEach(() => {
        vi.spyOn(ViewMessageDataRequest, 'send').mockResolvedValue({
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
        await CheckNotificationStatusService(notification)

        expect(notificationPatchStub).not.toHaveBeenCalled()
        expect(licenceMonitoringStationPatchStub).not.toHaveBeenCalled()
        expect(returnLogPatchStub).not.toHaveBeenCalled()
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
          vi.spyOn(ViewMessageDataRequest, 'send').mockResolvedValue({
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
          await CheckNotificationStatusService(notification)

          expect(notificationPatchStub).not.toHaveBeenCalled()
          expect(licenceMonitoringStationPatchStub).not.toHaveBeenCalled()
          expect(returnLogPatchStub).not.toHaveBeenCalled()
        })
      })

      describe('and Notify returns a "sent" status', () => {
        beforeEach(() => {
          // NOTE: The service only uses the `status` field from the Notify result. If you want to see a full
          // representation look at test/requests/notify/view-message-data.request.test.js
          vi.spyOn(ViewMessageDataRequest, 'send').mockResolvedValue({
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
          await CheckNotificationStatusService(notification)

          expect(notificationPatchStub).toHaveBeenCalled()
          expect(notificationPatchStub.mock.calls[0][0]).toMatchObject({ notifyStatus: 'received', status: 'sent' })
        })
      })

      describe('and Notify returns a "failed" status', () => {
        beforeEach(() => {
          vi.spyOn(ViewMessageDataRequest, 'send').mockResolvedValue({
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
          await CheckNotificationStatusService(notification)

          expect(notificationPatchStub).toHaveBeenCalled()
          expect(notificationPatchStub.mock.calls[0][0]).toMatchObject({
            notifyStatus: 'temporary-failure',
            status: 'error'
          })
        })
      })

      describe('and Notify returns an "unknown" status', () => {
        beforeEach(() => {
          vi.spyOn(ViewMessageDataRequest, 'send').mockResolvedValue({
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
          await CheckNotificationStatusService(notification)

          expect(notificationPatchStub).not.toHaveBeenCalled()
          expect(licenceMonitoringStationPatchStub).not.toHaveBeenCalled()
          expect(returnLogPatchStub).not.toHaveBeenCalled()
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
          vi.spyOn(ViewMessageDataRequest, 'send').mockResolvedValue({
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
          await CheckNotificationStatusService(notification)

          expect(notificationPatchStub).not.toHaveBeenCalled()
          expect(licenceMonitoringStationPatchStub).not.toHaveBeenCalled()
          expect(returnLogPatchStub).not.toHaveBeenCalled()
        })
      })

      describe('and Notify returns a "sent" status', () => {
        beforeEach(() => {
          vi.spyOn(ViewMessageDataRequest, 'send').mockResolvedValue({
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
          await CheckNotificationStatusService(notification)

          expect(notificationPatchStub).toHaveBeenCalled()
          expect(notificationPatchStub.mock.calls[0][0]).toMatchObject({ notifyStatus: 'delivered', status: 'sent' })
        })
      })

      describe('and Notify returns a "failed" status', () => {
        beforeEach(() => {
          vi.spyOn(ViewMessageDataRequest, 'send').mockResolvedValue({
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
          await CheckNotificationStatusService(notification)

          expect(notificationPatchStub).toHaveBeenCalled()
          expect(notificationPatchStub.mock.calls[0][0]).toMatchObject({
            notifyStatus: 'permanent-failure',
            status: 'error'
          })
        })
      })

      describe('and Notify returns an "unknown" status', () => {
        beforeEach(() => {
          vi.spyOn(ViewMessageDataRequest, 'send').mockResolvedValue({
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
          await CheckNotificationStatusService(notification)

          expect(notificationPatchStub).not.toHaveBeenCalled()
          expect(licenceMonitoringStationPatchStub).not.toHaveBeenCalled()
          expect(returnLogPatchStub).not.toHaveBeenCalled()
        })
      })
    })
  })

  describe('when checking the notification status fails', () => {
    beforeEach(() => {
      vi.spyOn(ViewMessageDataRequest, 'send').mockResolvedValue({
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
      await CheckNotificationStatusService(notification)

      expect(notificationPatchStub).not.toHaveBeenCalled()
      expect(licenceMonitoringStationPatchStub).not.toHaveBeenCalled()
      expect(returnLogPatchStub).not.toHaveBeenCalled()
    })

    it('logs the failure', async () => {
      await CheckNotificationStatusService(notification)

      const errorLogArgs = notifierStub.omfg.mock.calls[0]

      expect(notifierStub.omfg).toHaveBeenCalledWith('Check notification status failed', expect.any(Object))
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

      vi.spyOn(ViewMessageDataRequest, 'send').mockResolvedValue({
        succeeded: true,
        response: {
          statusCode: 200,
          body: {
            status: 'delivered'
          }
        }
      })

      returnLogWhereInStub = vi.fn().mockRejectedValue(error)
      vi.spyOn(ReturnLogModel, 'query').mockReturnValue({
        patch: returnLogPatchStub,
        where: vi.fn().mockReturnThis(),
        whereIn: returnLogWhereInStub
      })
    })

    it('makes no changes and logs the failure', async () => {
      await CheckNotificationStatusService(notification)

      const errorLogArgs = notifierStub.omfg.mock.calls[0]

      expect(notifierStub.omfg).toHaveBeenCalledWith('Check notification status failed', notification, error)
      expect(errorLogArgs[1]).toEqual(notification)
      expect(errorLogArgs[2]).toEqual(error)
    })
  })
})
