'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const NoticesFixture = require('../../../support/fixtures/notices.fixture.js')
const NotificationsFixture = require('../../../support/fixtures/notifications.fixture.js')

// Things we need to stub
const CheckNotificationStatusService = require('../../../../app/services/notifications/check-notification-status.service.js')
const FetchNotificationsService = require('../../../../app/services/jobs/notification-status/fetch-notifications.service.js')
const GlobalNotifierStub = require('../../../support/stubs/global-notifier.stub.js')
const SendAlternateNoticesService = require('../../../../app/services/jobs/notification-status/send-alternate-notices.service.js')
const UpdateNoticeService = require('../../../../app/services/notices/update-notice.service.js')

// Thing under test
const ProcessNotificationStatusService = require('../../../../app/services/jobs/notification-status/process-notification-status.service.js')

describe('Job - Notifications - Process Notification Status service', () => {
  let noticeA
  let noticeB
  let notifications
  let notifierStub
  let sendAlternateNoticesStub
  let updateEventStub

  beforeEach(async () => {
    notifications = []

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
    sendAlternateNoticesStub = Sinon.stub(SendAlternateNoticesService, 'go').resolves()

    // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = GlobalNotifierStub.build(Sinon)
    globalThis.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    delete globalThis.GlobalNotifier
  })

  describe('when the notification status check does not error', () => {
    beforeEach(() => {
      Sinon.stub(CheckNotificationStatusService, 'go').resolves()
    })

    it('updates the linked notices overall status and counts', async () => {
      await ProcessNotificationStatusService.go()

      expect(updateEventStub.called).toBe(true)
      expect(updateEventStub.firstCall.args[0]).toEqual([noticeA.id, noticeB.id])
    })

    it('checks whether any alternate notices need to be sent', async () => {
      await ProcessNotificationStatusService.go()

      expect(sendAlternateNoticesStub.called).toBe(true)
      expect(sendAlternateNoticesStub.firstCall.args[0]).toEqual(notifications)
    })

    it('logs the time taken in milliseconds and seconds', async () => {
      await ProcessNotificationStatusService.go()

      const logDataArg = notifierStub.omg.firstCall.args[1]

      expect(notifierStub.omg.calledWith('Notification status job complete')).toBe(true)
      expect(logDataArg.timeTakenMs).toBeDefined()
      expect(logDataArg.timeTakenSs).toBeDefined()
      expect(logDataArg.count).toEqual(3)
    })
  })

  describe('when the notification status check errors', () => {
    beforeEach(() => {
      Sinon.stub(CheckNotificationStatusService, 'go').rejects()
    })

    it('does not update the linked notices', async () => {
      await ProcessNotificationStatusService.go()

      expect(updateEventStub.called).toBe(false)
    })

    it('records the error by calling "omfg()"', async () => {
      await ProcessNotificationStatusService.go()

      const args = notifierStub.omfg.firstCall.args

      expect(args[0]).toEqual('Notification status job failed')
      expect(args[1]).toBeNull()
      expect(args[2]).toBeInstanceOf(Error)
    })

    it('notifies the team by calling "redAlert()"', async () => {
      await ProcessNotificationStatusService.go()

      const args = notifierStub.redAlert.firstCall.args

      expect(args[0]).toEqual('Notification status job failed')
    })

    it('does not throw an error', async () => {
      await ProcessNotificationStatusService.go()
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
