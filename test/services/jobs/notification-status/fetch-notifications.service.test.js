'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const NotificationSeeder = require('../../../support/seeders/notification.seeder.js')

// Thing under test
const FetchNotificationsService = require('../../../../app/services/jobs/notification-status/fetch-notifications.service.js')

describe('Job - Notification Status - Fetch Notifications service', () => {
  let seedData

  beforeEach(async () => {
    seedData = await NotificationSeeder.seed()
  })

  describe('an event has "notifications"', () => {
    it('returns the notifications marked as "pending"', async () => {
      const result = await FetchNotificationsService.go()

      expect(result).to.equal([
        {
          createdAt: seedData.notifications.email.pending.createdAt,
          eventId: seedData.event.id,
          id: seedData.notifications.email.pending.id,
          licenceMonitoringStationId: null,
          messageRef: 'returns_invitation_primary_user_email',
          messageType: 'email',
          notifyError: null,
          notifyId: null,
          notifyStatus: null,
          personalisation: null,
          status: 'pending'
        },
        {
          createdAt: seedData.notifications.letter.pending.createdAt,
          eventId: seedData.event.id,
          id: seedData.notifications.letter.pending.id,
          licenceMonitoringStationId: null,
          messageRef: 'returns_invitation_licence_holder_letter',
          messageType: 'letter',
          notifyError: null,
          notifyId: null,
          notifyStatus: null,
          personalisation: null,
          status: 'pending'
        }
      ])
    })

    describe('and an event id is provided', () => {
      it('returns the notifications for the event marked as "pending" and only those with the "messageType" "email"', async () => {
        const result = await FetchNotificationsService.go(seedData.event.id)

        expect(result).to.equal([
          {
            createdAt: seedData.notifications.email.pending.createdAt,
            eventId: seedData.event.id,
            id: seedData.notifications.email.pending.id,
            licenceMonitoringStationId: null,
            messageRef: 'returns_invitation_primary_user_email',
            messageType: 'email',
            notifyError: null,
            notifyId: null,
            notifyStatus: null,
            personalisation: null,
            status: 'pending'
          }
        ])
      })
    })
  })

  describe('and the notification is older than 7 days', () => {
    it('does not return the event', async () => {
      const result = await FetchNotificationsService.go()

      const foundEvent = result.find((resultEvent) => {
        return resultEvent.eventId === seedData.notifications.olderThanRetention.id
      })

      expect(foundEvent).to.be.undefined()
    })
  })
})
