// Test framework dependencies

// Test helpers
import * as NoticesFixture from '../../../support/fixtures/notices.fixture.js'
import * as NotificationsFixture from '../../../support/fixtures/notifications.fixture.js'

// Things we need to stub
import * as CheckNotificationStatusService from '../../../../app/services/notifications/check-notification-status.service.js'
import * as FetchNotificationsService from '../../../../app/services/jobs/notification-status/fetch-notifications.service.js'
import GlobalNotifierStub from '../../../support/stubs/global-notifier.stub.js'
import * as SendAlternateNoticesService from '../../../../app/services/jobs/notification-status/send-alternate-notices.service.js'
import * as UpdateNoticeService from '../../../../app/services/notices/update-notice.service.js'

// Thing under test
import ProcessNotificationStatusService from '../../../../app/services/jobs/notification-status/process-notification-status.service.js'

describe('Job - Notifications - Process Notification Status service', () => {
  let noticeA
  let noticeB
  let notifications
  let notifierStub
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

    vi.spyOn(FetchNotificationsService, 'default').mockResolvedValue(notifications)

    vi.spyOn(UpdateNoticeService, 'default').mockResolvedValue()
    vi.spyOn(SendAlternateNoticesService, 'default').mockResolvedValue()

    // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = GlobalNotifierStub()
    globalThis.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete globalThis.GlobalNotifier
  })

  describe('when the notification status check does not error', () => {
    beforeEach(() => {
      vi.spyOn(CheckNotificationStatusService, 'default').mockResolvedValue()
    })

    it('updates the linked notices overall status and counts', async () => {
      await ProcessNotificationStatusService()

      expect(UpdateNoticeService.default).toHaveBeenCalled()
      expect(UpdateNoticeService.default.mock.calls[0][0]).toEqual([noticeA.id, noticeB.id])
    })

    it('checks whether any alternate notices need to be sent', async () => {
      await ProcessNotificationStatusService()

      expect(SendAlternateNoticesService.default).toHaveBeenCalled()
      expect(SendAlternateNoticesService.default.mock.calls[0][0]).toEqual(notifications)
    })

    it('logs the time taken in milliseconds and seconds', async () => {
      await ProcessNotificationStatusService()

      const logDataArg = notifierStub.omg.mock.calls[0][1]

      expect(notifierStub.omg).toHaveBeenCalledWith('Notification status job complete')
      expect(logDataArg.timeTakenMs).toBeDefined()
      expect(logDataArg.timeTakenSs).toBeDefined()
      expect(logDataArg.count).toEqual(3)
    })
  })

  describe('when the notification status check errors', () => {
    beforeEach(() => {
      vi.spyOn(CheckNotificationStatusService, 'default').mockRejectedValue()
    })

    it('does not update the linked notices', async () => {
      await ProcessNotificationStatusService()

      expect(UpdateNoticeService.default).not.toHaveBeenCalled()
    })

    it('records the error by calling "omfg()"', async () => {
      await ProcessNotificationStatusService()

      const args = notifierStub.omfg.mock.calls[0]

      expect(args[0]).toEqual('Notification status job failed')
      expect(args[1]).toBeNull()
      expect(args[2]).toBeInstanceOf(Error)
    })

    it('notifies the team by calling "redAlert()"', async () => {
      await ProcessNotificationStatusService()

      const args = notifierStub.redAlert.mock.calls[0]

      expect(args[0]).toEqual('Notification status job failed')
    })

    it('does not throw an error', async () => {
      await ProcessNotificationStatusService()
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
