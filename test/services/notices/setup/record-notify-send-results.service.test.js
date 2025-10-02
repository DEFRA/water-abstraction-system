'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventHelper = require('../../../support/helpers/event.helper.js')
const NotificationHelper = require('../../../support/helpers/notification.helper.js')
const NotificationModel = require('../../../../app/models/notification.model.js')
const { generateUUID, timestampForPostgres } = require('../../../../app/lib/general.lib.js')

// Thing under test
const RecordNotifySendResultsService = require('../../../../app/services/notices/setup/record-notify-send-results.service.js')

describe('Notices - Setup - Record notify send results service', () => {
  let eventId
  let notUpdatedNotification
  let notification
  let notificationTwo
  let notifications
  let notifyId
  let notifyIdTwo

  beforeEach(async () => {
    const event = await EventHelper.add({
      type: 'notification',
      subtype: 'returnsInvitation'
    })

    eventId = event.id

    notification = await NotificationHelper.add({ eventId, createdAt: timestampForPostgres() })
    notificationTwo = await NotificationHelper.add({ eventId, createdAt: timestampForPostgres() })

    notifyId = generateUUID()
    notifyIdTwo = generateUUID()

    // This is used to test the upsert is not affecting other notifications related to the same event
    notUpdatedNotification = await NotificationHelper.add({ eventId, createdAt: timestampForPostgres() })
  })

  describe('when a notification to Notify is successful', () => {
    beforeEach(() => {
      notifications = [
        {
          id: notification.id,
          notifyId,
          notifyStatus: 'sent',
          plaintext: 'some text',
          status: 'pending'
        },
        {
          id: notificationTwo.id,
          notifyId: notifyIdTwo,
          notifyStatus: 'sent',
          plaintext: 'some text',
          status: 'pending'
        }
      ]
    })

    it('should update notifications (and only update the new values)', async () => {
      await RecordNotifySendResultsService.go(notifications)

      const updatedResult = await NotificationModel.query().where('event_id', eventId)

      expect(updatedResult).equal([
        notUpdatedNotification,
        {
          createdAt: notification.createdAt,
          eventId,
          id: notification.id,
          licenceMonitoringStationId: null,
          licences: null,
          notifyError: null,
          messageRef: null,
          messageType: null,
          notifyId,
          notifyStatus: 'sent',
          pdf: null,
          personalisation: null,
          plaintext: 'some text',
          recipient: null,
          returnedAt: null,
          returnLogIds: null,
          status: 'pending',
          templateId: null
        },
        {
          createdAt: notificationTwo.createdAt,
          eventId,
          id: notificationTwo.id,
          licenceMonitoringStationId: null,
          licences: null,
          notifyError: null,
          messageRef: null,
          messageType: null,
          notifyId: notifyIdTwo,
          notifyStatus: 'sent',
          pdf: null,
          personalisation: null,
          plaintext: 'some text',
          recipient: null,
          returnedAt: null,
          returnLogIds: null,
          status: 'pending',
          templateId: null
        }
      ])
    })
  })

  describe('when a notification to Notify is unsuccessful', () => {
    beforeEach(async () => {
      notifications = [
        {
          id: notification.id,
          notifyError: JSON.stringify({ message: 'some error' }),
          status: 'error'
        },
        {
          id: notificationTwo.id,
          notifyError: JSON.stringify({ message: 'some error' }),
          status: 'error'
        }
      ]
    })

    it('should update notifications (and only update the new values)', async () => {
      await RecordNotifySendResultsService.go(notifications)

      const updatedResult = await NotificationModel.query().where('event_id', eventId)

      expect(updatedResult).equal([
        notUpdatedNotification,
        {
          createdAt: notification.createdAt,
          eventId,
          id: notification.id,
          licenceMonitoringStationId: null,
          licences: null,
          notifyError: '{"message":"some error"}',
          messageRef: null,
          messageType: null,
          notifyId: null,
          notifyStatus: null,
          pdf: null,
          personalisation: null,
          plaintext: null,
          recipient: null,
          returnedAt: null,
          returnLogIds: null,
          status: 'error',
          templateId: null
        },
        {
          createdAt: notificationTwo.createdAt,
          eventId,
          id: notificationTwo.id,
          licenceMonitoringStationId: null,
          licences: null,
          notifyError: '{"message":"some error"}',
          messageRef: null,
          messageType: null,
          notifyId: null,
          notifyStatus: null,
          pdf: null,
          personalisation: null,
          plaintext: null,
          recipient: null,
          returnedAt: null,
          returnLogIds: null,
          status: 'error',
          templateId: null
        }
      ])
    })
  })
})
