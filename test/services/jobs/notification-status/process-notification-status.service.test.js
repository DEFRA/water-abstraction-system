'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const NoticesFixture = require('../../../support/fixtures/notices.fixture.js')
const NotificationsFixture = require('../../../support/fixtures/notifications.fixture.js')

// Things we need to stub
const CheckNotificationStatusService = require('../../../../app/services/notifications/check-notification-status.service.js')
const FetchNotificationsService = require('../../../../app/services/jobs/notification-status/fetch-notifications.service.js')
const UpdateNoticeService = require('../../../../app/services/notices/update-notice.service.js')

// Thing under test
const ProcessNotificationStatusService = require('../../../../app/services/jobs/notification-status/process-notification-status.service.js')

describe('Job - Notifications - Process Notification Status service', () => {
  let noticeA
  let noticeB
  let notifierStub
  let updateEventStub

  beforeEach(async () => {
    const notifications = []

    let notification
    // NOTE: We create multiple notifications a cross two notices so we can demonstrate that we are providing
    // UpdateEventService with a distinct list of notices to update, rather than passing it _every_ notice ID on _every_
    // notification being processed
    noticeA = NoticesFixture.returnsInvitation()

    notification = NotificationsFixture.returnsInvitationLetter(noticeA)
    notification.status = 'pending'
    notifications.push(_transformNotificationToResult(notification))

    notification = NotificationsFixture.returnsInvitationEmail(noticeA)
    notification.status = 'pending'
    notifications.push(_transformNotificationToResult(notification))

    noticeB = NoticesFixture.alertStop()

    notification = NotificationsFixture.abstractionAlertEmail(noticeB)
    notifications.push(_transformNotificationToResult(notification))

    Sinon.stub(FetchNotificationsService, 'go').resolves(notifications)

    updateEventStub = Sinon.stub(UpdateNoticeService, 'go').resolves()

    // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    delete global.GlobalNotifier
  })

  describe('when the notification status check does not error', () => {
    beforeEach(() => {
      Sinon.stub(CheckNotificationStatusService, 'go').resolves()
    })

    it('updates the linked notices overall status and counts', async () => {
      await ProcessNotificationStatusService.go()

      expect(updateEventStub.called).to.be.true()
      expect(updateEventStub.firstCall.args[0]).to.equal([noticeA.id, noticeB.id])
    })

    it('logs the time taken in milliseconds and seconds', async () => {
      await ProcessNotificationStatusService.go()

      const logDataArg = notifierStub.omg.firstCall.args[1]

      expect(notifierStub.omg.calledWith('Notification status job complete')).to.be.true()
      expect(logDataArg.timeTakenMs).to.exist()
      expect(logDataArg.timeTakenSs).to.exist()
      expect(logDataArg.count).to.equal(3)
    })
  })

  describe('when the notification status check errors', () => {
    beforeEach(() => {
      Sinon.stub(CheckNotificationStatusService, 'go').rejects()
    })

    it('does not update the linked notices', async () => {
      await ProcessNotificationStatusService.go()

      expect(updateEventStub.called).to.be.false()
    })

    it('handles the error', async () => {
      await ProcessNotificationStatusService.go()

      const args = notifierStub.omfg.firstCall.args

      expect(args[0]).to.equal('Notification status job failed')
      expect(args[1]).to.be.null()
      expect(args[2]).to.be.an.error()
    })
  })
})

function _transformNotificationToResult(notification) {
  return {
    createdAt: notification.createdAt,
    dueDate: notification.dueDate,
    eventId: notification.eventId,
    id: notification.id,
    licenceMonitoringStationId: notification.licenceMonitoringStationId,
    messageRef: notification.messageRef,
    messageType: notification.messageType,
    notifyId: notification.notifyId,
    notifyStatus: notification.notifyStatus,
    notifyError: notification.notifyError,
    personalisation: notification.personalisation,
    returnLogIds: notification.returnLogIds,
    status: notification.status
  }
}
