'use strict'

// Test framework dependencies
const { describe, it, before, after } = require('node:test')
const { expect } = require('@hapi/code')

// Test helpers
const { closeConnection } = require('../support/database.js')
const LicenceMonitoringStationHelper = require('../support/helpers/licence-monitoring-station.helper.js')
const LicenceMonitoringStationModel = require('../../app/models/licence-monitoring-station.model.js')
const MonitoringStationHelper = require('../support/helpers/monitoring-station.helper.js')

// Thing under test
const MonitoringStationModel = require('../../app/models/monitoring-station.model.js')

describe('Monitoring Station model', () => {
  let testLicenceMonitoringStations
  let testRecord

  before(async () => {
    testRecord = await MonitoringStationHelper.add()

    testLicenceMonitoringStations = []
    for (let i = 0; i < 2; i++) {
      const licenceMonitoringStation = await LicenceMonitoringStationHelper.add({ monitoringStationId: testRecord.id })

      testLicenceMonitoringStations.push(licenceMonitoringStation)
    }
  })

  after(async () => {
    await closeConnection()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await MonitoringStationModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(MonitoringStationModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence monitoring stations', () => {
      it('can successfully run a related query', async () => {
        const query = await MonitoringStationModel.query().innerJoinRelated('licenceMonitoringStations')

        expect(query).to.exist()
      })

      it('can eager load the licence monitoring stations', async () => {
        const result = await MonitoringStationModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceMonitoringStations')

        expect(result).to.be.instanceOf(MonitoringStationModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceMonitoringStations).to.be.an.array()
        expect(result.licenceMonitoringStations[0]).to.be.an.instanceOf(LicenceMonitoringStationModel)
        expect(result.licenceMonitoringStations).to.include(testLicenceMonitoringStations[0])
        expect(result.licenceMonitoringStations).to.include(testLicenceMonitoringStations[1])
      })
    })
  })
})
