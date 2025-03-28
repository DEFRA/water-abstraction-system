'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventHelper = require('../../../support/helpers/event.helper.js')
const ScheduledNotificationHelper = require('../../../support/helpers/scheduled-notification.helper.js')

// Thing under test
const FetchEventNotificationsService = require('../../../../app/services/jobs/notifications/fetch-event-notifications.service.js')

describe('Job - Notifications - Fetch event notifications service', () => {
  let event
  let scheduledNotification
  let unlikelyEvent
  let unlikelyEvent2
  let olderThanRetentionEvent

  beforeEach(async () => {
    event = await EventHelper.add({
      type: 'notification',
      status: 'completed'
    })

    scheduledNotification = await ScheduledNotificationHelper.add({
      eventId: event.id,
      status: 'sending'
    })

    // An event with the wrong status but a 'scheduledNotification' status as 'sending'
    unlikelyEvent = await EventHelper.add({
      type: 'notification',
      status: 'processing'
    })

    await ScheduledNotificationHelper.add({
      eventId: unlikelyEvent.id,
      status: 'sending'
    })

    // An event with the correct status but a 'scheduledNotification' status as 'error'
    unlikelyEvent2 = await EventHelper.add({
      type: 'notification',
      status: 'completed'
    })

    await ScheduledNotificationHelper.add({
      eventId: unlikelyEvent2.id,
      status: 'error'
    })

    // An event that is valid but is older than 7 days (notify retention period)
    const today = new Date()
    const eightDaysAgo = new Date()
    eightDaysAgo.setDate(today.getDate() - 8)

    olderThanRetentionEvent = await EventHelper.add({
      status: 'completed',
      type: 'notification',
      createdAt: eightDaysAgo
    })

    await ScheduledNotificationHelper.add({
      eventId: olderThanRetentionEvent.id,
      status: 'sending'
    })
  })

  describe('an event has "scheduledNotifications"', () => {
    it('returns the event marked for "sending"', async () => {
      const result = await FetchEventNotificationsService.go()

      const foundEvent = result.find((resultEvent) => resultEvent.id === event.id)

      expect(foundEvent).to.equal({
        id: event.id,
        scheduledNotifications: [
          {
            id: scheduledNotification.id,
            log: null,
            notifyId: null,
            notifyStatus: null,
            status: 'sending'
          }
        ]
      })
    })
  })

  describe('and the event status is "processing"', () => {
    it('does not return the event', async () => {
      const result = await FetchEventNotificationsService.go()

      const foundEvent = result.find((resultEvent) => resultEvent.id === unlikelyEvent.id)

      expect(foundEvent).to.be.undefined()
    })
  })

  describe('and the scheduled notification status is "error"', () => {
    it('does not return the event', async () => {
      const result = await FetchEventNotificationsService.go()

      const foundEvent = result.find((resultEvent) => resultEvent.id === unlikelyEvent2.id)

      expect(foundEvent).to.be.undefined()
    })
  })

  describe('and the scheduled notification is older than 7 days', () => {
    it('does not return the event', async () => {
      const result = await FetchEventNotificationsService.go()

      const foundEvent = result.find((resultEvent) => resultEvent.id === olderThanRetentionEvent.id)

      expect(foundEvent).to.be.undefined()
    })
  })
})
