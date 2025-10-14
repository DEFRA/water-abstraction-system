'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventHelper = require('../../../support/helpers/event.helper.js')
const NotificationHelper = require('../../../support/helpers/notification.helper.js')

// Thing under test
const UpdateEventService = require('../../../../app/services/jobs/notification-status/update-event.service.js')

describe('Job - Notification Status - Update Event service', () => {
  let eventIds
  let notifications

  let cancelledEvent
  let notIncludedEvent
  let notNotificationEvent
  let oneOfEachEvent
  let sentAndCancelledEvent
  let sentAndErroredEvent
  let sentAndPendingEvent
  let sentAndReturnedEvent
  let sentEvent

  before(async () => {
    const eventData = {
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

    notIncludedEvent = await EventHelper.add({
      ...eventData,
      referenceCode: NotificationHelper.generateReferenceCode('RINV')
    })
    notifications.push(await NotificationHelper.add({ eventId: notIncludedEvent.id, status: 'pending' }))

    notNotificationEvent = await EventHelper.add()

    cancelledEvent = await EventHelper.add({
      ...eventData,
      referenceCode: NotificationHelper.generateReferenceCode('RINV')
    })
    notifications.push(await NotificationHelper.add({ eventId: cancelledEvent.id, status: 'cancelled' }))

    sentEvent = await EventHelper.add({
      ...eventData,
      referenceCode: NotificationHelper.generateReferenceCode('RINV')
    })
    notifications.push(await NotificationHelper.add({ eventId: sentEvent.id, status: 'sent' }))

    // NOTE: We set a blank metadata data to demonstrate `metadata.errorCount` does not have to exist to be set
    sentAndPendingEvent = await EventHelper.add({
      ...eventData,
      metadata: {},
      referenceCode: NotificationHelper.generateReferenceCode('RINV')
    })
    notifications.push(await NotificationHelper.add({ eventId: sentAndPendingEvent.id, status: 'sent' }))
    notifications.push(await NotificationHelper.add({ eventId: sentAndPendingEvent.id, status: 'pending' }))

    sentAndErroredEvent = await EventHelper.add({
      ...eventData,
      referenceCode: NotificationHelper.generateReferenceCode('RINV')
    })
    notifications.push(await NotificationHelper.add({ eventId: sentAndErroredEvent.id, status: 'sent' }))
    notifications.push(await NotificationHelper.add({ eventId: sentAndErroredEvent.id, status: 'error' }))

    sentAndReturnedEvent = await EventHelper.add({
      ...eventData,
      referenceCode: NotificationHelper.generateReferenceCode('RINV')
    })
    notifications.push(await NotificationHelper.add({ eventId: sentAndReturnedEvent.id, status: 'sent' }))
    notifications.push(await NotificationHelper.add({ eventId: sentAndReturnedEvent.id, status: 'returned' }))

    sentAndCancelledEvent = await EventHelper.add({
      ...eventData,
      referenceCode: NotificationHelper.generateReferenceCode('RINV')
    })
    notifications.push(await NotificationHelper.add({ eventId: sentAndCancelledEvent.id, status: 'sent' }))
    notifications.push(await NotificationHelper.add({ eventId: sentAndCancelledEvent.id, status: 'cancelled' }))

    oneOfEachEvent = await EventHelper.add({
      ...eventData,
      referenceCode: NotificationHelper.generateReferenceCode('RINV')
    })
    notifications.push(await NotificationHelper.add({ eventId: oneOfEachEvent.id, status: 'sent' }))
    notifications.push(await NotificationHelper.add({ eventId: oneOfEachEvent.id, status: 'error' }))
    notifications.push(await NotificationHelper.add({ eventId: oneOfEachEvent.id, status: 'pending' }))
    notifications.push(await NotificationHelper.add({ eventId: oneOfEachEvent.id, status: 'returned' }))
    notifications.push(await NotificationHelper.add({ eventId: oneOfEachEvent.id, status: 'cancelled' }))

    eventIds = [
      notNotificationEvent.id,
      cancelledEvent.id,
      sentEvent.id,
      sentAndPendingEvent.id,
      sentAndErroredEvent.id,
      sentAndReturnedEvent.id,
      sentAndCancelledEvent.id,
      oneOfEachEvent.id
    ]
  })

  after(async () => {
    notIncludedEvent.$query().delete()
    notNotificationEvent.$query().delete()
    cancelledEvent.$query().delete()
    sentEvent.$query().delete()
    sentAndPendingEvent.$query().delete()
    sentAndErroredEvent.$query().delete()
    sentAndReturnedEvent.$query().delete()
    sentAndCancelledEvent.$query().delete()
    oneOfEachEvent.$query().delete()

    for (const notification of notifications) {
      notification.$query().delete()
    }
  })

  describe('when called with', () => {
    it('correctly updates the ""overallStatus" and "statusCount" of each event that is a notification', async () => {
      await UpdateEventService.go(eventIds)

      // Check event with only sent notifications - SENT
      let refreshedEvent = await sentEvent.$query()

      expect(refreshedEvent.metadata.error).to.equal(0)
      expect(refreshedEvent.overallStatus).to.equal('sent')
      expect(refreshedEvent.statusCounts).to.equal({ cancelled: 0, error: 0, pending: 0, returned: 0, sent: 1 })

      // Check event with only cancelled notifications - CANCELLED
      refreshedEvent = await cancelledEvent.$query()

      expect(refreshedEvent.metadata.error).to.equal(0)
      expect(refreshedEvent.overallStatus).to.equal('cancelled')
      expect(refreshedEvent.statusCounts).to.equal({ cancelled: 1, error: 0, pending: 0, returned: 0, sent: 0 })

      // Check event with a sent and pending notification - PENDING
      refreshedEvent = await sentAndPendingEvent.$query()

      expect(refreshedEvent.metadata.error).to.equal(0)
      expect(refreshedEvent.overallStatus).to.equal('pending')
      expect(refreshedEvent.statusCounts).to.equal({ cancelled: 0, error: 0, pending: 1, returned: 0, sent: 1 })

      // Check event with a sent and errored notification - ERROR
      refreshedEvent = await sentAndErroredEvent.$query()

      expect(refreshedEvent.metadata.error).to.equal(1)
      expect(refreshedEvent.overallStatus).to.equal('error')
      expect(refreshedEvent.statusCounts).to.equal({ cancelled: 0, error: 1, pending: 0, returned: 0, sent: 1 })

      // Check event with a sent and returned notification - RETURNED
      refreshedEvent = await sentAndReturnedEvent.$query()

      expect(refreshedEvent.metadata.error).to.equal(0)
      expect(refreshedEvent.overallStatus).to.equal('returned')
      expect(refreshedEvent.statusCounts).to.equal({ cancelled: 0, error: 0, pending: 0, returned: 1, sent: 1 })

      // Check event with a sent and cancelled notification - SENT
      refreshedEvent = await sentAndCancelledEvent.$query()

      expect(refreshedEvent.metadata.error).to.equal(0)
      expect(refreshedEvent.overallStatus).to.equal('sent')
      expect(refreshedEvent.statusCounts).to.equal({ cancelled: 1, error: 0, pending: 0, returned: 0, sent: 1 })

      // Check event with one of each notification - RETURNED
      refreshedEvent = await oneOfEachEvent.$query()

      expect(refreshedEvent.metadata.error).to.equal(1)
      expect(refreshedEvent.overallStatus).to.equal('returned')
      expect(refreshedEvent.statusCounts).to.equal({ cancelled: 1, error: 1, pending: 1, returned: 1, sent: 1 })

      // Check our event that is not a notification did not get updated
      refreshedEvent = await notNotificationEvent.$query()
      expect(refreshedEvent).to.equal(notNotificationEvent)

      // Check our notification event that was not included did not get updated
      refreshedEvent = await notIncludedEvent.$query()
      expect(refreshedEvent).to.equal(notIncludedEvent)
    })
  })
})
