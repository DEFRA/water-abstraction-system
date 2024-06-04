'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../support/database.js')
const ReturnRequirementHelper = require('../support/helpers/return-requirement.helper.js')
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
    describe('when linking to return version', () => {
      let testReturnVersion

      beforeEach(async () => {
        testReturnVersion = await ReturnVersionHelper.add()
        testRecord = await ReturnRequirementHelper.add({
          returnVersionId: testReturnVersion.id
        })
      })

      it('can successfully run a related query', async () => {
        const query = await ReturnRequirementModel.query()
          .innerJoinRelated('returnVersions')

        expect(query).to.exist()
      })

      it('can eager load the return version', async () => {
        const result = await ReturnRequirementModel.query()
          .findById(testRecord.id)
          .withGraphFetched('returnVersions')

        expect(result).to.be.instanceOf(ReturnRequirementModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.returnVersions).to.be.an.instanceOf(ReturnVersionModel)
        expect(result.returnVersions).to.equal(testReturnVersion)
      })
    })
  })
})
