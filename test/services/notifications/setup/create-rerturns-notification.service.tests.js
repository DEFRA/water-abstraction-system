'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventHelper = require('../../../support/helpers/event.helper.js')
const ScheduledNotificationModel = require('../../../../app/models/scheduled-notification.model.js')

// Thing under test
const CreateReturnsNotificationService = require('../../../../app/services/notifications/setup/create-returns-notification.service.js')

describe.only('Notifications Setup - Create event service', () => {
  let event

  beforeEach(async () => {
    event = await EventHelper.add({
      type: 'notification',
      subtype: 'returnsInvitation'
    })
  })

  it('should create the event (required values)', async () => {
    const result = await CreateReturnsNotificationService.go(event.id)

    const createdResult = await ScheduledNotificationModel.query().findById(result.id)

    expect(createdResult).equal({
      companyId: null,
      createdAt: createdResult.createdAt,
      eventId: null,
      id: result.id,
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
      status: null,
      statusChecks: null
    })
  })
})
