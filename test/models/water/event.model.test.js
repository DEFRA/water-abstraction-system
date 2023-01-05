'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const EventHelper = require('../../support/helpers/water/event.helper.js')

// Thing under test
const EventModel = require('../../../app/models/water/event.model.js')

describe('Event model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()

    testRecord = await EventHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await EventModel.query().findById(testRecord.eventId)

      expect(result).to.be.an.instanceOf(EventModel)
      expect(result.eventId).to.equal(testRecord.eventId)
    })
  })
})
