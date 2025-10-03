'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventHelper = require('../support/helpers/event.helper.js')
const NotificationHelper = require('../support/helpers/notification.helper.js')
const NotificationModel = require('../../app/models/notification.model.js')

// Thing under test
const EventModel = require('../../app/models/event.model.js')

describe('Event model', () => {
  let testNotifications
  let testRecord

  before(async () => {
    testRecord = await EventHelper.add()

    testNotifications = []
    for (let i = 0; i < 2; i++) {
      const notification = await NotificationHelper.add({
        eventId: testRecord.id
      })

      testNotifications.push(notification)
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
    describe('when linking to Notifications', () => {
      it('can successfully run a related query', async () => {
        const query = await EventModel.query().innerJoinRelated('notifications')

        expect(query).to.exist()
      })

      it('can eager load the notifications', async () => {
        const result = await EventModel.query().findById(testRecord.id).withGraphFetched('notifications')

        expect(result).to.be.instanceOf(EventModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.notifications).to.be.an.array()
        expect(result.notifications[0]).to.be.an.instanceOf(NotificationModel)
        expect(result.notifications).to.include(testNotifications[0])
        expect(result.notifications).to.include(testNotifications[1])
      })
    })
  })
})
