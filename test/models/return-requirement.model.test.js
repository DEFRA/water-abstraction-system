'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../support/database.js')
const ReturnRequirementHelper = require('../support/helpers/return-requirement.helper.js')
const ReturnRequirementPointHelper = require('../support/helpers/return-requirement-point.helper.js')
const ReturnRequirementPointModel = require('../../app/models/return-requirement-point.model.js')
const ReturnRequirementPurposeHelper = require('../support/helpers/return-requirement-purpose.helper.js')
const ReturnRequirementPurposeModel = require('../../app/models/return-requirement-purpose.model.js')
const ReturnVersionHelper = require('../support/helpers/return-version.helper.js')
const ReturnVersionModel = require('../../app/models/return-version.model.js')

// Thing under test
const ReturnRequirementModel = require('../../app/models/return-requirement.model.js')

describe('Return Requirement model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await ReturnRequirementHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await ReturnRequirementModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ReturnRequirementModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to return requirement points', () => {
      let testReturnRequirementPoints

      beforeEach(async () => {
        testRecord = await ReturnRequirementHelper.add()

        testReturnRequirementPoints = []
        for (let i = 0; i < 2; i++) {
          const returnRequirementPoint = await ReturnRequirementPointHelper.add(
            { description: `TEST RET PNT ${i}`, returnRequirementId: testRecord.id }
          )
          testReturnRequirementPoints.push(returnRequirementPoint)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await ReturnRequirementModel.query()
          .innerJoinRelated('returnRequirementPoints')

        expect(query).to.exist()
      })

      it('can eager load the return requirement points', async () => {
        const result = await ReturnRequirementModel.query()
          .findById(testRecord.id)
          .withGraphFetched('returnRequirementPoints')

        expect(result).to.be.instanceOf(ReturnRequirementModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.returnRequirementPoints).to.be.an.array()
        expect(result.returnRequirementPoints[0]).to.be.an.instanceOf(ReturnRequirementPointModel)
        expect(result.returnRequirementPoints).to.include(testReturnRequirementPoints[0])
        expect(result.returnRequirementPoints).to.include(testReturnRequirementPoints[1])
      })
    })

    describe('when linking to return requirement purposes', () => {
      let testReturnRequirementPurposes

      beforeEach(async () => {
        testRecord = await ReturnRequirementHelper.add()

        testReturnRequirementPurposes = []
        for (let i = 0; i < 2; i++) {
          const returnRequirementPurpose = await ReturnRequirementPurposeHelper.add(
            { alias: `TEST RET REQ ${i}`, returnRequirementId: testRecord.id }
          )
          testReturnRequirementPurposes.push(returnRequirementPurpose)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await ReturnRequirementModel.query()
          .innerJoinRelated('returnRequirementPurposes')

        expect(query).to.exist()
      })

      it('can eager load the return requirement purposes', async () => {
        const result = await ReturnRequirementModel.query()
          .findById(testRecord.id)
          .withGraphFetched('returnRequirementPurposes')

        expect(result).to.be.instanceOf(ReturnRequirementModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.returnRequirementPurposes).to.be.an.array()
        expect(result.returnRequirementPurposes[0]).to.be.an.instanceOf(ReturnRequirementPurposeModel)
        expect(result.returnRequirementPurposes).to.include(testReturnRequirementPurposes[0])
        expect(result.returnRequirementPurposes).to.include(testReturnRequirementPurposes[1])
      })
    })

    describe('when linking to return version', () => {
      let testReturnVersion

      beforeEach(async () => {
        testReturnVersion = await ReturnVersionHelper.add()
        testRecord = await ReturnRequirementHelper.add({ returnVersionId: testReturnVersion.id })
      })

      it('can successfully run a related query', async () => {
        const query = await ReturnRequirementModel.query()
          .innerJoinRelated('returnVersion')

        expect(query).to.exist()
      })

      it('can eager load the charge version', async () => {
        const result = await ReturnRequirementModel.query()
          .findById(testRecord.id)
          .withGraphFetched('returnVersion')

        expect(result).to.be.instanceOf(ReturnRequirementModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.returnVersion).to.be.an.instanceOf(ReturnVersionModel)
        expect(result.returnVersion).to.equal(testReturnVersion)
      })
    })
  })
})
