'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../support/database.js')
const EventHelper = require('../support/helpers/event.helper.js')

// Thing under test
const EventModel = require('../../app/models/event.model.js')

describe('Event model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseSupport.clean()

    testRecord = await EventHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await EventModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(EventModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })
})
