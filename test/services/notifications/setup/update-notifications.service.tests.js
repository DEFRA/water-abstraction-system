'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventHelper = require('../../../support/helpers/event.helper.js')
const ScheduledNotificationHelper = require('../../../support/helpers/scheduled-notification.helper.js')
const ScheduledNotificationModel = require('../../../../app/models/scheduled-notification.model.js')
const { timestampForPostgres } = require('../../../../app/lib/general.lib.js')

// Thing under test
const UpdateNotificationsService = require('../../../../app/services/notifications/setup/update-notifications.service.js')

describe('Notifications Setup - Update Notifications service', () => {
  let eventId
  let notifications
  let scheduledNotification
  let scheduledNotification2

  beforeEach(async () => {
    const event = await EventHelper.add({
      type: 'notification',
      subtype: 'returnsInvitation'
    })

    eventId = event.id

    scheduledNotification = await ScheduledNotificationHelper.add({
      createdAt: timestampForPostgres(),
      eventId,
      status: 'sending'
    })
  })

  describe('when updating a single notification', () => {
    beforeEach(async () => {
      notifications = [
        {
          createdAt: new Date(scheduledNotification.createdAt),
          id: scheduledNotification.id,
          notifyStatus: 'received',
          status: 'sent'
        }
      ]
    })

    it('should update a single notification (and only update the required values)', async () => {
      await UpdateNotificationsService.go(notifications)

      const createdResult = await ScheduledNotificationModel.query().where('eventId', eventId)

      expect(createdResult).equal([
        {
          companyId: null,
          createdAt: new Date(scheduledNotification.createdAt),
          eventId,
          id: scheduledNotification.id,
          individualId: null,
          jobId: null,
          licences: null,
          log: null,
          messageRef: null,
          messageType: null,
          metadata: null,
          nextStatusCheck: null,
          notificationType: null,
          notifyId: null,
          notifyStatus: 'received',
          personalisation: null,
          plaintext: null,
          recipient: null,
          sendAfter: null,
          status: 'sent',
          statusChecks: null
        }
      ])
    })
  })

  describe('when updating multiple notifications', () => {
    beforeEach(async () => {
      scheduledNotification2 = await ScheduledNotificationHelper.add({
        createdAt: timestampForPostgres(),
        eventId,
        status: 'sending'
      })

      notifications = [
        {
          createdAt: new Date(scheduledNotification.createdAt),
          id: scheduledNotification.id,
          notifyStatus: 'received',
          status: 'sent'
        },
        {
          createdAt: new Date(scheduledNotification2.createdAt),
          id: scheduledNotification2.id,
          status: 'sent'
        }
      ]
    })

    it('should return the saved notifications', async () => {
      await UpdateNotificationsService.go(notifications)

      const createdResult = await ScheduledNotificationModel.query().where('eventId', eventId)

      expect(createdResult).equal([
        {
          companyId: null,
          createdAt: new Date(scheduledNotification.createdAt),
          eventId,
          id: scheduledNotification.id,
          individualId: null,
          jobId: null,
          licences: null,
          log: null,
          messageRef: null,
          messageType: null,
          metadata: null,
          nextStatusCheck: null,
          notificationType: null,
          notifyId: null,
          notifyStatus: 'received',
          personalisation: null,
          plaintext: null,
          recipient: null,
          sendAfter: null,
          status: 'sent',
          statusChecks: null
        },
        {
          companyId: null,
          createdAt: new Date(scheduledNotification2.createdAt),
          eventId,
          id: scheduledNotification2.id,
          individualId: null,
          jobId: null,
          licences: null,
          log: null,
          messageRef: null,
          messageType: null,
          metadata: null,
          nextStatusCheck: null,
          notificationType: null,
          notifyId: null,
          notifyStatus: null,
          personalisation: null,
          plaintext: null,
          recipient: null,
          sendAfter: null,
          status: 'sent',
          statusChecks: null
        }
      ])
    })
  })
})
