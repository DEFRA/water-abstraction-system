// Test framework
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import EventHelper from '../support/helpers/event.helper.js'
import EventModel from '../../app/models/event.model.js'
import LicenceMonitoringStationHelper from '../support/helpers/licence-monitoring-station.helper.js'
import LicenceMonitoringStationModel from '../../app/models/licence-monitoring-station.model.js'
import NotificationHelper from '../support/helpers/notification.helper.js'

// Thing under test
import NotificationModel from '../../app/models/notification.model.js'

describe('Notification model', () => {
  let testEvent
  let testLicenceMonitoringStation
  let testRecord

  beforeAll(async () => {
    testEvent = await EventHelper.add()
    testLicenceMonitoringStation = await LicenceMonitoringStationHelper.add()

    testRecord = await NotificationHelper.add({
      eventId: testEvent.id,
      licenceMonitoringStationId: testLicenceMonitoringStation.id
    })
  })

  afterAll(async () => {
    await testEvent.$query().delete()
    await testLicenceMonitoringStation.$query().delete()

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await NotificationModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(NotificationModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to event', () => {
      it('can successfully run a related query', async () => {
        const query = await NotificationModel.query().innerJoinRelated('event')

        expect(query).toBeDefined()
      })

      it('can eager load the event', async () => {
        const result = await NotificationModel.query().findById(testRecord.id).withGraphFetched('event')

        expect(result).toBeInstanceOf(NotificationModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.event).toBeInstanceOf(EventModel)
        expect(result.event).toMatchObject(testEvent)
      })
    })

    describe('when linking to licence monitoring station', () => {
      it('can successfully run a related query', async () => {
        const query = await NotificationModel.query().innerJoinRelated('licenceMonitoringStation')

        expect(query).toBeDefined()
      })

      it('can eager load the event', async () => {
        const result = await NotificationModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceMonitoringStation')

        expect(result).toBeInstanceOf(NotificationModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licenceMonitoringStation).toBeInstanceOf(LicenceMonitoringStationModel)
        expect(result.licenceMonitoringStation).toMatchObject(testLicenceMonitoringStation)
      })
    })
  })
})
