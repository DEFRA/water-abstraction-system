'use strict'

// Test framework dependencies
const { describe, it, before, after } = require('node:test')
const { expect } = require('@hapi/code')

// Test helpers
const { closeConnection } = require('../support/database.js')
const PointHelper = require('../support/helpers/point.helper.js')
const PointModel = require('../../app/models/point.model.js')
const ReturnRequirementHelper = require('../support/helpers/return-requirement.helper.js')
const ReturnRequirementModel = require('../../app/models/return-requirement.model.js')
const ReturnRequirementPointHelper = require('../support/helpers/return-requirement-point.helper.js')

// Thing under test
const ReturnRequirementPointModel = require('../../app/models/return-requirement-point.model.js')

describe('Return Requirement Point model', () => {
  let testPoint
  let testRecord
  let testReturnRequirement

  before(async () => {
    testPoint = await PointHelper.add()
    testReturnRequirement = await ReturnRequirementHelper.add()

    testRecord = await ReturnRequirementPointHelper.add({
      pointId: testPoint.id,
      returnRequirementId: testReturnRequirement.id
    })
  })

  after(async () => {
    await closeConnection()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ReturnRequirementPointModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ReturnRequirementPointModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to point', () => {
      it('can successfully run a related query', async () => {
        const query = await ReturnRequirementPointModel.query().innerJoinRelated('point')

        expect(query).to.exist()
      })

      it('can eager load the point', async () => {
        const result = await ReturnRequirementPointModel.query().findById(testRecord.id).withGraphFetched('point')

        expect(result).to.be.instanceOf(ReturnRequirementPointModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.point).to.be.an.instanceOf(PointModel)
        expect(result.point).to.equal(testPoint)
      })
    })

    describe('when linking to return requirement', () => {
      it('can successfully run a related query', async () => {
        const query = await ReturnRequirementPointModel.query().innerJoinRelated('returnRequirement')

        expect(query).to.exist()
      })

      it('can eager load the return requirement', async () => {
        const result = await ReturnRequirementPointModel.query()
          .findById(testRecord.id)
          .withGraphFetched('returnRequirement')

        expect(result).to.be.instanceOf(ReturnRequirementPointModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.returnRequirement).to.be.an.instanceOf(ReturnRequirementModel)
        expect(result.returnRequirement).to.equal(testReturnRequirement)
      })
    })
  })
})
