// Test helpers
import * as NoticesFixture from '../../../support/fixtures/notices.fixture.js'
import * as NotificationsFixture from '../../../support/fixtures/notifications.fixture.js'
import EventHelper from '../../../support/helpers/event.helper.js'
import EventModel from '../../../../app/models/event.model.js'
import NotificationHelper from '../../../support/helpers/notification.helper.js'

// Thing under test
import FetchCriticalNoticesDal from '../../../../app/dal/jobs/notification-status/fetch-critical-notices.dal.js'

describe('Jobs - Notification Status - Fetch Critical Notices DAL', () => {
  let criticalNoticeWithErrors
  let criticalNoticeWithoutErrors
  let noticeIds
  let notificationForCriticalNoticeWithErrors
  let notificationForCriticalNoticeWithoutErrors
  let notificationForStandardNoticeWithErrors
  let notificationForStandardNoticeWithoutErrors
  let standardNoticeWithErrors
  let standardNoticeWithoutErrors

  beforeAll(async () => {
    // Scenario 1: Critical notice with notifications that have errors. This should be return by the DAL
    let noticeData = NoticesFixture.renewalInvitation()

    noticeData.metadata.recipients = 1
    noticeData.overallStatus = 'error'
    noticeData.statusCounts = { cancelled: 0, error: 1, pending: 0, returned: 0, sent: 0 }

    criticalNoticeWithErrors = await EventHelper.add(noticeData)

    let notificationData = NotificationsFixture.renewalInvitationEmail(criticalNoticeWithErrors)
    notificationData.status = 'error'

    notificationForCriticalNoticeWithErrors = await NotificationHelper.add(notificationData)

    // Scenario 2: Standard notice with notifications that have errors. This should NOT be returned by the DAL
    noticeData = NoticesFixture.returnsReminder()

    noticeData.metadata.recipients = 1
    noticeData.overallStatus = 'error'
    noticeData.statusCounts = { cancelled: 0, error: 1, pending: 0, returned: 0, sent: 0 }

    standardNoticeWithErrors = await EventHelper.add(noticeData)

    notificationData = NotificationsFixture.returnsReminderEmail(standardNoticeWithErrors)
    notificationData.status = 'error'

    notificationForStandardNoticeWithErrors = await NotificationHelper.add(notificationData)

    // Scenario 3: Critical notice with notifications that were successful. This should NOT be returned by the DAL
    noticeData = NoticesFixture.returnsInvitation()
    noticeData.overallStatus = 'sent'
    noticeData.statusCounts = { cancelled: 0, error: 0, pending: 0, returned: 0, sent: 1 }

    criticalNoticeWithoutErrors = await EventHelper.add(noticeData)

    notificationData = NotificationsFixture.returnsInvitationEmail(criticalNoticeWithoutErrors)
    notificationForCriticalNoticeWithoutErrors = await NotificationHelper.add(notificationData)

    // Scenario 4: Standard notice with notifications that were successful. This should NOT be returned by the DAL
    noticeData = NoticesFixture.returnsPaperForm()
    noticeData.overallStatus = 'sent'
    noticeData.statusCounts = { cancelled: 0, error: 0, pending: 0, returned: 0, sent: 1 }

    standardNoticeWithoutErrors = await EventHelper.add(noticeData)

    notificationData = NotificationsFixture.returnsReminderEmail(standardNoticeWithoutErrors)
    notificationForStandardNoticeWithoutErrors = await NotificationHelper.add(notificationData)

    noticeIds = [
      criticalNoticeWithErrors.id,
      standardNoticeWithErrors.id,
      criticalNoticeWithoutErrors.id,
      standardNoticeWithoutErrors.id
    ]
  })

  afterAll(async () => {
    await notificationForCriticalNoticeWithErrors.$query().delete()
    await notificationForCriticalNoticeWithoutErrors.$query().delete()
    await notificationForStandardNoticeWithErrors.$query().delete()
    await notificationForStandardNoticeWithoutErrors.$query().delete()
    await criticalNoticeWithErrors.$query().delete()
    await criticalNoticeWithoutErrors.$query().delete()
    await standardNoticeWithErrors.$query().delete()
    await standardNoticeWithoutErrors.$query().delete()
  })

  describe('when called', () => {
    it('returns only the critical notices that have notifications with errors from those request (scenario 1)', async () => {
      const results = await FetchCriticalNoticesDal(noticeIds)

      expect(results).toContainEqual(
        EventModel.fromJson({
          id: criticalNoticeWithErrors.id,
          issuer: criticalNoticeWithErrors.issuer,
          metadata: criticalNoticeWithErrors.metadata,
          subtype: criticalNoticeWithErrors.subtype
        })
      )

      // Scenario 2
      expect(results).not.toContainEqual(
        EventModel.fromJson({
          id: standardNoticeWithErrors.id,
          issuer: standardNoticeWithErrors.issuer,
          metadata: standardNoticeWithErrors.metadata,
          subtype: standardNoticeWithErrors.subtype
        })
      )

      // Scenario 3
      expect(results).not.toContain(
        EventModel.fromJson({
          id: criticalNoticeWithoutErrors.id,
          issuer: criticalNoticeWithoutErrors.issuer,
          metadata: criticalNoticeWithoutErrors.metadata,
          subtype: criticalNoticeWithoutErrors.subtype
        })
      )

      // Scenario 4
      expect(results).not.toContain(
        EventModel.fromJson({
          id: standardNoticeWithoutErrors.id,
          issuer: standardNoticeWithoutErrors.issuer,
          metadata: standardNoticeWithoutErrors.metadata,
          subtype: standardNoticeWithoutErrors.subtype
        })
      )
    })
  })
})
