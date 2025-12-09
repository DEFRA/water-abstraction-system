'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const NoticesFixture = require('../../../fixtures/notices.fixture.js')
const NotificationHelper = require('../../../support/helpers/notification.helper.js')
const NotificationModel = require('../../../../app/models/notification.model.js')
const NotificationsFixture = require('../../../fixtures/notifications.fixture.js')
const { today } = require('../../../../app/lib/general.lib.js')
const { yesterday } = require('../../../support/general.js')

// Things we need to stub
const notifyConfig = require('../../../../config/notify.config.js')

// Thing under test
const FetchNotificationsService = require('../../../../app/services/jobs/notification-status/fetch-notifications.service.js')

const DAYS_OF_RETENTION = 7

describe('Job - Notification Status - Fetch Notifications service', () => {
  let abstractionAlert
  let notPending
  let olderThanRetentionPeriod
  let returnsInvitation
  let oneDayBeforeRetentionStartDate

  before(async () => {
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
    Sinon.stub(notifyConfig, 'daysOfRetention').value(DAYS_OF_RETENTION)
  })

  afterEach(() => {
    Sinon.restore()
  })

  after(async () => {
    await abstractionAlert.$query().delete()
    await notPending.$query().delete()
    await olderThanRetentionPeriod.$query().delete()
    await returnsInvitation.$query().delete()
  })

  it('returns "pending" notifications created within the Notify retention period', async () => {
    const results = await FetchNotificationsService.go()

    for (const result of results) {
      expect(result.status).to.equal('pending')
      expect(result.createdAt).to.be.at.least(oneDayBeforeRetentionStartDate)
    }
  })

  it('contains the test records we expect and excludes those we do not', async () => {
    const results = await FetchNotificationsService.go()

    expect(results).contains(_transformToResult(returnsInvitation))

    expect(results).contains(_transformToResult(abstractionAlert))

    expect(results).not.contains(_transformToResult(olderThanRetentionPeriod))

    expect(results).not.contains(_transformToResult(notPending))
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
