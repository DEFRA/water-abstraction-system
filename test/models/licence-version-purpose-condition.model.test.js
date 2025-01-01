'use strict'

// Test framework dependencies
const { describe, it, before, after } = require('node:test')
const { expect } = require('@hapi/code')

// Test helpers
const { closeConnection } = require('../support/database.js')
const LicenceMonitoringStationHelper = require('../support/helpers/licence-monitoring-station.helper.js')
const LicenceMonitoringStationModel = require('../../app/models/licence-monitoring-station.model.js')
const LicenceVersionPurposeConditionHelper = require('../support/helpers/licence-version-purpose-condition.helper.js')
const LicenceVersionPurposeConditionTypeHelper = require('../support/helpers/licence-version-purpose-condition-type.helper.js')
const LicenceVersionPurposeConditionTypeModel = require('../../app/models/licence-version-purpose-condition-type.model.js')
const LicenceVersionPurposeHelper = require('../support/helpers/licence-version-purpose.helper.js')
const LicenceVersionPurposeModel = require('../../app/models/licence-version-purpose.model.js')

// Thing under test
const LicenceVersionPurposeConditionModel = require('../../app/models/licence-version-purpose-condition.model.js')

describe('Licence Version Purpose Condition model', () => {
  let testLicenceMonitoringStations
  let testLicenceVersionPurposeConditionType
  let testLicenceVersionPurpose
  let testRecord

  before(async () => {
    testLicenceVersionPurposeConditionType = LicenceVersionPurposeConditionTypeHelper.select()
    testLicenceVersionPurpose = await LicenceVersionPurposeHelper.add()

    testRecord = await LicenceVersionPurposeConditionHelper.add({
      licenceVersionPurposeConditionTypeId: testLicenceVersionPurposeConditionType.id,
      licenceVersionPurposeId: testLicenceVersionPurpose.id
    })

    testLicenceMonitoringStations = []
    for (let i = 0; i < 2; i++) {
      const licenceMonitoringStation = await LicenceMonitoringStationHelper.add({
        licenceVersionPurposeConditionId: testRecord.id
      })

      testLicenceMonitoringStations.push(licenceMonitoringStation)
    }
  })

  after(async () => {
    await closeConnection()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LicenceVersionPurposeConditionModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(LicenceVersionPurposeConditionModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence monitoring stations', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceVersionPurposeConditionModel.query().innerJoinRelated('licenceMonitoringStations')

        expect(query).to.exist()
      })

      it('can eager load the licence monitoring stations', async () => {
        const result = await LicenceVersionPurposeConditionModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceMonitoringStations')

        expect(result).to.be.instanceOf(LicenceVersionPurposeConditionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceMonitoringStations).to.be.an.array()
        expect(result.licenceMonitoringStations[0]).to.be.an.instanceOf(LicenceMonitoringStationModel)
        expect(result.licenceMonitoringStations).to.include(testLicenceMonitoringStations[0])
        expect(result.licenceMonitoringStations).to.include(testLicenceMonitoringStations[1])
      })
    })

    describe('when linking to licence version purpose', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceVersionPurposeConditionModel.query().innerJoinRelated('licenceVersionPurpose')

        expect(query).to.exist()
      })

      it('can eager load the licence version purpose', async () => {
        const result = await LicenceVersionPurposeConditionModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceVersionPurpose')

        expect(result).to.be.instanceOf(LicenceVersionPurposeConditionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceVersionPurpose).to.be.an.instanceOf(LicenceVersionPurposeModel)
        expect(result.licenceVersionPurpose).to.equal(testLicenceVersionPurpose)
      })
    })

    describe('when linking to licence version purpose condition type', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceVersionPurposeConditionModel.query().innerJoinRelated(
          'licenceVersionPurposeConditionType'
        )

        expect(query).to.exist()
      })

      it('can eager load the licence version purpose condition type', async () => {
        const result = await LicenceVersionPurposeConditionModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceVersionPurposeConditionType')

        expect(result).to.be.instanceOf(LicenceVersionPurposeConditionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceVersionPurposeConditionType).to.be.an.instanceOf(LicenceVersionPurposeConditionTypeModel)
        expect(result.licenceVersionPurposeConditionType).to.equal(testLicenceVersionPurposeConditionType, {
          skip: ['createdAt', 'updatedAt']
        })
      })
    })
  })
})
