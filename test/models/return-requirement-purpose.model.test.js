'use strict'

// Test helpers
const PrimaryPurposeHelper = require('../support/helpers/primary-purpose.helper.js')
const PrimaryPurposeModel = require('../../app/models/primary-purpose.model.js')
const PurposeHelper = require('../support/helpers/purpose.helper.js')
const PurposeModel = require('../../app/models/purpose.model.js')
const ReturnRequirementHelper = require('../support/helpers/return-requirement.helper.js')
const ReturnRequirementModel = require('../../app/models/return-requirement.model.js')
const ReturnRequirementPurposeHelper = require('../support/helpers/return-requirement-purpose.helper.js')
const SecondaryPurposeHelper = require('../support/helpers/secondary-purpose.helper.js')
const SecondaryPurposeModel = require('../../app/models/secondary-purpose.model.js')

// Thing under test
const ReturnRequirementPurposeModel = require('../../app/models/return-requirement-purpose.model.js')

describe('Return Requirement Purpose model', () => {
  let testPrimaryPurpose
  let testPurpose
  let testRecord
  let testReturnRequirement
  let testSecondaryPurpose

  beforeAll(async () => {
    testPrimaryPurpose = PrimaryPurposeHelper.select()
    testPurpose = PurposeHelper.select()
    testReturnRequirement = await ReturnRequirementHelper.add()
    testSecondaryPurpose = SecondaryPurposeHelper.select()

    testRecord = await ReturnRequirementPurposeHelper.add({
      primaryPurposeId: testPrimaryPurpose.id,
      purposeId: testPurpose.id,
      returnRequirementId: testReturnRequirement.id,
      secondaryPurposeId: testSecondaryPurpose.id
    })
  })

  afterAll(async () => {
    await testReturnRequirement.$query().delete()

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ReturnRequirementPurposeModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(ReturnRequirementPurposeModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to primary purpose', () => {
      it('can successfully run a related query', async () => {
        const query = await ReturnRequirementPurposeModel.query().innerJoinRelated('primaryPurpose')

        expect(query).toBeDefined()
      })

      it('can eager load the primary purpose', async () => {
        const result = await ReturnRequirementPurposeModel.query()
          .findById(testRecord.id)
          .withGraphFetched('primaryPurpose')

        expect(result).toBeInstanceOf(ReturnRequirementPurposeModel)
        expect(result.id).toMatchObject(testRecord.id)

        expect(result.primaryPurpose).toBeInstanceOf(PrimaryPurposeModel)
        expect(result.primaryPurpose).toMatchObject(testPrimaryPurpose)
      })
    })

    describe('when linking to purpose', () => {
      it('can successfully run a related query', async () => {
        const query = await ReturnRequirementPurposeModel.query().innerJoinRelated('purpose')

        expect(query).toBeDefined()
      })

      it('can eager load the purpose', async () => {
        const result = await ReturnRequirementPurposeModel.query().findById(testRecord.id).withGraphFetched('purpose')

        expect(result).toBeInstanceOf(ReturnRequirementPurposeModel)
        expect(result.id).toMatchObject(testRecord.id)

        expect(result.purpose).toBeInstanceOf(PurposeModel)
        expect(result.purpose).toMatchObject(testPurpose)
      })
    })

    describe('when linking to return requirement', () => {
      it('can successfully run a related query', async () => {
        const query = await ReturnRequirementPurposeModel.query().innerJoinRelated('returnRequirement')

        expect(query).toBeDefined()
      })

      it('can eager load the charge reference', async () => {
        const result = await ReturnRequirementPurposeModel.query()
          .findById(testRecord.id)
          .withGraphFetched('returnRequirement')

        expect(result).toBeInstanceOf(ReturnRequirementPurposeModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.returnRequirement).toBeInstanceOf(ReturnRequirementModel)
        expect(result.returnRequirement).toEqual(testReturnRequirement)
      })
    })
  })

  describe('when linking to secondary purpose', () => {
    it('can successfully run a related query', async () => {
      const query = await ReturnRequirementPurposeModel.query().innerJoinRelated('secondaryPurpose')

      expect(query).toBeDefined()
    })

    it('can eager load the secondary purpose', async () => {
      const result = await ReturnRequirementPurposeModel.query()
        .findById(testRecord.id)
        .withGraphFetched('secondaryPurpose')

      expect(result).toBeInstanceOf(ReturnRequirementPurposeModel)
      expect(result.id).toEqual(testRecord.id)

      expect(result.secondaryPurpose).toBeInstanceOf(SecondaryPurposeModel)
      expect(result.secondaryPurpose.id).toEqual(testSecondaryPurpose.id)
    })
  })
})
