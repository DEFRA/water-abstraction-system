'use strict'

// Test framework dependencies
const { describe, it, before, beforeEach, after } = require('node:test')
const { expect } = require('@hapi/code')

// Test helpers
const { closeConnection } = require('../support/database.js')
const LicenceHelper = require('../support/helpers/licence.helper.js')
const LicenceModel = require('../../app/models/licence.model.js')
const ReturnCycleHelper = require('../support/helpers/return-cycle.helper.js')
const ReturnCycleModel = require('../../app/models/return-cycle.model.js')
const ReturnLogHelper = require('../support/helpers/return-log.helper.js')
const ReturnSubmissionHelper = require('../support/helpers/return-submission.helper.js')
const ReturnSubmissionModel = require('../../app/models/return-submission.model.js')

// Thing under test
const ReturnLogModel = require('../../app/models/return-log.model.js')

describe('Return Log model', () => {
  let testRecord

  beforeEach(async () => {
    testRecord = await ReturnLogHelper.add()
  })

  after(async () => {
    await closeConnection()
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
      let testLicence

      beforeEach(async () => {
        testLicence = await LicenceHelper.add()

        const { licenceRef } = testLicence

        testRecord = await ReturnLogHelper.add({ licenceRef })
      })

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

    describe('when linking to return submissions', () => {
      let returnSubmissions

      beforeEach(async () => {
        const { id: returnLogId } = testRecord

        returnSubmissions = []
        for (let i = 0; i < 2; i++) {
          const version = i
          const returnSubmission = await ReturnSubmissionHelper.add({ returnLogId, version })

          returnSubmissions.push(returnSubmission)
        }
      })

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
        expect(result.returnSubmissions).to.include(returnSubmissions[0])
        expect(result.returnSubmissions).to.include(returnSubmissions[1])
      })
    })

    describe('when linking to return cycles', () => {
      let testRecord
      let returnCycle

      before(async () => {
        returnCycle = await ReturnCycleHelper.select()
        testRecord = await ReturnLogHelper.add({ returnCycleId: returnCycle.id })
      })

      it('can successfully run a related query', async () => {
        const query = await ReturnLogModel.query().innerJoinRelated('returnCycle')

        expect(query).to.exist()
      })

      it('can eager load the return submissions', async () => {
        const result = await ReturnLogModel.query().findById(testRecord.id).withGraphFetched('returnCycle')

        expect(result).to.be.instanceOf(ReturnLogModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.returnCycle).to.be.an.instanceOf(ReturnCycleModel)
        expect(result.returnCycle).to.equal(returnCycle, { skip: ['createdAt', 'updatedAt'] })
      })
    })
  })
})
