'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventHelper = require('../../../support/helpers/event.helper.js')
const NotificationHelper = require('../../../support/helpers/notification.helper.js')

// Thing under test
const FetchNotificationsService = require('../../../../app/services/jobs/notifications/fetch-notifications.service.js')

describe('Job - Notifications - Fetch notifications service', () => {
  let event
  let notification
  let unlikelyEvent
  let olderThanRetentionEvent

  beforeEach(async () => {
    event = await EventHelper.add({
      type: 'notification',
      status: 'completed'
    })

    notification = await NotificationHelper.add({
      eventId: event.id,
      status: 'pending'
    })

    // The 'notification' status is 'error'
    unlikelyEvent = await EventHelper.add({
      type: 'notification',
      status: 'completed'
    })

    await NotificationHelper.add({
      eventId: unlikelyEvent.id,
      status: 'error'
    })

    // The 'notification' status is older than 7 days (notify retention period)
    olderThanRetentionEvent = await EventHelper.add({
      status: 'completed',
      type: 'notification'
    })

    const today = new Date()
    const eightDaysAgo = new Date()
    eightDaysAgo.setDate(today.getDate() - 8)

    await NotificationHelper.add({
      eventId: olderThanRetentionEvent.id,
      status: 'sending',
      createdAt: eightDaysAgo
    })
  })

  describe('an event has "notifications"', () => {
    it('returns the event marked for "sending"', async () => {
      const result = await FetchNotificationsService.go()

      const foundEvent = result.find((resultEvent) => {
        return resultEvent.eventId === event.id
      })

      expect(foundEvent).to.equal({
        createdAt: notification.createdAt,
        eventId: event.id,
        id: notification.id,
        notifyId: null,
        notifyStatus: null,
        notifyError: null,
        status: 'pending'
      })
    })
  })

  describe('and the notification status is "error"', () => {
    it('does not return the event', async () => {
      const result = await FetchNotificationsService.go()

      const foundEvent = result.find((resultEvent) => {
        return resultEvent.eventId === unlikelyEvent.id
      })

      expect(foundEvent).to.be.undefined()
    })
  })

  describe('and the notification is older than 7 days', () => {
    it('does not return the event', async () => {
      const result = await FetchNotificationsService.go()

      const foundEvent = result.find((resultEvent) => {
        return resultEvent.eventId === olderThanRetentionEvent.id
      })

      expect(foundEvent).to.be.undefined()
    })
  })
})
