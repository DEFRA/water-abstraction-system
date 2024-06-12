'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../support/database.js')
const LicenceVersionModel = require('../../app/models/licence-version.model.js')
const LicenceVersionHelper = require('../support/helpers/licence-version.helper.js')
const LicenceVersionPurposeHelper = require('../support/helpers/licence-version-purpose.helper.js')
const PrimaryPurposeHelper = require('../support/helpers/primary-purpose.helper.js')
const PrimaryPurposeModel = require('../../app/models/primary-purpose.model.js')
const PurposeHelper = require('../support/helpers/purpose.helper.js')
const PurposeModel = require('../../app/models/purpose.model.js')
const SecondaryPurposeHelper = require('../support/helpers/secondary-purpose.helper.js')
const SecondaryPurposeModel = require('../../app/models/secondary-purpose.model.js')

// Thing under test
const LicenceVersionPurposeModel = require('../../app/models/licence-version-purpose.model.js')

describe('Licence Version Purposes model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await LicenceVersionPurposeHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await LicenceVersionPurposeModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(LicenceVersionPurposeModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence version', () => {
      let testLicenceVersion

      beforeEach(async () => {
        testLicenceVersion = await LicenceVersionHelper.add()

        const { id } = testLicenceVersion
        testRecord = await LicenceVersionPurposeHelper.add({ licenceVersionId: id })
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceVersionPurposeModel.query()
          .innerJoinRelated('licenceVersion')

        expect(query).to.exist()
      })

      it('can eager load the licence version', async () => {
        const result = await LicenceVersionPurposeModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceVersion')

        expect(result).to.be.instanceOf(LicenceVersionPurposeModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceVersion).to.be.an.instanceOf(LicenceVersionModel)
        expect(result.licenceVersion.id).to.equal(testLicenceVersion.id)
      })
    })

    describe('when linking to primary purpose', () => {
      let testPrimaryPurpose

      beforeEach(async () => {
        testPrimaryPurpose = await PrimaryPurposeHelper.add()

        const { id: primaryPurposeId } = testPrimaryPurpose
        testRecord = await LicenceVersionPurposeHelper.add({ primaryPurposeId })
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceVersionPurposeModel.query()
          .innerJoinRelated('primaryPurpose')

        expect(query).to.exist()
      })

      it('can eager load the primary purpose', async () => {
        const result = await LicenceVersionPurposeModel.query()
          .findById(testRecord.id)
          .withGraphFetched('primaryPurpose')

        expect(result).to.be.instanceOf(LicenceVersionPurposeModel)
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
        testRecord = await LicenceVersionPurposeHelper.add({ purposeId })
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceVersionPurposeModel.query()
          .innerJoinRelated('purpose')

        expect(query).to.exist()
      })

      it('can eager load the purpose', async () => {
        const result = await LicenceVersionPurposeModel.query()
          .findById(testRecord.id)
          .withGraphFetched('purpose')

        expect(result).to.be.instanceOf(LicenceVersionPurposeModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.purpose).to.be.an.instanceOf(PurposeModel)
        expect(result.purpose.id).to.equal(testPurpose.id)
      })
    })

    describe('when linking to secondary purpose', () => {
      let testSecondaryPurpose

      beforeEach(async () => {
        testSecondaryPurpose = await SecondaryPurposeHelper.add()

        const { id: secondaryPurposeId } = testSecondaryPurpose
        testRecord = await LicenceVersionPurposeHelper.add({ secondaryPurposeId })
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceVersionPurposeModel.query()
          .innerJoinRelated('secondaryPurpose')

        expect(query).to.exist()
      })

      it('can eager load the secondary purpose', async () => {
        const result = await LicenceVersionPurposeModel.query()
          .findById(testRecord.id)
          .withGraphFetched('secondaryPurpose')

        expect(result).to.be.instanceOf(LicenceVersionPurposeModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.secondaryPurpose).to.be.an.instanceOf(SecondaryPurposeModel)
        expect(result.secondaryPurpose.id).to.equal(testSecondaryPurpose.id)
      })
    })
  })
})
