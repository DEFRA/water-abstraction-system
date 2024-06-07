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
const ReturnRequirementHelper = require('../support/helpers/return-requirement.helper.js')
const ReturnRequirementModel = require('../../app/models/return-requirement.model.js')
const ReturnVersionHelper = require('../support/helpers/return-version.helper.js')

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

    describe('when linking to return requirements', () => {
      let testReturnRequirements

      beforeEach(async () => {
        testRecord = await ReturnVersionHelper.add()

        testReturnRequirements = []
        for (let i = 0; i < 2; i++) {
          const returnRequirement = await ReturnRequirementHelper.add(
            { siteDescription: `TEST RTN REQ ${i}`, returnVersionId: testRecord.id }
          )
          testReturnRequirements.push(returnRequirement)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await ReturnVersionModel.query()
          .innerJoinRelated('returnRequirements')

        expect(query).to.exist()
      })

      it('can eager load the return requirements', async () => {
        const result = await ReturnVersionModel.query()
          .findById(testRecord.id)
          .withGraphFetched('returnRequirements')

        expect(result).to.be.instanceOf(ReturnVersionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.returnRequirements).to.be.an.array()
        expect(result.returnRequirements[0]).to.be.an.instanceOf(ReturnRequirementModel)
        expect(result.returnRequirements).to.include(testReturnRequirements[0])
        expect(result.returnRequirements).to.include(testReturnRequirements[1])
      })
    })
  })
})
