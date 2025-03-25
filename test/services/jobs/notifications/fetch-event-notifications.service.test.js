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

describe('Notifications Setup - Ad Hoc Licence service', () => {
  let event
  let scheduledNotification

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
    const unlikelyEvent = await EventHelper.add({
      type: 'notification',
      status: 'processing'
    })

    await ScheduledNotificationHelper.add({
      eventId: unlikelyEvent.id,
      status: 'sending'
    })

    // An event with the correct status but a 'scheduledNotification' status as 'error'
    const unlikelyEvent2 = await EventHelper.add({
      type: 'notification',
      status: 'completed'
    })

    await ScheduledNotificationHelper.add({
      eventId: unlikelyEvent2.id,
      status: 'error'
    })
  })

  describe('an event has "scheduledNotifications"', () => {
    it('returns the data', async () => {
      const result = await FetchEventNotificationsService.go()

      expect(result).to.equal([
        {
          referenceCode: null,
          scheduledNotifications: [
            {
              id: scheduledNotification.id,
              log: null,
              notifyId: null,
              notifyStatus: null,
              status: 'sending'
            }
          ]
        }
      ])
    })
  })
})
