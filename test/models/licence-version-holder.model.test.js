'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceVersionHolderHelper = require('../support/helpers/licence-version-holder.helper.js')
const LicenceVersionHelper = require('../support/helpers/licence-version.helper.js')
const LicenceVersionModel = require('../../app/models/licence-version.model.js')

// Thing under test
const LicenceVersionHolderModel = require('../../app/models/licence-version-holder.model.js')

describe('Licence Version Holder model', () => {
  let testRecord
  let testLicenceVersion

  before(async () => {
    testLicenceVersion = await LicenceVersionHelper.add()

    testRecord = await LicenceVersionHolderHelper.add({ licenceVersionId: testLicenceVersion.id })
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LicenceVersionHolderModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(LicenceVersionHolderModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence version', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceVersionHolderModel.query().innerJoinRelated('licenceVersion')

        expect(query).to.exist()
      })

      it('can eager load the licence version', async () => {
        const result = await LicenceVersionHolderModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceVersion')

        expect(result).to.be.instanceOf(LicenceVersionHolderModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceVersion).to.be.an.instanceOf(LicenceVersionModel)
        expect(result.licenceVersion).to.equal(testLicenceVersion)
      })
    })
  })
})
