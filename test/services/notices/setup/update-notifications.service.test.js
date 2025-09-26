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
const UpdateNotificationsService = require('../../../../app/services/notices/setup/update-notifications.service.js')

describe('Notices - Setup - Update notification service', () => {
  let eventId
  let notification
  let notifications

  beforeEach(async () => {
    const event = await EventHelper.add({
      type: 'notification',
      subtype: 'returnsInvitation'
    })

    eventId = event.id
  })

  describe('when a notification to Notify is successful', () => {
    let notifyId

    beforeEach(async () => {
      notification = await NotificationHelper.add({ eventId, createdAt: timestampForPostgres() })

      notifyId = generateUUID()

      notifications = [
        {
          id: notification.id,
          notifyId,
          notifyStatus: 'sent',
          plaintext: 'some text',
          status: 'pending'
        }
      ]
    })

    describe('and it is for a single notification', () => {
      it('should update a single notification (and only update the new values)', async () => {
        await UpdateNotificationsService.go(notifications)

        const updatedResult = await NotificationModel.query().where('event_id', eventId)

        expect(updatedResult).equal([
          {
            createdAt: updatedResult[0].createdAt,
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
            returnLogIds: null,
            status: 'pending',
            templateId: null
          }
        ])
      })
    })

    describe('and it is for multiple notifications', () => {
      let notificationTwo
      let notifyIdTwo

      beforeEach(async () => {
        notificationTwo = await NotificationHelper.add({ eventId, createdAt: timestampForPostgres() })

        notifyIdTwo = generateUUID()

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
        await UpdateNotificationsService.go(notifications)

        const updatedResult = await NotificationModel.query().where('event_id', eventId)

        expect(updatedResult).equal([
          {
            createdAt: updatedResult[0].createdAt,
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
            returnLogIds: null,
            status: 'pending',
            templateId: null
          },
          {
            createdAt: updatedResult[1].createdAt,
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
            returnLogIds: null,
            status: 'pending',
            templateId: null
          }
        ])
      })
    })
  })

  describe('when a notification to Notify is unsuccessful', () => {
    beforeEach(async () => {
      notification = await NotificationHelper.add({ eventId, createdAt: timestampForPostgres() })

      notifications = [
        {
          id: notification.id,
          notifyError: JSON.stringify({ message: 'some error' }),
          status: 'error'
        }
      ]
    })

    describe('and it is for a single notification', () => {
      it('should update a single notification (and only update the new values)', async () => {
        await UpdateNotificationsService.go(notifications)

        const updatedResult = await NotificationModel.query().where('event_id', eventId)

        expect(updatedResult).equal([
          {
            createdAt: updatedResult[0].createdAt,
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
            returnLogIds: null,
            status: 'error',
            templateId: null
          }
        ])
      })
    })

    describe('and it is for multiple notifications', () => {
      let notificationTwo

      beforeEach(async () => {
        notificationTwo = await NotificationHelper.add({ eventId, createdAt: timestampForPostgres() })

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
        await UpdateNotificationsService.go(notifications)

        const updatedResult = await NotificationModel.query().where('event_id', eventId)

        expect(updatedResult).equal([
          {
            createdAt: updatedResult[0].createdAt,
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
            returnLogIds: null,
            status: 'error',
            templateId: null
          },
          {
            createdAt: updatedResult[1].createdAt,
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
            returnLogIds: null,
            status: 'error',
            templateId: null
          }
        ])
      })
    })
  })
})
