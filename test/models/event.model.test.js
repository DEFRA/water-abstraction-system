'use strict'

// Test framework dependencies
const { describe, it, before, after } = require('node:test')
const { expect } = require('@hapi/code')

// Test helpers
const { closeConnection } = require('../support/database.js')
const EventHelper = require('../support/helpers/event.helper.js')

// Thing under test
const EventModel = require('../../app/models/event.model.js')

describe('Event model', () => {
  let testRecord

  before(async () => {
    testRecord = await EventHelper.add()
  })

  after(async () => {
    await closeConnection()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await EventModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(EventModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })
})
