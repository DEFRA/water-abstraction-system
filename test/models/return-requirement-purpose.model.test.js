'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../support/database.js')
const PurposeModel = require('../../app/models/purpose.model.js')
const PurposeHelper = require('../support/helpers/purpose.helper.js')
const ReturnRequirementHelper = require('../support/helpers/return-requirement.helper.js')
const ReturnRequirementModel = require('../../app/models/return-requirement.model.js')
const ReturnRequirementPurposeHelper = require('../support/helpers/return-requirement-purpose.helper.js')

// Thing under test
const ReturnRequirementPurposeModel = require('../../app/models/return-requirement-purpose.model.js')

describe('Return Requirement Purpose model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await ReturnRequirementPurposeHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await ReturnRequirementPurposeModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ReturnRequirementPurposeModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to purpose', () => {
      let testPurpose

      beforeEach(async () => {
        testPurpose = await PurposeHelper.add()

        const { id: purposeId } = testPurpose
        testRecord = await ReturnRequirementPurposeHelper.add({ purposeId })
      })

      it('can successfully run a related query', async () => {
        const query = await ReturnRequirementPurposeModel.query()
          .innerJoinRelated('purpose')

        expect(query).to.exist()
      })

      it('can eager load the purposes use', async () => {
        const result = await ReturnRequirementPurposeModel.query()
          .findById(testRecord.id)
          .withGraphFetched('purpose')

        expect(result).to.be.instanceOf(ReturnRequirementPurposeModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.purpose).to.be.an.instanceOf(PurposeModel)
        expect(result.purpose).to.equal(testPurpose)
      })
    })

    describe('when linking to return requirement', () => {
      let testReturnRequirement

      beforeEach(async () => {
        testReturnRequirement = await ReturnRequirementHelper.add()

        const { id: returnRequirementId } = testReturnRequirement
        testRecord = await ReturnRequirementPurposeHelper.add({ returnRequirementId })
      })

      it('can successfully run a related query', async () => {
        const query = await ReturnRequirementPurposeModel.query()
          .innerJoinRelated('returnRequirement')

        expect(query).to.exist()
      })

      it('can eager load the charge reference', async () => {
        const result = await ReturnRequirementPurposeModel.query()
          .findById(testRecord.id)
          .withGraphFetched('returnRequirement')

        expect(result).to.be.instanceOf(ReturnRequirementPurposeModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.returnRequirement).to.be.an.instanceOf(ReturnRequirementModel)
        expect(result.returnRequirement).to.equal(testReturnRequirement)
      })
    })
  })
})
