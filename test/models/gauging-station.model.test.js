'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const GaugingStationHelper = require('../support/helpers/gauging-station.helper.js')
const LicenceGaugingStationHelper = require('../support/helpers/licence-gauging-station.helper.js')
const LicenceGaugingStationModel = require('../../app/models/licence-gauging-station.model.js')

// Thing under test
const GaugingStationModel = require('../../app/models/gauging-station.model.js')

describe('Gauging Station model', () => {
  let testRecord

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await GaugingStationHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await GaugingStationModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(GaugingStationModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence gauging stations', () => {
      let testLicenceGaugingStations

      beforeEach(async () => {
        testRecord = await GaugingStationHelper.add()

        testLicenceGaugingStations = []
        for (let i = 0; i < 2; i++) {
          const licenceGaugingStation = await LicenceGaugingStationHelper.add(
            { gaugingStationId: testRecord.id }
          )

          testLicenceGaugingStations.push(licenceGaugingStation)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await GaugingStationModel.query()
          .innerJoinRelated('licenceGaugingStations')

        expect(query).to.exist()
      })

      it('can eager load the licence gauging stations', async () => {
        const result = await GaugingStationModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceGaugingStations')

        expect(result).to.be.instanceOf(GaugingStationModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceGaugingStations).to.be.an.array()
        expect(result.licenceGaugingStations[0]).to.be.an.instanceOf(LicenceGaugingStationModel)
        expect(result.licenceGaugingStations).to.include(testLicenceGaugingStations[0])
        expect(result.licenceGaugingStations).to.include(testLicenceGaugingStations[1])
      })
    })
  })
})
