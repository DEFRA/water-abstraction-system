'use strict'

// Test framework dependencies

const Code = require('@hapi/code')

const { describe, it, before } = require('node:test')
const { expect } = Code

// Test helpers
const MonitoringStationHelper = require('../support/helpers/monitoring-station.helper.js')
const MonitoringStationModel = require('../../app/models/monitoring-station.model.js')
const LicenceMonitoringStationHelper = require('../support/helpers/licence-monitoring-station.helper.js')
const LicenceHelper = require('../support/helpers/licence.helper.js')
const LicenceModel = require('../../app/models/licence.model.js')

// Thing under test
const LicenceMonitoringStationModel = require('../../app/models/licence-monitoring-station.model.js')

describe('Licence Monitoring Station model', () => {
  let testLicence
  let testMonitoringStation
  let testRecord

  before(async () => {
    testLicence = await LicenceHelper.add()
    testMonitoringStation = await MonitoringStationHelper.add()

    testRecord = await LicenceMonitoringStationHelper.add({
      licenceId: testLicence.id,
      monitoringStationId: testMonitoringStation.id
    })
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LicenceMonitoringStationModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(LicenceMonitoringStationModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to monitoring station', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceMonitoringStationModel.query()
          .innerJoinRelated('monitoringStation')

        expect(query).to.exist()
      })

      it('can eager load the monitoring station', async () => {
        const result = await LicenceMonitoringStationModel.query()
          .findById(testRecord.id)
          .withGraphFetched('monitoringStation')

        expect(result).to.be.instanceOf(LicenceMonitoringStationModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.monitoringStation).to.be.an.instanceOf(MonitoringStationModel)
        expect(result.monitoringStation).to.equal(testMonitoringStation)
      })
    })

    describe('when linking to licence', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceMonitoringStationModel.query()
          .innerJoinRelated('licence')

        expect(query).to.exist()
      })

      it('can eager load the licence', async () => {
        const result = await LicenceMonitoringStationModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licence')

        expect(result).to.be.instanceOf(LicenceMonitoringStationModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licence).to.be.an.instanceOf(LicenceModel)
        expect(result.licence).to.equal(testLicence)
      })
    })
  })
})
