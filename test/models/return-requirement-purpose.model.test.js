'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const PrimaryPurposeModel = require('../../app/models/primary-purpose.model.js')
const PrimaryPurposesSeeder = require('../support/seeders/primary-purpose.seeder.js')
const PurposeModel = require('../../app/models/purpose.model.js')
const PurposesSeeder = require('../support/seeders/purposes.seeder.js')
const ReturnRequirementHelper = require('../support/helpers/return-requirement.helper.js')
const ReturnRequirementModel = require('../../app/models/return-requirement.model.js')
const ReturnRequirementPurposeHelper = require('../support/helpers/return-requirement-purpose.helper.js')
const SecondaryPurposeModel = require('../../app/models/secondary-purpose.model.js')
const SecondaryPurposesSeeder = require('../support/seeders/secondary-purpose.seeder.js')

// Thing under test
const ReturnRequirementPurposeModel = require('../../app/models/return-requirement-purpose.model.js')

describe('Return Requirement Purpose model', () => {
  let testRecord

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
        testPrimaryPurpose = PrimaryPurposesSeeder.data[0]

        testRecord = await ReturnRequirementPurposeHelper.add({ primaryPurposeId: testPrimaryPurpose.id })
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
        testPurpose = PurposesSeeder.data[0]

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
      testSecondaryPurpose = SecondaryPurposesSeeder.data[0]

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
