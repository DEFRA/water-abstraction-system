'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const LicenceHelper = require('../support/helpers/licence.helper.js')
const LicenceModel = require('../../app/models/licence.model.js')
const LicenceVersionHelper = require('../support/helpers/licence-version.helper.js')
const LicenceVersionPurposesHelper = require('../support/helpers/licence-version-purpose.helper.js')
const PurposeHelper = require('../support/helpers/purpose.helper.js')
const PurposeModel = require('../../app/models/purpose.model.js')

// Thing under test
const LicenceVersionModel = require('../../app/models/licence-version.model.js')

describe('Licence Version model', () => {
  let testRecord

  beforeEach(async () => {
    testRecord = await LicenceVersionHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LicenceVersionModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(LicenceVersionModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence', () => {
      let testLicence

      beforeEach(async () => {
        testLicence = await LicenceHelper.add()

        const { id: licenceId } = testLicence

        testRecord = await LicenceVersionHelper.add({ licenceId })
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceVersionModel.query()
          .innerJoinRelated('licence')

        expect(query).to.exist()
      })

      it('can eager load the licence', async () => {
        const result = await LicenceVersionModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licence')

        expect(result).to.be.instanceOf(LicenceVersionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licence).to.be.an.instanceOf(LicenceModel)
        expect(result.licence).to.equal(testLicence)
      })
    })

    describe('when linking through licence version purposes to purposes', () => {
      let purpose

      beforeEach(async () => {
        testRecord = await LicenceVersionHelper.add()
        purpose = PurposeHelper.select()

        const { id } = testRecord

        await LicenceVersionPurposesHelper.add({
          licenceVersionId: id,
          purposeId: purpose.id
        })
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceVersionModel.query()
          .innerJoinRelated('purposes')

        expect(query).to.exist()
      })

      it('can eager load the purposes', async () => {
        const result = await LicenceVersionModel.query()
          .findById(testRecord.id)
          .withGraphFetched('purposes')

        expect(result).to.be.instanceOf(LicenceVersionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.purposes[0]).to.be.an.instanceOf(PurposeModel)
        expect(result.purposes).to.equal([purpose], { skip: ['createdAt', 'updatedAt'] })
      })
    })
  })
})
