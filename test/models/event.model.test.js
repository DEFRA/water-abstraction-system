'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventHelper = require('../support/helpers/event.helper.js')
const ScheduledNotificationHelper = require('../support/helpers/scheduled-notification.helper.js')
const ScheduledNotificationModel = require('../../app/models/scheduled-notification.model.js')

// Thing under test
const EventModel = require('../../app/models/event.model.js')

describe('Event model', () => {
  let testRecord
  let testScheduledNotifications

  before(async () => {
    testRecord = await EventHelper.add()

    testScheduledNotifications = []
    for (let i = 0; i < 2; i++) {
      const scheduledNotification = await ScheduledNotificationHelper.add({
        eventId: testRecord.id
      })

      testScheduledNotifications.push(scheduledNotification)
    }
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await EventModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(EventModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to scheduled Notifications', () => {
      it('can successfully run a related query', async () => {
        const query = await EventModel.query().innerJoinRelated('scheduledNotifications')

        expect(query).to.exist()
      })

      it('can eager load the scheduled notifications', async () => {
        const result = await EventModel.query().findById(testRecord.id).withGraphFetched('scheduledNotifications')

        expect(result).to.be.instanceOf(EventModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.scheduledNotifications).to.be.an.array()
        expect(result.scheduledNotifications[0]).to.be.an.instanceOf(ScheduledNotificationModel)
        expect(result.scheduledNotifications).to.include(testScheduledNotifications[0])
        expect(result.scheduledNotifications).to.include(testScheduledNotifications[1])
      })
    })
  })
})
