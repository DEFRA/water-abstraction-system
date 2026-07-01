'use strict'

// Test helpers
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

  beforeAll(async () => {
    testPoint = await PointHelper.add()
    testReturnRequirement = await ReturnRequirementHelper.add()

    testRecord = await ReturnRequirementPointHelper.add({
      pointId: testPoint.id,
      returnRequirementId: testReturnRequirement.id
    })
  })

  afterAll(async () => {
    await testPoint.$query().delete()
    await testReturnRequirement.$query().delete()

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ReturnRequirementPointModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(ReturnRequirementPointModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to point', () => {
      it('can successfully run a related query', async () => {
        const query = await ReturnRequirementPointModel.query().innerJoinRelated('point')

        expect(query).toBeDefined()
      })

      it('can eager load the point', async () => {
        const result = await ReturnRequirementPointModel.query().findById(testRecord.id).withGraphFetched('point')

        expect(result).toBeInstanceOf(ReturnRequirementPointModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.point).toBeInstanceOf(PointModel)
        expect(result.point).toEqual(testPoint)
      })
    })

    describe('when linking to return requirement', () => {
      it('can successfully run a related query', async () => {
        const query = await ReturnRequirementPointModel.query().innerJoinRelated('returnRequirement')

        expect(query).toBeDefined()
      })

      it('can eager load the return requirement', async () => {
        const result = await ReturnRequirementPointModel.query()
          .findById(testRecord.id)
          .withGraphFetched('returnRequirement')

        expect(result).toBeInstanceOf(ReturnRequirementPointModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.returnRequirement).toBeInstanceOf(ReturnRequirementModel)
        expect(result.returnRequirement).toEqual(testReturnRequirement)
      })
    })
  })
})
