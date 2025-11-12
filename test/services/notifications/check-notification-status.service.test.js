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
const ViewMessageDataRequest = require('../../../app/requests/notify/view-message-data.request.js')

// Thing under test
const CheckNotificationStatusService = require('../../../app/services/notifications/check-notification-status.service.js')

describe('Notifications - Check Notification Status service', () => {
  let licenceMonitoringStationPatchStub
  let notice
  let notification
  let notificationPatchStub
  let notifierStub

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

    notifierStub = { omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    delete global.GlobalNotifier
  })

  describe('when the notification is a letter', () => {
    beforeEach(() => {
      notice = NoticesFixture.returnsInvitation()
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
        expect(notificationPatchStub.firstCall.args[0]).to.equal({ notifyStatus: 'received', status: 'sent' })
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
        expect(notificationPatchStub.firstCall.args[0]).to.equal({ notifyStatus: 'temporary-failure', status: 'error' })
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
      })
    })
  })

  describe('when the notification is an email', () => {
    beforeEach(() => {
      // NOTE: No reason to change from an invitation to a reminder. But we also figured why not!?
      notice = NoticesFixture.returnsReminder()
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
        expect(notificationPatchStub.firstCall.args[0]).to.equal({ notifyStatus: 'delivered', status: 'sent' })
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
        expect(notificationPatchStub.firstCall.args[0]).to.equal({ notifyStatus: 'permanent-failure', status: 'error' })
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
      })
    })
  })

  describe('when the notification is an abstraction alert', () => {
    beforeEach(() => {
      notice = NoticesFixture.alertStop()
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
        expect(notificationPatchStub.firstCall.args[0]).to.equal({ notifyStatus: 'delivered', status: 'sent' })
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
        expect(notificationPatchStub.firstCall.args[0]).to.equal({ notifyStatus: 'technical-failure', status: 'error' })
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
    })

    it('logs the failure', async () => {
      await CheckNotificationStatusService.go(notification)

      const errorLogArgs = notifierStub.omfg.firstCall.args

      expect(notifierStub.omfg.calledWith('Failed to check Notify status')).to.be.true()
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
})
