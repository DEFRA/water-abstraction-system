'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const LicenceVersionPurposeHelper = require('../support/helpers/licence-version-purpose.helper.js')
const LicenceVersionPurposeModel = require('../../app/models/licence-version-purpose.model.js')
const LicenceVersionPurposePointHelper = require('../support/helpers/licence-version-purpose-point.helper.js')

// Thing under test
const LicenceVersionPurposePointModel = require('../../app/models/licence-version-purpose-point.model.js')

describe('Licence Version Purpose Point model', () => {
  let testRecord

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await LicenceVersionPurposePointHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await LicenceVersionPurposePointModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(LicenceVersionPurposePointModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence version purpose', () => {
      let testLicenceVersionPurpose

      beforeEach(async () => {
        testLicenceVersionPurpose = await LicenceVersionPurposeHelper.add()

        const { id: licenceVersionPurposeId } = testLicenceVersionPurpose

        testRecord = await LicenceVersionPurposePointHelper.add({ licenceVersionPurposeId })
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceVersionPurposePointModel.query()
          .innerJoinRelated('licenceVersionPurpose')

        expect(query).to.exist()
      })

      it('can eager load the licence version purpose', async () => {
        const result = await LicenceVersionPurposePointModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceVersionPurpose')

        expect(result).to.be.instanceOf(LicenceVersionPurposePointModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceVersionPurpose).to.be.an.instanceOf(LicenceVersionPurposeModel)
        expect(result.licenceVersionPurpose).to.equal(testLicenceVersionPurpose)
      })
    })
  })
})
