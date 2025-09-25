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
  })

  describe('when inserting a single notification', () => {
    beforeEach(async () => {
      notifications = [{ eventId, createdAt: timestampForPostgres() }]
    })

    it('should create a single notification (and only set the required values)', async () => {
      const result = await CreateNotificationsService.go(notifications)

      const createdResult = await NotificationModel.query().findById(result[0].id)

      expect(createdResult).equal({
        createdAt: createdResult.createdAt,
        eventId,
        id: result[0].id,
        licenceMonitoringStationId: null,
        licences: null,
        notifyError: null,
        messageRef: null,
        messageType: null,
        notifyId: null,
        notifyStatus: null,
        personalisation: null,
        plaintext: null,
        recipient: null,
        returnLogIds: null,
        status: null,
        templateId: null
      })
    })
  })

  describe('when inserting multiple notifications', () => {
    beforeEach(() => {
      notifications = [
        { eventId, createdAt: timestampForPostgres() },
        { eventId, createdAt: timestampForPostgres() }
      ]
    })

    it('should return the saved notifications', async () => {
      const result = await CreateNotificationsService.go(notifications)

      expect(result).equal([
        {
          createdAt: result[0].createdAt,
          eventId,
          id: result[0].id
        },
        {
          createdAt: result[1].createdAt,
          eventId,
          id: result[1].id
        }
      ])
    })
  })
})
