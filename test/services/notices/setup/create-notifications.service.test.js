'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventHelper = require('../../../support/helpers/event.helper.js')
const NotificationModel = require('../../../../app/models/notification.model.js')
const { timestampForPostgres } = require('../../../../app/lib/general.lib.js')

// Thing under test
const CreateNotificationsService = require('../../../../app/services/notices/setup/create-notifications.service.js')

describe('Notices - Setup - Create notification service', () => {
  let eventId
  let notifications

  beforeEach(async () => {
    const event = await EventHelper.add({
      type: 'notification',
      subtype: 'returnsInvitation'
    })

    eventId = event.id

    notifications = [
      { eventId, createdAt: timestampForPostgres() },
      { eventId, createdAt: timestampForPostgres() }
    ]
  })

  it('should return the saved notifications', async () => {
    const result = await CreateNotificationsService.go(notifications)

    const createdNotifications = await NotificationModel.query().where({
      event_id: eventId
    })

    expect(createdNotifications).equal([
      {
        alternateNotificationId: null,
        createdAt: createdNotifications[0].createdAt,
        eventId,
        id: result[0].id,
        licenceMonitoringStationId: null,
        licences: null,
        messageRef: null,
        messageType: null,
        notifyError: null,
        notifyId: null,
        notifyStatus: null,
        pdf: null,
        personalisation: null,
        plaintext: null,
        recipient: null,
        returnedAt: null,
        returnLogIds: null,
        status: null,
        templateId: null
      },
      {
        alternateNotificationId: null,
        createdAt: createdNotifications[1].createdAt,
        eventId,
        id: result[1].id,
        licenceMonitoringStationId: null,
        licences: null,
        messageRef: null,
        messageType: null,
        notifyError: null,
        notifyId: null,
        notifyStatus: null,
        pdf: null,
        personalisation: null,
        plaintext: null,
        recipient: null,
        returnedAt: null,
        returnLogIds: null,
        status: null,
        templateId: null
      }
    ])
  })
})
