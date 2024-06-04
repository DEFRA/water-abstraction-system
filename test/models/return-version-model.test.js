'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../support/database.js')
const LicenceHelper = require('../support/helpers/licence.helper.js')
const LicenceModel = require('../../app/models/licence.model.js')
const ReturnVersionHelper = require('../support/helpers/return-version.helper.js')
const ReturnRequirementHelper = require('../support/helpers/return-requirement.helper.js')
const ReturnRequirementPointHelper = require('../support/helpers/return-requirement-point.helper.js')
const ReturnRequirementPointModel = require('../../app/models/return-requirement-point.model.js')

// Thing under test
const ReturnVersionModel = require('../../app/models/return-version.model.js')

describe('Return Version model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await ReturnVersionHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await ReturnVersionModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ReturnVersionModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence', () => {
      let testLicence

      beforeEach(async () => {
        testLicence = await LicenceHelper.add()

        const { id: licenceId } = testLicence
        testRecord = await ReturnVersionHelper.add({ licenceId })
      })

      it('can successfully run a related query', async () => {
        const query = await ReturnVersionModel.query()
          .innerJoinRelated('licence')

        expect(query).to.exist()
      })

      it('can eager load the licence', async () => {
        const result = await ReturnVersionModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licence')

        expect(result).to.be.instanceOf(ReturnVersionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licence).to.be.an.instanceOf(LicenceModel)
        expect(result.licence).to.equal(testLicence)
      })
    })

    describe('when linking to return requirement points', () => {
      let testReturnRequirementPoint

      beforeEach(async () => {
        testRecord = await ReturnVersionHelper.add()
        const testReturnRequirement = await ReturnRequirementHelper.add({
          returnVersionId: testRecord.id
        })
        testReturnRequirementPoint = await ReturnRequirementPointHelper.add({
          returnRequirementId: testReturnRequirement.id
        })
      })

      it('can successfully run a related query', async () => {
        const query = await ReturnVersionModel.query()
          .innerJoinRelated('returnRequirementPoints')

        expect(query).to.exist()
      })

      it('can eager load the return requirement points', async () => {
        const result = await ReturnVersionModel.query()
          .findById(testRecord.id)
          .withGraphFetched('returnRequirementPoints')

        expect(result).to.be.instanceOf(ReturnVersionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.returnRequirementPoints[0]).to.be.an.instanceOf(ReturnRequirementPointModel)
        expect(result.returnRequirementPoints[0]).to.equal(testReturnRequirementPoint)
      })
    })
  })
})
