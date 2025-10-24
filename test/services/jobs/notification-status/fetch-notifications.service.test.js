'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const NoticesFixture = require('../../../fixtures/notices.fixture.js')
const NotificationHelper = require('../../../support/helpers/notification.helper.js')
const NotificationModel = require('../../../../app/models/notification.model.js')
const NotificationsFixture = require('../../../fixtures/notifications.fixture.js')
const { today } = require('../../../../app/lib/general.lib.js')
const { yesterday } = require('../../../support/general.js')

// Thing under test
const FetchNotificationsService = require('../../../../app/services/jobs/notification-status/fetch-notifications.service.js')

describe('Job - Notification Status - Fetch Notifications service', () => {
  let abstractionAlert
  let notPending
  let olderThanRetentionPeriod
  let returnsInvitation
  let startOfRetentionPeriod

  before(async () => {
    startOfRetentionPeriod = today()
    startOfRetentionPeriod.setDate(startOfRetentionPeriod.getDate() - 7)

    let notice = NoticesFixture.returnsInvitation()

    returnsInvitation = await NotificationHelper.add({
      ...NotificationsFixture.returnsInvitationEmail(notice),
      createdAt: today(),
      status: 'pending'
    })

    notice = NoticesFixture.alertStop()
    abstractionAlert = await NotificationHelper.add({
      ...NotificationsFixture.abstractionAlertLetter(notice),
      createdAt: yesterday(),
      status: 'pending'
    })

    notice = NoticesFixture.legacyHandsOffFlow()
    olderThanRetentionPeriod = await NotificationHelper.add({
      ...NotificationsFixture.legacyHandsOfFlow(notice),
      createdAt: new Date('2023-04-01'),
      status: 'pending'
    })

    notice = NoticesFixture.returnsReminder()
    notPending = await NotificationHelper.add({
      ...NotificationsFixture.returnsReminderLetter(notice),
      createdAt: yesterday(),
      status: 'error'
    })
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
      expect(result.createdAt).to.be.at.least(startOfRetentionPeriod)
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
    createdAt: notification.createdAt,
    eventId: notification.eventId,
    id: notification.id,
    licenceMonitoringStationId: notification.licenceMonitoringStationId,
    messageRef: notification.messageRef,
    messageType: notification.messageType,
    notifyId: notification.notifyId,
    notifyStatus: notification.notifyStatus,
    notifyError: notification.notifyError,
    personalisation: notification.personalisation,
    status: notification.status
  })
}
