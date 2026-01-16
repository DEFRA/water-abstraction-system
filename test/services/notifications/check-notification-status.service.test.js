'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const NoticesFixture = require('../../fixtures/notices.fixture.js')
const NotificationsFixture = require('../../fixtures/notifications.fixture.js')

// Things we need to stub
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

    notifierStub = { omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    delete global.GlobalNotifier
  })

  describe('when the notification is a returns invitation', () => {
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

          expect(notificationPatchStub.called).to.be.false()
          expect(licenceMonitoringStationPatchStub.called).to.be.false()
          expect(returnLogPatchStub.called).to.be.false()
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

          expect(notificationPatchStub.called).to.be.true()
          expect(notificationPatchStub.firstCall.args[0]).to.equal(
            { notifyStatus: 'received', status: 'sent' },
            { skip: ['updatedAt'] }
          )
        })

        it('does not attempt to update anything in licence monitoring stations', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(licenceMonitoringStationPatchStub.called).to.be.false()
        })

        describe('and the contact type was "licence holder" or "single use"', () => {
          it('attempts to set the due date for the linked return log records', async () => {
            await CheckNotificationStatusService.go(notification)

            expect(returnLogPatchStub.called).to.be.true()
            expect(returnLogPatchStub.firstCall.args[0]).to.equal(
              { dueDate: notification.dueDate, sentDate: notification.createdAt },
              { skip: ['updatedAt'] }
            )

            expect(returnLogWhereInStub.called).to.be.true()
            expect(returnLogWhereInStub.firstCall.args[0]).to.equal('id')
            expect(returnLogWhereInStub.firstCall.args[1]).to.equal(notification.returnLogIds)
          })
        })

        describe('and the contact type was NOT "licence holder" or "single use"', () => {
          beforeEach(() => {
            notification.contactType = 'returns to'
          })

          it('does not attempt to set the due date for the linked return log records.', async () => {
            await CheckNotificationStatusService.go(notification)

            expect(returnLogPatchStub.called).to.be.false()
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

          expect(notificationPatchStub.called).to.be.true()
          expect(notificationPatchStub.firstCall.args[0]).to.equal(
            { notifyStatus: 'temporary-failure', status: 'error' },
            { skip: ['updatedAt'] }
          )
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

          expect(notificationPatchStub.called).to.be.false()
          expect(licenceMonitoringStationPatchStub.called).to.be.false()
          expect(returnLogPatchStub.called).to.be.false()
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

          expect(notificationPatchStub.called).to.be.false()
          expect(licenceMonitoringStationPatchStub.called).to.be.false()
          expect(returnLogPatchStub.called).to.be.false()
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

          expect(notificationPatchStub.called).to.be.true()
          expect(notificationPatchStub.firstCall.args[0]).to.equal(
            { notifyStatus: 'delivered', status: 'sent' },
            { skip: ['updatedAt'] }
          )
        })

        it('does not attempt to update anything in licence monitoring stations', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(licenceMonitoringStationPatchStub.called).to.be.false()
        })

        describe('and the contact type was "primary user" or "single use"', () => {
          it('attempts to set the due date for the linked return log records', async () => {
            await CheckNotificationStatusService.go(notification)

            expect(returnLogPatchStub.called).to.be.true()
            expect(returnLogPatchStub.firstCall.args[0]).to.equal(
              { dueDate: notification.dueDate, sentDate: notification.createdAt },
              { skip: ['updatedAt'] }
            )

            expect(returnLogWhereInStub.called).to.be.true()
            expect(returnLogWhereInStub.firstCall.args[0]).to.equal('id')
            expect(returnLogWhereInStub.firstCall.args[1]).to.equal(notification.returnLogIds)
          })
        })

        describe('and the contact type was NOT "primary user" or "single use"', () => {
          beforeEach(() => {
            notification.contactType = 'returns agent'
          })

          it('does not attempt to set the due date for the linked return log records.', async () => {
            await CheckNotificationStatusService.go(notification)

            expect(returnLogPatchStub.called).to.be.false()
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

          expect(notificationPatchStub.called).to.be.true()
          expect(notificationPatchStub.firstCall.args[0]).to.equal(
            { notifyStatus: 'permanent-failure', status: 'error' },
            { skip: ['updatedAt'] }
          )
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

          expect(notificationPatchStub.called).to.be.false()
          expect(licenceMonitoringStationPatchStub.called).to.be.false()
          expect(returnLogPatchStub.called).to.be.false()
        })
      })
    })
  })

  describe('when the notification is a returns reminder', () => {
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

          expect(notificationPatchStub.called).to.be.false()
          expect(licenceMonitoringStationPatchStub.called).to.be.false()
          expect(returnLogPatchStub.called).to.be.false()
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

          expect(notificationPatchStub.called).to.be.true()
          expect(notificationPatchStub.firstCall.args[0]).to.equal(
            { notifyStatus: 'received', status: 'sent' },
            { skip: ['updatedAt'] }
          )
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

          expect(notificationPatchStub.called).to.be.true()
          expect(notificationPatchStub.firstCall.args[0]).to.equal(
            { notifyStatus: 'temporary-failure', status: 'error' },
            { skip: ['updatedAt'] }
          )
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

          expect(notificationPatchStub.called).to.be.false()
          expect(licenceMonitoringStationPatchStub.called).to.be.false()
          expect(returnLogPatchStub.called).to.be.false()
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

          expect(notificationPatchStub.called).to.be.false()
          expect(licenceMonitoringStationPatchStub.called).to.be.false()
          expect(returnLogPatchStub.called).to.be.false()
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

          expect(notificationPatchStub.called).to.be.true()
          expect(notificationPatchStub.firstCall.args[0]).to.equal(
            { notifyStatus: 'delivered', status: 'sent' },
            { skip: ['updatedAt'] }
          )
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

          expect(notificationPatchStub.called).to.be.true()
          expect(notificationPatchStub.firstCall.args[0]).to.equal(
            { notifyStatus: 'permanent-failure', status: 'error' },
            { skip: ['updatedAt'] }
          )
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

          expect(notificationPatchStub.called).to.be.false()
          expect(licenceMonitoringStationPatchStub.called).to.be.false()
          expect(returnLogPatchStub.called).to.be.false()
        })
      })
    })
  })

  describe('when the notification is an abstraction alert', () => {
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

          expect(notificationPatchStub.called).to.be.false()
          expect(licenceMonitoringStationPatchStub.called).to.be.false()
          expect(returnLogPatchStub.called).to.be.false()
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

          expect(notificationPatchStub.called).to.be.true()
          expect(notificationPatchStub.firstCall.args[0]).to.equal(
            { notifyStatus: 'received', status: 'sent' },
            { skip: ['updatedAt'] }
          )
        })

        it('updates the linked licence monitoring station record', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(licenceMonitoringStationPatchStub.called).to.be.true()
          expect(licenceMonitoringStationPatchStub.firstCall.args[0]).to.equal({
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

          expect(notificationPatchStub.called).to.be.true()
          expect(notificationPatchStub.firstCall.args[0]).to.equal(
            { notifyStatus: 'validation-failed', status: 'error' },
            { skip: ['updatedAt'] }
          )
        })

        it('does not update the linked licence monitoring station record', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(licenceMonitoringStationPatchStub.called).to.be.false()
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

          expect(notificationPatchStub.called).to.be.false()
          expect(licenceMonitoringStationPatchStub.called).to.be.false()
          expect(returnLogPatchStub.called).to.be.false()
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

          expect(notificationPatchStub.called).to.be.false()
          expect(licenceMonitoringStationPatchStub.called).to.be.false()
          expect(returnLogPatchStub.called).to.be.false()
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

          expect(notificationPatchStub.called).to.be.true()
          expect(notificationPatchStub.firstCall.args[0]).to.equal(
            { notifyStatus: 'delivered', status: 'sent' },
            { skip: ['updatedAt'] }
          )
        })

        it('updates the linked licence monitoring station record', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(licenceMonitoringStationPatchStub.called).to.be.true()
          expect(licenceMonitoringStationPatchStub.firstCall.args[0]).to.equal({
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

          expect(notificationPatchStub.called).to.be.true()
          expect(notificationPatchStub.firstCall.args[0]).to.equal(
            { notifyStatus: 'technical-failure', status: 'error' },
            { skip: ['updatedAt'] }
          )
        })

        it('does not update the linked licence monitoring station record', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(licenceMonitoringStationPatchStub.called).to.be.false()
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

          expect(notificationPatchStub.called).to.be.false()
          expect(licenceMonitoringStationPatchStub.called).to.be.false()
          expect(returnLogPatchStub.called).to.be.false()
        })
      })
    })
  })

  describe('when the notification is a paper return', () => {
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

        expect(notificationPatchStub.called).to.be.false()
        expect(licenceMonitoringStationPatchStub.called).to.be.false()
        expect(returnLogPatchStub.called).to.be.false()
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

        expect(notificationPatchStub.called).to.be.true()
        expect(notificationPatchStub.firstCall.args[0]).to.equal(
          { notifyStatus: 'received', status: 'sent' },
          { skip: ['updatedAt'] }
        )
      })

      it('does not attempt to update anything in licence monitoring stations', async () => {
        await CheckNotificationStatusService.go(notification)

        expect(licenceMonitoringStationPatchStub.called).to.be.false()
      })

      describe('and the contact type was "licence holder" or "single use"', () => {
        it('attempts to set the due date for the linked return log records', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(returnLogPatchStub.called).to.be.true()
          expect(returnLogPatchStub.firstCall.args[0]).to.equal(
            { dueDate: notification.dueDate, sentDate: notification.createdAt },
            { skip: ['updatedAt'] }
          )

          expect(returnLogWhereInStub.called).to.be.true()
          expect(returnLogWhereInStub.firstCall.args[0]).to.equal('id')
          expect(returnLogWhereInStub.firstCall.args[1]).to.equal(notification.returnLogIds)
        })
      })

      describe('and the contact type was NOT "licence holder" or "single use"', () => {
        beforeEach(() => {
          notification.contactType = 'returns to'
        })

        it('does not attempt to set the due date for the linked return log records.', async () => {
          await CheckNotificationStatusService.go(notification)

          expect(returnLogPatchStub.called).to.be.false()
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

        expect(notificationPatchStub.called).to.be.true()
        expect(notificationPatchStub.firstCall.args[0]).to.equal(
          { notifyStatus: 'temporary-failure', status: 'error' },
          { skip: ['updatedAt'] }
        )
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

        expect(notificationPatchStub.called).to.be.true()
        expect(notificationPatchStub.firstCall.args[0]).to.equal(
          { notifyStatus: 'cancelled', status: 'cancelled' },
          { skip: ['updatedAt'] }
        )
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

        expect(notificationPatchStub.called).to.be.false()
        expect(licenceMonitoringStationPatchStub.called).to.be.false()
        expect(returnLogPatchStub.called).to.be.false()
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

      expect(notificationPatchStub.called).to.be.false()
      expect(licenceMonitoringStationPatchStub.called).to.be.false()
      expect(returnLogPatchStub.called).to.be.false()
    })

    it('logs the failure', async () => {
      await CheckNotificationStatusService.go(notification)

      const errorLogArgs = notifierStub.omfg.firstCall.args

      expect(notifierStub.omfg.calledWith('Check notification status failed')).to.be.true()
      expect(errorLogArgs[1]).to.equal({
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
      expect(errorLogArgs[2]).to.be.undefined()
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

      expect(notifierStub.omfg.calledWith('Check notification status failed')).to.be.true()
      expect(errorLogArgs[1]).to.equal(notification)
      expect(errorLogArgs[2]).to.equal(error)
    })
  })
})
