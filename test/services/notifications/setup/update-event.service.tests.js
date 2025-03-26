'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventHelper = require('../../../support/helpers/event.helper.js')
const EventModel = require('../../../../app/models/event.model.js')

// Thing under test
const UpdateEventService = require('../../../../app/services/notifications/setup/update-event.service.js')

describe('Notifications Setup - Update event service', () => {
  const errorCount = 5
  
  let event

  beforeEach(async () => {
    event = await EventHelper.add({
      metadata: {
        name: 'some existing data'
      },
      status: 'completed',
      subtype: 'returnsReminder',
      type: 'notification'
    })
  })

  it('should update the event', async () => {
    await UpdateEventService.go(event.id, errorCount)

    const updatedResult = await EventModel.query().findById(event.id)

    expect(updatedResult.metadata.error).to.equal(errorCount)

    expect(updatedResult).equal({
      createdAt: updatedResult.createdAt,
      entities: null,
      id: event.id,
      issuer: 'test.user@defra.gov.uk',
      licences: null,
      metadata: {
        error: errorCount,
        name: 'some existing data'
      },
      referenceCode: null,
      status: 'completed',
      subtype: 'returnsReminder',
      type: 'notification',
      updatedAt: updatedResult.updatedAt
    })
  })
})
