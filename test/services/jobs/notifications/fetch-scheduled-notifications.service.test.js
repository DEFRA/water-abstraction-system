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
const FetchScheduledNotificationsService = require('../../../../app/services/jobs/notifications/fetch-scheduled-notifications.service.js')

describe('Job - Notifications - Fetch scheduled notifications service', () => {
  let event
  let scheduledNotification
  let unlikelyEvent
  let olderThanRetentionEvent

  beforeEach(async () => {
    event = await EventHelper.add({
      type: 'notification',
      status: 'completed'
    })

    scheduledNotification = await ScheduledNotificationHelper.add({
      eventId: event.id,
      status: 'pending'
    })

    // The 'scheduledNotification' status is 'error'
    unlikelyEvent = await EventHelper.add({
      type: 'notification',
      status: 'completed'
    })

    await ScheduledNotificationHelper.add({
      eventId: unlikelyEvent.id,
      status: 'error'
    })

    // The 'scheduledNotification' status is older than 7 days (notify retention period)
    olderThanRetentionEvent = await EventHelper.add({
      status: 'completed',
      type: 'notification'
    })

    const today = new Date()
    const eightDaysAgo = new Date()
    eightDaysAgo.setDate(today.getDate() - 8)

    await ScheduledNotificationHelper.add({
      eventId: olderThanRetentionEvent.id,
      status: 'sending',
      createdAt: eightDaysAgo
    })
  })

  describe('an event has "scheduledNotifications"', () => {
    it('returns the event marked for "sending"', async () => {
      const result = await FetchScheduledNotificationsService.go()

      const foundEvent = result.find((resultEvent) => {
        return resultEvent.eventId === event.id
      })

      expect(foundEvent).to.equal({
        createdAt: scheduledNotification.createdAt,
        eventId: event.id,
        id: scheduledNotification.id,
        log: null,
        notifyId: null,
        notifyStatus: null,
        status: 'pending'
      })
    })
  })

  describe('and the scheduled notification status is "error"', () => {
    it('does not return the event', async () => {
      const result = await FetchScheduledNotificationsService.go()

      const foundEvent = result.find((resultEvent) => {
        return resultEvent.eventId === unlikelyEvent.id
      })

      expect(foundEvent).to.be.undefined()
    })
  })

  describe('and the scheduled notification is older than 7 days', () => {
    it('does not return the event', async () => {
      const result = await FetchScheduledNotificationsService.go()

      const foundEvent = result.find((resultEvent) => {
        return resultEvent.eventId === olderThanRetentionEvent.id
      })

      expect(foundEvent).to.be.undefined()
    })
  })
})
