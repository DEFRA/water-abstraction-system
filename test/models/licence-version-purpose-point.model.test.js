'use strict'

// Test framework dependencies
const { describe, it, before, after } = require('node:test')
const { expect } = require('@hapi/code')

// Test helpers
const { closeConnection } = require('../support/database.js')
const LicenceVersionPurposeHelper = require('../support/helpers/licence-version-purpose.helper.js')
const LicenceVersionPurposeModel = require('../../app/models/licence-version-purpose.model.js')
const LicenceVersionPurposePointHelper = require('../support/helpers/licence-version-purpose-point.helper.js')
const PointHelper = require('../support/helpers/point.helper.js')
const PointModel = require('../../app/models/point.model.js')

// Thing under test
const LicenceVersionPurposePointModel = require('../../app/models/licence-version-purpose-point.model.js')

describe('Licence Version Purpose Point model', () => {
  let testLicenceVersionPurpose
  let testPoint
  let testRecord

  before(async () => {
    testLicenceVersionPurpose = await LicenceVersionPurposeHelper.add()
    testPoint = await PointHelper.add()

    testRecord = await LicenceVersionPurposePointHelper.add({
      licenceVersionPurposeId: testLicenceVersionPurpose.id,
      pointId: testPoint.id
    })
  })

  after(async () => {
    await closeConnection()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LicenceVersionPurposePointModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(LicenceVersionPurposePointModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence version purpose', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceVersionPurposePointModel.query().innerJoinRelated('licenceVersionPurpose')

        expect(query).to.exist()
      })

      it('can eager load the licence version purpose', async () => {
        const result = await LicenceVersionPurposePointModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceVersionPurpose')

        expect(result).to.be.instanceOf(LicenceVersionPurposePointModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceVersionPurpose).to.be.an.instanceOf(LicenceVersionPurposeModel)
        expect(result.licenceVersionPurpose).to.equal(testLicenceVersionPurpose)
      })
    })

    describe('when linking to point', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceVersionPurposePointModel.query().innerJoinRelated('point')

        expect(query).to.exist()
      })

      it('can eager load the point', async () => {
        const result = await LicenceVersionPurposePointModel.query().findById(testRecord.id).withGraphFetched('point')

        expect(result).to.be.instanceOf(LicenceVersionPurposePointModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.point).to.be.an.instanceOf(PointModel)
        expect(result.point).to.equal(testPoint)
      })
    })
  })
})
