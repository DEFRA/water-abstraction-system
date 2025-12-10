'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventHelper = require('../../support/helpers/event.helper.js')
const NotificationHelper = require('../../support/helpers/notification.helper.js')
const { generateNoticeReferenceCode } = require('../../../app/lib/general.lib.js')

// Thing under test
const UpdateEventService = require('../../../app/services/notices/update-notice.service.js')

describe('Notices - Update Notice service', () => {
  let noticeIds
  let notifications

  let cancelledNotice
  let notIncludedNotice
  let notNotificationNotice
  let oneOfEachNotice
  let sentAndCancelledNotice
  let sentAndErroredNotice
  let sentAndPendingNotice
  let sentAndReturnedNotice
  let sentNotice

  before(async () => {
    const noticeData = {
      issuer: 'admin-internal@wrls.gov.uk',
      licences: ['01/123'],
      metadata: {
        name: 'Returns: invitation',
        error: 0,
        options: { excludeLicences: [] },
        recipients: 1,
        returnCycle: { dueDate: '2025-04-28', endDate: '2025-03-31', isSummer: false, startDate: '2024-04-01' }
      },
      status: 'completed',
      subtype: 'returnInvitation',
      type: 'notification'
    }
    notifications = []

    notIncludedNotice = await EventHelper.add({
      ...noticeData,
      referenceCode: generateNoticeReferenceCode('RINV-')
    })
    notifications.push(await NotificationHelper.add({ eventId: notIncludedNotice.id, status: 'pending' }))

    notNotificationNotice = await EventHelper.add()

    cancelledNotice = await EventHelper.add({
      ...noticeData,
      referenceCode: generateNoticeReferenceCode('RINV-')
    })
    notifications.push(await NotificationHelper.add({ eventId: cancelledNotice.id, status: 'cancelled' }))

    sentNotice = await EventHelper.add({
      ...noticeData,
      referenceCode: generateNoticeReferenceCode('RINV-')
    })
    notifications.push(await NotificationHelper.add({ eventId: sentNotice.id, status: 'sent' }))

    // NOTE: We set a blank metadata data to demonstrate `metadata.errorCount` does not have to exist to be set
    sentAndPendingNotice = await EventHelper.add({
      ...noticeData,
      metadata: {},
      referenceCode: generateNoticeReferenceCode('RINV-')
    })
    notifications.push(await NotificationHelper.add({ eventId: sentAndPendingNotice.id, status: 'sent' }))
    notifications.push(await NotificationHelper.add({ eventId: sentAndPendingNotice.id, status: 'pending' }))

    sentAndErroredNotice = await EventHelper.add({
      ...noticeData,
      referenceCode: generateNoticeReferenceCode('RINV-')
    })
    notifications.push(await NotificationHelper.add({ eventId: sentAndErroredNotice.id, status: 'sent' }))
    notifications.push(await NotificationHelper.add({ eventId: sentAndErroredNotice.id, status: 'error' }))

    sentAndReturnedNotice = await EventHelper.add({
      ...noticeData,
      referenceCode: generateNoticeReferenceCode('RINV-')
    })
    notifications.push(await NotificationHelper.add({ eventId: sentAndReturnedNotice.id, status: 'sent' }))
    notifications.push(await NotificationHelper.add({ eventId: sentAndReturnedNotice.id, status: 'returned' }))

    sentAndCancelledNotice = await EventHelper.add({
      ...noticeData,
      referenceCode: generateNoticeReferenceCode('RINV-')
    })
    notifications.push(await NotificationHelper.add({ eventId: sentAndCancelledNotice.id, status: 'sent' }))
    notifications.push(await NotificationHelper.add({ eventId: sentAndCancelledNotice.id, status: 'cancelled' }))

    oneOfEachNotice = await EventHelper.add({
      ...noticeData,
      referenceCode: generateNoticeReferenceCode('RINV-')
    })
    notifications.push(await NotificationHelper.add({ eventId: oneOfEachNotice.id, status: 'sent' }))
    notifications.push(await NotificationHelper.add({ eventId: oneOfEachNotice.id, status: 'error' }))
    notifications.push(await NotificationHelper.add({ eventId: oneOfEachNotice.id, status: 'pending' }))
    notifications.push(await NotificationHelper.add({ eventId: oneOfEachNotice.id, status: 'returned' }))
    notifications.push(await NotificationHelper.add({ eventId: oneOfEachNotice.id, status: 'cancelled' }))

    noticeIds = [
      notNotificationNotice.id,
      cancelledNotice.id,
      sentNotice.id,
      sentAndPendingNotice.id,
      sentAndErroredNotice.id,
      sentAndReturnedNotice.id,
      sentAndCancelledNotice.id,
      oneOfEachNotice.id
    ]
  })

  after(async () => {
    notIncludedNotice.$query().delete()
    notNotificationNotice.$query().delete()
    cancelledNotice.$query().delete()
    sentNotice.$query().delete()
    sentAndPendingNotice.$query().delete()
    sentAndErroredNotice.$query().delete()
    sentAndReturnedNotice.$query().delete()
    sentAndCancelledNotice.$query().delete()
    oneOfEachNotice.$query().delete()

    for (const notification of notifications) {
      notification.$query().delete()
    }
  })

  describe('when called with', () => {
    it('correctly updates the ""overallStatus" and "statusCount" of each notice that is a notification', async () => {
      await UpdateEventService.go(noticeIds)

      // Check notice with only sent notifications - SENT
      let refreshedNotice = await sentNotice.$query()

      expect(refreshedNotice.metadata.error).to.equal(0)
      expect(refreshedNotice.overallStatus).to.equal('sent')
      expect(refreshedNotice.statusCounts).to.equal({ cancelled: 0, error: 0, pending: 0, returned: 0, sent: 1 })

      // Check notice with only cancelled notifications - CANCELLED
      refreshedNotice = await cancelledNotice.$query()

      expect(refreshedNotice.metadata.error).to.equal(0)
      expect(refreshedNotice.overallStatus).to.equal('cancelled')
      expect(refreshedNotice.statusCounts).to.equal({ cancelled: 1, error: 0, pending: 0, returned: 0, sent: 0 })

      // Check notice with a sent and pending notification - PENDING
      refreshedNotice = await sentAndPendingNotice.$query()

      expect(refreshedNotice.metadata.error).to.equal(0)
      expect(refreshedNotice.overallStatus).to.equal('pending')
      expect(refreshedNotice.statusCounts).to.equal({ cancelled: 0, error: 0, pending: 1, returned: 0, sent: 1 })

      // Check notice with a sent and errored notification - ERROR
      refreshedNotice = await sentAndErroredNotice.$query()

      expect(refreshedNotice.metadata.error).to.equal(1)
      expect(refreshedNotice.overallStatus).to.equal('error')
      expect(refreshedNotice.statusCounts).to.equal({ cancelled: 0, error: 1, pending: 0, returned: 0, sent: 1 })

      // Check notice with a sent and returned notification - RETURNED
      refreshedNotice = await sentAndReturnedNotice.$query()

      expect(refreshedNotice.metadata.error).to.equal(0)
      expect(refreshedNotice.overallStatus).to.equal('returned')
      expect(refreshedNotice.statusCounts).to.equal({ cancelled: 0, error: 0, pending: 0, returned: 1, sent: 1 })

      // Check notice with a sent and cancelled notification - SENT
      refreshedNotice = await sentAndCancelledNotice.$query()

      expect(refreshedNotice.metadata.error).to.equal(0)
      expect(refreshedNotice.overallStatus).to.equal('sent')
      expect(refreshedNotice.statusCounts).to.equal({ cancelled: 1, error: 0, pending: 0, returned: 0, sent: 1 })

      // Check notice with one of each notification - RETURNED
      refreshedNotice = await oneOfEachNotice.$query()

      expect(refreshedNotice.metadata.error).to.equal(1)
      expect(refreshedNotice.overallStatus).to.equal('returned')
      expect(refreshedNotice.statusCounts).to.equal({ cancelled: 1, error: 1, pending: 1, returned: 1, sent: 1 })

      // Check our notice that is not a notification did not get updated
      refreshedNotice = await notNotificationNotice.$query()
      expect(refreshedNotice).to.equal(notNotificationNotice)

      // Check our notification notice that was not included did not get updated
      refreshedNotice = await notIncludedNotice.$query()
      expect(refreshedNotice).to.equal(notIncludedNotice)
    })
  })
})
