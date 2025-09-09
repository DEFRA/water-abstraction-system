'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventHelper = require('../support/helpers/event.helper.js')
const EventModel = require('../../app/models/event.model.js')
const LicenceMonitoringStationHelper = require('../support/helpers/licence-monitoring-station.helper.js')
const LicenceMonitoringStationModel = require('../../app/models/licence-monitoring-station.model.js')
const NotificationHelper = require('../support/helpers/notification.helper.js')

// Thing under test
const NotificationModel = require('../../app/models/notification.model.js')

describe('Notification model', () => {
  let testEvent
  let testLicenceMonitoringStation
  let testRecord

  before(async () => {
    testEvent = await EventHelper.add()
    testLicenceMonitoringStation = await LicenceMonitoringStationHelper.add()

    testRecord = await NotificationHelper.add({
      eventId: testEvent.id,
      licenceMonitoringStationId: testLicenceMonitoringStation.id
    })
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await NotificationModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(NotificationModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to event', () => {
      it('can successfully run a related query', async () => {
        const query = await NotificationModel.query().innerJoinRelated('event')

        expect(query).to.exist()
      })

      it('can eager load the event', async () => {
        const result = await NotificationModel.query().findById(testRecord.id).withGraphFetched('event')

        expect(result).to.be.instanceOf(NotificationModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.event).to.be.an.instanceOf(EventModel)
        expect(result.event).to.include(testEvent)
      })
    })

    describe('when linking to licence monitoring station', () => {
      it('can successfully run a related query', async () => {
        const query = await NotificationModel.query().innerJoinRelated('licenceMonitoringStation')

        expect(query).to.exist()
      })

      it('can eager load the event', async () => {
        const result = await NotificationModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceMonitoringStation')

        expect(result).to.be.instanceOf(NotificationModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceMonitoringStation).to.be.an.instanceOf(LicenceMonitoringStationModel)
        expect(result.licenceMonitoringStation).to.include(testLicenceMonitoringStation)
      })
    })
  })
})
