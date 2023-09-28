'use strict'

// Test helpers
const EventHelper = require('../../support/helpers/water/event.helper.js')

// Thing under test
const EventModel = require('../../../app/models/water/event.model.js')

describe('Event model', () => {
  let testRecord

  beforeEach(async () => {
    testRecord = await EventHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await EventModel.query().findById(testRecord.eventId)

      expect(result).toBeInstanceOf(EventModel)
      expect(result.eventId).toBe(testRecord.eventId)
    })
  })
})
