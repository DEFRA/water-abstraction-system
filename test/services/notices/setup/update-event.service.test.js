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
const UpdateEventService = require('../../../../app/services/notices/setup/update-event.service.js')

describe('Notices - Setup - Update event service', () => {
  const errorCount = 5

  let event

  describe('when there is no "error" count already set', () => {
    beforeEach(async () => {
      event = await EventHelper.add({
        metadata: {
          name: 'some existing data'
        },
        status: 'completed',
        subtype: 'returnReminder',
        type: 'notification'
      })
    })

    it('should update the event', async () => {
      await UpdateEventService.go(event.id, errorCount)

      const updatedResult = await EventModel.query().findById(event.id)

      expect(updatedResult.metadata.error).to.equal(errorCount)

      expect(updatedResult).equal({
        createdAt: event.createdAt,
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
        subtype: 'returnReminder',
        type: 'notification',
        updatedAt: updatedResult.updatedAt
      })
    })
  })

  describe('when there is an "error" count already set', () => {
    beforeEach(async () => {
      event = await EventHelper.add({
        metadata: {
          name: 'some existing data',
          error: 5
        },
        status: 'completed',
        subtype: 'returnReminder',
        type: 'notification'
      })
    })

    it('should update the event error count by adding the provided error count', async () => {
      await UpdateEventService.go(event.id, errorCount)

      const updatedResult = await EventModel.query().findById(event.id)

      expect(updatedResult.metadata.error).to.equal(10)

      expect(updatedResult).equal({
        createdAt: event.createdAt,
        entities: null,
        id: event.id,
        issuer: 'test.user@defra.gov.uk',
        licences: null,
        metadata: {
          error: 10,
          name: 'some existing data'
        },
        referenceCode: null,
        status: 'completed',
        subtype: 'returnReminder',
        type: 'notification',
        updatedAt: updatedResult.updatedAt
      })
    })
  })
})
