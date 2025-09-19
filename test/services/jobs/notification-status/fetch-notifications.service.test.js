'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventHelper = require('../../../support/helpers/event.helper.js')
const NotificationHelper = require('../../../support/helpers/notification.helper.js')
const { today } = require('../../../../app/lib/general.lib.js')

// Thing under test
const FetchNotificationsService = require('../../../../app/services/jobs/notification-status/fetch-notifications.service.js')

describe('Job - Notification Status - Fetch Notifications service', () => {
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
      messageRef: 'returns_invitation_licence_holder_letter',
      messageType: 'letter',
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

    const todaysDate = today()
    const eightDaysAgo = today()
    eightDaysAgo.setDate(todaysDate.getDate() - 8)

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
        licenceMonitoringStationId: null,
        messageRef: 'returns_invitation_licence_holder_letter',
        messageType: 'letter',
        notifyError: null,
        notifyId: null,
        notifyStatus: null,
        personalisation: null,
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
