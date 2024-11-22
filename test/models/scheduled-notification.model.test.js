'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventHelper = require('../support/helpers/event.helper.js')
const EventModel = require('../../app/models/event.model.js')
const ScheduledNotificationHelper = require('../support/helpers/scheduled-notification.helper.js')

// Thing under test
const ScheduledNotificationModel = require('../../app/models/scheduled-notification.model.js')

describe('Scheduled Notification model', () => {
  let testRecord

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await ScheduledNotificationHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await ScheduledNotificationModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ScheduledNotificationModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to event', () => {
      let testEvent

      beforeEach(async () => {
        testEvent = await EventHelper.add()

        testRecord = await ScheduledNotificationHelper.add({ eventId: testEvent.id })
      })

      it('can successfully run a related query', async () => {
        const query = await ScheduledNotificationModel.query().innerJoinRelated('event')

        expect(query).to.exist()
      })

      it('can eager load the event', async () => {
        const result = await ScheduledNotificationModel.query().findById(testRecord.id).withGraphFetched('event')

        expect(result).to.be.instanceOf(ScheduledNotificationModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.event).to.be.an.instanceOf(EventModel)
        expect(result.event).to.include(testEvent)
      })
    })
  })
})
