'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventHelper = require('../../../support/helpers/event.helper.js')
const NotificationHelper = require('../../../support/helpers/notification.helper.js')

// Thing under test
const FetchNotificationsService = require('../../../../app/services/notices/setup/fetch-notifications.service.js')

describe('Notices - Setup - Fetch notifications service', () => {
  let eventId

  beforeEach(async () => {
    const event = await EventHelper.add({
      type: 'notification',
      subtype: 'returnsInvitation'
    })

    eventId = event.id

    await NotificationHelper.add({ eventId })
    await NotificationHelper.add({ eventId })
  })

  it('should return the saved notifications', async () => {
    const result = await FetchNotificationsService.go(eventId)

    expect(result).equal([
      {
        createdAt: result[0].createdAt,
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
        returnLogIds: null,
        status: null,
        templateId: null
      },
      {
        createdAt: result[1].createdAt,
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
        returnLogIds: null,
        status: null,
        templateId: null
      }
    ])
  })
})
