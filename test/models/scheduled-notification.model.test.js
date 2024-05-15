'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../support/database.js')
const EventHelper = require('../support/helpers/event.helper.js')
const ScheduledNotificationHelper = require('../support/helpers/scheduled-notification.helper.js')
const EventModel = require('../../app/models/event.model.js')

// Thing under test
const ScheduledNotificationModel = require('../../app/models/scheduled-notification.model.js')

describe('Scheduled Notification model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseSupport.clean()

    testRecord = await ScheduledNotificationHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ScheduledNotificationModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ScheduledNotificationModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to events', () => {
      let testEvent
      beforeEach(async () => {
        testRecord = await ScheduledNotificationHelper.add()

        testEvent = await EventHelper.add({
          id: testRecord.eventId
        })
      })

      it('can successfully run a related query', async () => {
        const query = await ScheduledNotificationModel.query()
          .innerJoinRelated('event')

        expect(query).to.exist()
      })

      it('can eager load the events', async () => {
        const result = await ScheduledNotificationModel.query()
          .findById(testRecord.id)
          .withGraphFetched('event')

        expect(result).to.be.instanceOf(ScheduledNotificationModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.event).to.be.an.instanceOf(EventModel)
        expect(result.event).to.include(testEvent)
      })
    })
  })
})
