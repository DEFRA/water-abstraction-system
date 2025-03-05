'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventHelper = require('../../../support/helpers/event.helper.js')
const ScheduledNotificationModel = require('../../../../app/models/scheduled-notification.model.js')
const { timestampForPostgres } = require('../../../../app/lib/general.lib.js')

// Thing under test
const CreateNotificationService = require('../../../../app/services/notifications/setup/create-notification.service.js')

describe('Notifications Setup - Create notification service', () => {
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
      notifications = [{ eventId, metadata: {}, createdAt: timestampForPostgres() }]
    })

    it('should create a single notification (and only set the required values)', async () => {
      const result = await CreateNotificationService.go(notifications)

      const createdResult = await ScheduledNotificationModel.query().findById(result[0].id)

      expect(createdResult).equal({
        companyId: null,
        createdAt: createdResult.createdAt,
        eventId,
        id: result[0].id,
        individualId: null,
        jobId: null,
        licences: null,
        log: null,
        messageRef: null,
        messageType: null,
        metadata: {},
        nextStatusCheck: null,
        notificationType: null,
        notifyId: null,
        notifyStatus: null,
        personalisation: null,
        plaintext: null,
        recipient: null,
        sendAfter: null,
        status: null,
        statusChecks: null
      })
    })
  })

  describe('when inserting multiple notifications', () => {
    beforeEach(() => {
      notifications = [
        { eventId, metadata: {}, createdAt: timestampForPostgres() },
        { eventId, metadata: {}, createdAt: timestampForPostgres() }
      ]
    })

    it('should return the saved notifications', async () => {
      const result = await CreateNotificationService.go(notifications)

      expect(result).equal([
        {
          createdAt: result[0].createdAt,
          eventId,
          id: result[0].id,
          metadata: {}
        },
        {
          createdAt: result[1].createdAt,
          eventId,
          id: result[1].id,
          metadata: {}
        }
      ])
    })
  })
})
