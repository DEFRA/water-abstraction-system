'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../support/database.js')
const PrimaryPurposeHelper = require('../support/helpers/primary-purpose.helper.js')
const PrimaryPurposeModel = require('../../app/models/primary-purpose.model.js')
const PurposeModel = require('../../app/models/purpose.model.js')
const PurposeHelper = require('../support/helpers/purpose.helper.js')
const ReturnRequirementHelper = require('../support/helpers/return-requirement.helper.js')
const ReturnRequirementModel = require('../../app/models/return-requirement.model.js')
const ReturnRequirementPurposeHelper = require('../support/helpers/return-requirement-purpose.helper.js')
const SecondaryPurposeHelper = require('../support/helpers/secondary-purpose.helper.js')
const SecondaryPurposeModel = require('../../app/models/secondary-purpose.model.js')

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
    describe('when linking to primary purpose', () => {
      let testPrimaryPurpose

      beforeEach(async () => {
        testPrimaryPurpose = await PrimaryPurposeHelper.add()

        const { id: primaryPurposeId } = testPrimaryPurpose
        testRecord = await ReturnRequirementPurposeHelper.add({ primaryPurposeId })
      })

      it('can successfully run a related query', async () => {
        const query = await ReturnRequirementPurposeModel.query()
          .innerJoinRelated('primaryPurpose')

        expect(query).to.exist()
      })

      it('can eager load the primary purpose', async () => {
        const result = await ReturnRequirementPurposeModel.query()
          .findById(testRecord.id)
          .withGraphFetched('primaryPurpose')

        expect(result).to.be.instanceOf(ReturnRequirementPurposeModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.primaryPurpose).to.be.an.instanceOf(PrimaryPurposeModel)
        expect(result.primaryPurpose.id).to.equal(testPrimaryPurpose.id)
      })
    })

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

      it('can eager load the purpose', async () => {
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

  describe('when linking to secondary purpose', () => {
    let testSecondaryPurpose

    beforeEach(async () => {
      testSecondaryPurpose = await SecondaryPurposeHelper.add()

      const { id: secondaryPurposeId } = testSecondaryPurpose
      testRecord = await ReturnRequirementPurposeHelper.add({ secondaryPurposeId })
    })

    it('can successfully run a related query', async () => {
      const query = await ReturnRequirementPurposeModel.query()
        .innerJoinRelated('secondaryPurpose')

      expect(query).to.exist()
    })

    it('can eager load the secondary purpose', async () => {
      const result = await ReturnRequirementPurposeModel.query()
        .findById(testRecord.id)
        .withGraphFetched('secondaryPurpose')

      expect(result).to.be.instanceOf(ReturnRequirementPurposeModel)
      expect(result.id).to.equal(testRecord.id)

      expect(result.secondaryPurpose).to.be.an.instanceOf(SecondaryPurposeModel)
      expect(result.secondaryPurpose.id).to.equal(testSecondaryPurpose.id)
    })
  })
})
