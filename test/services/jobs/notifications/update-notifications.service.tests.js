'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventHelper = require('../../../support/helpers/event.helper.js')
const NotificationHelper = require('../../../support/helpers/notification.helper.js')
const { timestampForPostgres } = require('../../../../app/lib/general.lib.js')

// Thing under test
const UpdateNotificationsService = require('../../../../app/services/jobs/notifications/update-notifications.service.js')

describe('Notifications Setup - Update Notifications service', () => {
  let eventId
  let notifications
  let notification
  let notification2

  beforeEach(async () => {
    const event = await EventHelper.add({
      type: 'notification',
      subtype: 'returnsInvitation'
    })

    eventId = event.id

    notification = await NotificationHelper.add({
      createdAt: timestampForPostgres(),
      eventId,
      status: 'pending'
    })
  })

  describe('when updating a single notification', () => {
    beforeEach(async () => {
      notifications = [
        {
          createdAt: new Date(notification.createdAt),
          id: notification.id,
          notifyStatus: 'received',
          status: 'sent'
        }
      ]
    })

    it("updates only the notification's required values", async () => {
      await UpdateNotificationsService.go(notifications)

      const result = await notification.$query()

      expect(result).equal({
        createdAt: new Date(notification.createdAt),
        eventId,
        id: notification.id,
        licences: null,
        notifyError: null,
        messageRef: null,
        messageType: null,
        notifyId: null,
        notifyStatus: 'received',
        personalisation: null,
        plaintext: null,
        recipient: null,
        status: 'sent'
      })
    })
  })

  describe('when updating multiple notifications', () => {
    beforeEach(async () => {
      notification2 = await NotificationHelper.add({
        createdAt: timestampForPostgres(),
        eventId,
        status: 'sending'
      })

      notifications = [
        {
          createdAt: new Date(notification.createdAt),
          id: notification.id,
          notifyStatus: 'received',
          status: 'sent'
        },
        {
          createdAt: new Date(notification2.createdAt),
          id: notification2.id,
          status: 'sent'
        }
      ]
    })

    it('updates the first notification', async () => {
      await UpdateNotificationsService.go(notifications)

      const result = await notification.$query()

      expect(result).equal({
        createdAt: new Date(notification.createdAt),
        eventId,
        id: notification.id,
        licences: null,
        notifyError: null,
        messageRef: null,
        messageType: null,
        notifyId: null,
        notifyStatus: 'received',
        personalisation: null,
        plaintext: null,
        recipient: null,
        status: 'sent'
      })
    })

    it('updates the second notification', async () => {
      await UpdateNotificationsService.go(notifications)

      const result = await notification2.$query()

      expect(result).to.equal({
        createdAt: new Date(notification2.createdAt),
        eventId,
        id: notification2.id,
        licences: null,
        notifyError: null,
        messageRef: null,
        messageType: null,
        notifyId: null,
        notifyStatus: null,
        personalisation: null,
        plaintext: null,
        recipient: null,
        status: 'sent'
      })
    })
  })
})
