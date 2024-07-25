'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const GaugingStationHelper = require('../support/helpers/gauging-station.helper.js')
const GaugingStationModel = require('../../app/models/gauging-station.model.js')
const LicenceGaugingStationHelper = require('../support/helpers/licence-gauging-station.helper.js')
const LicenceHelper = require('../support/helpers/licence.helper.js')
const LicenceModel = require('../../app/models/licence.model.js')

// Thing under test
const LicenceGaugingStationModel = require('../../app/models/licence-gauging-station.model.js')

describe('Licence Gauging Station model', () => {
  let testRecord

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await LicenceGaugingStationHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await LicenceGaugingStationModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(LicenceGaugingStationModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to gauging station', () => {
      let testGaugingStation

      beforeEach(async () => {
        testGaugingStation = await GaugingStationHelper.add()

        const { id: gaugingStationId } = testGaugingStation

        testRecord = await LicenceGaugingStationHelper.add({ gaugingStationId })
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceGaugingStationModel.query()
          .innerJoinRelated('gaugingStation')

        expect(query).to.exist()
      })

      it('can eager load the gauging station', async () => {
        const result = await LicenceGaugingStationModel.query()
          .findById(testRecord.id)
          .withGraphFetched('gaugingStation')

        expect(result).to.be.instanceOf(LicenceGaugingStationModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.gaugingStation).to.be.an.instanceOf(GaugingStationModel)
        expect(result.gaugingStation).to.equal(testGaugingStation)
      })
    })

    describe('when linking to licence', () => {
      let testLicence

      beforeEach(async () => {
        testLicence = await LicenceHelper.add()

        const { id: licenceId } = testLicence

        testRecord = await LicenceGaugingStationHelper.add({ licenceId })
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceGaugingStationModel.query()
          .innerJoinRelated('licence')

        expect(query).to.exist()
      })

      it('can eager load the licence', async () => {
        const result = await LicenceGaugingStationModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licence')

        expect(result).to.be.instanceOf(LicenceGaugingStationModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licence).to.be.an.instanceOf(LicenceModel)
        expect(result.licence).to.equal(testLicence)
      })
    })
  })
})
