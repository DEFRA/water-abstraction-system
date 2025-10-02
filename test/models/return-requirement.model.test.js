'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const PointHelper = require('../support/helpers/point.helper.js')
const PointModel = require('../../app/models/point.model.js')
const ReturnLogHelper = require('../support/helpers/return-log.helper.js')
const ReturnLogModel = require('../../app/models/return-log.model.js')
const ReturnRequirementHelper = require('../support/helpers/return-requirement.helper.js')
const ReturnRequirementPointHelper = require('../support/helpers/return-requirement-point.helper.js')
const ReturnRequirementPurposeHelper = require('../support/helpers/return-requirement-purpose.helper.js')
const ReturnRequirementPurposeModel = require('../../app/models/return-requirement-purpose.model.js')
const ReturnVersionHelper = require('../support/helpers/return-version.helper.js')
const ReturnVersionModel = require('../../app/models/return-version.model.js')

// Thing under test
const ReturnRequirementModel = require('../../app/models/return-requirement.model.js')

describe('Return Requirement model', () => {
  let testPoint
  let testRecord
  let testReturnLogs
  let testReturnRequirementPurposes
  let testReturnVersion

  before(async () => {
    testReturnVersion = await ReturnVersionHelper.add()

    testRecord = await ReturnRequirementHelper.add({ returnVersionId: testReturnVersion.id })

    testPoint = await PointHelper.add()
    await ReturnRequirementPointHelper.add({ pointId: testPoint.id, returnRequirementId: testRecord.id })

    testReturnRequirementPurposes = []
    for (let i = 0; i < 2; i++) {
      const returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
        alias: `TEST RET REQ ${i}`,
        returnRequirementId: testRecord.id
      })

      testReturnRequirementPurposes.push(returnRequirementPurpose)
    }

    testReturnLogs = []
    for (let i = 0; i < 2; i++) {
      const returnLog = await ReturnLogHelper.add({ returnRequirementId: testRecord.id })

      testReturnLogs.push(returnLog)
    }
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ReturnRequirementModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ReturnRequirementModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking through return requirement points to points', () => {
      it('can successfully run a related query', async () => {
        const query = await ReturnRequirementModel.query().innerJoinRelated('points')

        expect(query).to.exist()
      })

      it('can eager load the points', async () => {
        const result = await ReturnRequirementModel.query().findById(testRecord.id).withGraphFetched('points')

        expect(result).to.be.instanceOf(ReturnRequirementModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.points).to.be.an.array()
        expect(result.points).to.have.length(1)
        expect(result.points[0]).to.be.an.instanceOf(PointModel)
        expect(result.points[0]).to.equal(testPoint, { skip: ['createdAt', 'updatedAt'] })
      })
    })

    describe('when linking to return logs', () => {
      it('can successfully run a related query', async () => {
        const query = await ReturnRequirementModel.query().innerJoinRelated('returnLogs')

        expect(query).to.exist()
      })

      it('can eager load the return logs', async () => {
        const result = await ReturnRequirementModel.query().findById(testRecord.id).withGraphFetched('returnLogs')

        expect(result).to.be.instanceOf(ReturnRequirementModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.returnLogs).to.be.an.array()
        expect(result.returnLogs[0]).to.be.an.instanceOf(ReturnLogModel)
        expect(result.returnLogs).to.include(testReturnLogs[0])
        expect(result.returnLogs).to.include(testReturnLogs[1])
      })
    })

    describe('when linking to return requirement purposes', () => {
      it('can successfully run a related query', async () => {
        const query = await ReturnRequirementModel.query().innerJoinRelated('returnRequirementPurposes')

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
      it('can successfully run a related query', async () => {
        const query = await ReturnRequirementModel.query().innerJoinRelated('returnVersion')

        expect(query).to.exist()
      })

      it('can eager load the charge version', async () => {
        const result = await ReturnRequirementModel.query().findById(testRecord.id).withGraphFetched('returnVersion')

        expect(result).to.be.instanceOf(ReturnRequirementModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.returnVersion).to.be.an.instanceOf(ReturnVersionModel)
        expect(result.returnVersion).to.equal(testReturnVersion)
      })
    })
  })
})
