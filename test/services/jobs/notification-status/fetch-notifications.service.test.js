// Test framework
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import NoticesFixture from '../../../support/fixtures/notices.fixture.js'
import NotificationHelper from '../../../support/helpers/notification.helper.js'
import NotificationModel from '../../../../app/models/notification.model.js'
import NotificationsFixture from '../../../support/fixtures/notifications.fixture.js'
import { today } from '../../../../app/lib/general.lib.js'
import { yesterday } from '../../../support/general.js'

// Things we need to stub
import notifyConfig from '../../../../config/notify.config.js'

// Thing under test
import FetchNotificationsService from '../../../../app/services/jobs/notification-status/fetch-notifications.service.js'

const DAYS_OF_RETENTION = 7

describe('Job - Notification Status - Fetch Notifications service', () => {
  let abstractionAlert
  let notPending
  let olderThanRetentionPeriod
  let returnsInvitation
  let oneDayBeforeRetentionStartDate

  beforeAll(async () => {
    const retentionStartDate = today()

    retentionStartDate.setDate(retentionStartDate.getDate() - DAYS_OF_RETENTION)

    oneDayBeforeRetentionStartDate = today()
    oneDayBeforeRetentionStartDate.setDate(oneDayBeforeRetentionStartDate.getDate() - (DAYS_OF_RETENTION + 1))

    let notice = NoticesFixture.returnsInvitation()

    // Created today and is pending - should be in results
    returnsInvitation = await NotificationHelper.add({
      ...NotificationsFixture.returnsInvitationEmail(notice),
      createdAt: today(),
      status: 'pending'
    })

    // Created on the retention start date and is pending - should be in the results
    notice = NoticesFixture.alertStop()
    abstractionAlert = await NotificationHelper.add({
      ...NotificationsFixture.abstractionAlertLetter(notice),
      createdAt: retentionStartDate,
      status: 'pending'
    })

    // Created one day before the retention start date and is pending - should NOT be in the results
    notice = NoticesFixture.legacyHandsOffFlow()
    olderThanRetentionPeriod = await NotificationHelper.add({
      ...NotificationsFixture.legacyHandsOfFlow(notice),
      createdAt: oneDayBeforeRetentionStartDate,
      status: 'pending'
    })

    // Created yesterday and is NOT pending - should NOT be in the results
    notice = NoticesFixture.returnsReminder()
    notPending = await NotificationHelper.add({
      ...NotificationsFixture.returnsReminderLetter(notice),
      createdAt: yesterday(),
      status: 'error'
    })
  })

  beforeEach(() => {
    // As this can change, we stub it so the tests can assert with confidence
    vi.replaceProperty(notifyConfig, 'daysOfRetention', DAYS_OF_RETENTION)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  afterAll(async () => {
    await abstractionAlert.$query().delete()
    await notPending.$query().delete()
    await olderThanRetentionPeriod.$query().delete()
    await returnsInvitation.$query().delete()
  })

  it('returns "pending" notifications created within the Notify retention period', async () => {
    const results = await FetchNotificationsService()

    for (const result of results) {
      expect(result.status).toEqual('pending')
      expect(result.createdAt.getTime()).toBeGreaterThanOrEqual(oneDayBeforeRetentionStartDate.getTime())
    }
  })

  it('contains the test records we expect and excludes those we do not', async () => {
    const results = await FetchNotificationsService()

    expect(results).toContainEqual(_transformToResult(returnsInvitation))

    expect(results).toContainEqual(_transformToResult(abstractionAlert))

    expect(results).not.toContainEqual(_transformToResult(olderThanRetentionPeriod))

    expect(results).not.toContainEqual(_transformToResult(notPending))
  })
})

/**
 * Helper method to transform a test record we've created into a result instance we can then use in our assertions
 *
 * @private
 */
function _transformToResult(notification) {
  return NotificationModel.fromJson({
    contactType: notification.contactType,
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
  })
}
