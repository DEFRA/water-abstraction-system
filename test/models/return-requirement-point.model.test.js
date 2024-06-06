'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../support/database.js')
const ReturnRequirementHelper = require('../support/helpers/return-requirement.helper.js')
const ReturnRequirementModel = require('../../app/models/return-requirement.model.js')
const ReturnRequirementPointHelper = require('../support/helpers/return-requirement-point.helper.js')

// Thing under test
const ReturnRequirementPointModel = require('../../app/models/return-requirement-point.model.js')

describe('Return Requirement Point model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseSupport.clean()

    testRecord = await ReturnRequirementPointHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ReturnRequirementPointModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ReturnRequirementPointModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to return requirement', () => {
      let testReturnRequirement

      beforeEach(async () => {
        testReturnRequirement = await ReturnRequirementHelper.add()

        const { id: returnRequirementId } = testReturnRequirement
        testRecord = await ReturnRequirementPointHelper.add({ returnRequirementId })
      })

      it('can successfully run a related query', async () => {
        const query = await ReturnRequirementPointModel.query()
          .innerJoinRelated('returnRequirement')

        expect(query).to.exist()
      })

      it('can eager load the charge reference', async () => {
        const result = await ReturnRequirementPointModel.query()
          .findById(testRecord.id)
          .withGraphFetched('returnRequirement')

        expect(result).to.be.instanceOf(ReturnRequirementPointModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.returnRequirement).to.be.an.instanceOf(ReturnRequirementModel)
        expect(result.returnRequirement).to.equal(testReturnRequirement)
      })
    })
  })
})
