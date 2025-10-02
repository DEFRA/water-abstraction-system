'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../support/helpers/licence.helper.js')
const LicenceModel = require('../../app/models/licence.model.js')
const ReturnCycleHelper = require('../support/helpers/return-cycle.helper.js')
const ReturnCycleModel = require('../../app/models/return-cycle.model.js')
const ReturnLogHelper = require('../support/helpers/return-log.helper.js')
const ReturnRequirementHelper = require('../support/helpers/return-requirement.helper.js')
const ReturnRequirementModel = require('../../app/models/return-requirement.model.js')
const ReturnSubmissionHelper = require('../support/helpers/return-submission.helper.js')
const ReturnSubmissionModel = require('../../app/models/return-submission.model.js')

// Thing under test
const ReturnLogModel = require('../../app/models/return-log.model.js')

describe('Return Log model', () => {
  let testLicence
  let testRecord
  let testReturnCycle
  let testReturnRequirements
  let testReturnSubmissions

  before(async () => {
    testLicence = await LicenceHelper.add()
    testReturnCycle = await ReturnCycleHelper.select()
    testReturnRequirements = await ReturnRequirementHelper.add()

    testRecord = await ReturnLogHelper.add({
      licenceRef: testLicence.licenceRef,
      returnCycleId: testReturnCycle.id,
      returnRequirementId: testReturnRequirements.id
    })

    testReturnSubmissions = []
    for (let i = 0; i < 2; i++) {
      const version = i
      const testReturnSubmission = await ReturnSubmissionHelper.add({ returnLogId: testRecord.id, version })

      testReturnSubmissions.push(testReturnSubmission)
    }
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ReturnLogModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ReturnLogModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence', () => {
      it('can successfully run a related query', async () => {
        const query = await ReturnLogModel.query().innerJoinRelated('licence')

        expect(query).to.exist()
      })

      it('can eager load the licence', async () => {
        const result = await ReturnLogModel.query().findById(testRecord.id).withGraphFetched('licence')

        expect(result).to.be.instanceOf(ReturnLogModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licence).to.be.an.instanceOf(LicenceModel)
        expect(result.licence).to.equal(testLicence)
      })
    })

    describe('when linking to return cycles', () => {
      it('can successfully run a related query', async () => {
        const query = await ReturnLogModel.query().innerJoinRelated('returnCycle')

        expect(query).to.exist()
      })

      it('can eager load the return submissions', async () => {
        const result = await ReturnLogModel.query().findById(testRecord.id).withGraphFetched('returnCycle')

        expect(result).to.be.instanceOf(ReturnLogModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.returnCycle).to.be.an.instanceOf(ReturnCycleModel)
        expect(result.returnCycle).to.equal(testReturnCycle, { skip: ['createdAt', 'updatedAt'] })
      })
    })

    describe('when linking to return requirements', () => {
      it('can successfully run a related query', async () => {
        const query = await ReturnLogModel.query().innerJoinRelated('returnRequirement')

        expect(query).to.exist()
      })

      it('can eager load the return requirement', async () => {
        const result = await ReturnLogModel.query().findById(testRecord.id).withGraphFetched('returnRequirement')

        expect(result).to.be.instanceOf(ReturnLogModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.returnRequirement).to.be.an.instanceOf(ReturnRequirementModel)
        expect(result.returnRequirement).to.equal(testReturnRequirements)
      })
    })

    describe('when linking to return submissions', () => {
      it('can successfully run a related query', async () => {
        const query = await ReturnLogModel.query().innerJoinRelated('returnSubmissions')

        expect(query).to.exist()
      })

      it('can eager load the return submissions', async () => {
        const result = await ReturnLogModel.query().findById(testRecord.id).withGraphFetched('returnSubmissions')

        expect(result).to.be.instanceOf(ReturnLogModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.returnSubmissions).to.be.an.array()
        expect(result.returnSubmissions[0]).to.be.an.instanceOf(ReturnSubmissionModel)
        expect(result.returnSubmissions).to.include(testReturnSubmissions[0])
        expect(result.returnSubmissions).to.include(testReturnSubmissions[1])
      })
    })
  })
})
