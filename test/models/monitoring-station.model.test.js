// Test helpers
import * as LicenceMonitoringStationHelper from '../support/helpers/licence-monitoring-station.helper.js'
import * as MonitoringStationHelper from '../support/helpers/monitoring-station.helper.js'
import LicenceMonitoringStationModel from '../../app/models/licence-monitoring-station.model.js'

// Thing under test
import MonitoringStationModel from '../../app/models/monitoring-station.model.js'

describe('Monitoring Station model', () => {
  let testLicenceMonitoringStations
  let testRecord

  beforeAll(async () => {
    testRecord = await MonitoringStationHelper.add()

    testLicenceMonitoringStations = []
    for (let i = 0; i < 2; i++) {
      const licenceMonitoringStation = await LicenceMonitoringStationHelper.add({ monitoringStationId: testRecord.id })

      testLicenceMonitoringStations.push(licenceMonitoringStation)
    }
  })

  afterAll(async () => {
    for (const licenceMonitoringStation of testLicenceMonitoringStations) {
      await licenceMonitoringStation.$query().delete()
    }

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await MonitoringStationModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(MonitoringStationModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence monitoring stations', () => {
      it('can successfully run a related query', async () => {
        const query = await MonitoringStationModel.query().innerJoinRelated('licenceMonitoringStations')

        expect(query).toBeDefined()
      })

      it('can eager load the licence monitoring stations', async () => {
        const result = await MonitoringStationModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceMonitoringStations')

        expect(result).toBeInstanceOf(MonitoringStationModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licenceMonitoringStations).toBeInstanceOf(Array)
        expect(result.licenceMonitoringStations[0]).toBeInstanceOf(LicenceMonitoringStationModel)
        expect(result.licenceMonitoringStations).toContainEqual(testLicenceMonitoringStations[0])
        expect(result.licenceMonitoringStations).toContainEqual(testLicenceMonitoringStations[1])
      })
    })
  })
})
