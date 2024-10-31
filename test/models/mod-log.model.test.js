'use strict'

// Test framework dependencies

const Code = require('@hapi/code')

const { describe, it, before } = require('node:test')
const { expect } = Code

// Test helpers
const ChargeVersionHelper = require('../support/helpers/charge-version.helper.js')
const ChargeVersionModel = require('../../app/models/charge-version.model.js')
const LicenceHelper = require('../support/helpers/licence.helper.js')
const LicenceModel = require('../../app/models/licence.model.js')
const LicenceVersionHelper = require('../support/helpers/licence-version.helper.js')
const LicenceVersionModel = require('../../app/models/licence-version.model.js')
const ReturnVersionHelper = require('../support/helpers/return-version.helper.js')
const ReturnVersionModel = require('../../app/models/return-version.model.js')
const ModLogHelper = require('../support/helpers/mod-log.helper.js')

// Thing under test
const ModLogModel = require('../../app/models/mod-log.model.js')

describe('Mod Log model', () => {
  let testChargeVersion
  let testLicence
  let testLicenceVersion
  let testRecord
  let testReturnVersion

  before(async () => {
    testLicence = await LicenceHelper.add()
    testChargeVersion = await ChargeVersionHelper.add({
      licenceId: testLicence.id, licenceRef: testLicence.licenceRef
    })
    testLicenceVersion = await LicenceVersionHelper.add({ licenceId: testLicence.id })
    testReturnVersion = await ReturnVersionHelper.add({ licenceId: testLicence.id })

    // NOTE: A mod log would be linked to a licence and _one_ of the version types. It would not be linked to all 3.
    // But for the purposes of testing we have have correctly set up the relationships between them it is perfectly
    // fine to reference all version types in the one mod log record.
    testRecord = await ModLogHelper.add({
      chargeVersionId: testChargeVersion.id,
      licenceId: testLicence.id,
      licenceRef: testLicence.licenceRef,
      licenceVersionId: testLicenceVersion.id,
      returnVersionId: testReturnVersion.id
    })
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ModLogModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ModLogModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to charge version', () => {
      it('can successfully run a related query', async () => {
        const query = await ModLogModel.query()
          .innerJoinRelated('chargeVersion')

        expect(query).to.exist()
      })

      it('can eager load the charge version', async () => {
        const result = await ModLogModel.query()
          .findById(testRecord.id)
          .withGraphFetched('chargeVersion')

        expect(result).to.be.instanceOf(ModLogModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.chargeVersion).to.be.an.instanceOf(ChargeVersionModel)
        expect(result.chargeVersion).to.equal(testChargeVersion)
      })
    })

    describe('when linking to licence', () => {
      it('can successfully run a related query', async () => {
        const query = await ModLogModel.query()
          .innerJoinRelated('licence')

        expect(query).to.exist()
      })

      it('can eager load the licence', async () => {
        const result = await ModLogModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licence')

        expect(result).to.be.instanceOf(ModLogModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licence).to.be.an.instanceOf(LicenceModel)
        expect(result.licence).to.equal(testLicence)
      })
    })

    describe('when linking to licence version', () => {
      it('can successfully run a related query', async () => {
        const query = await ModLogModel.query()
          .innerJoinRelated('licenceVersion')

        expect(query).to.exist()
      })

      it('can eager load the licence version', async () => {
        const result = await ModLogModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceVersion')

        expect(result).to.be.instanceOf(ModLogModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceVersion).to.be.an.instanceOf(LicenceVersionModel)
        expect(result.licenceVersion).to.equal(testLicenceVersion)
      })
    })

    describe('when linking to return version', () => {
      it('can successfully run a related query', async () => {
        const query = await ModLogModel.query()
          .innerJoinRelated('returnVersion')

        expect(query).to.exist()
      })

      it('can eager load the return version', async () => {
        const result = await ModLogModel.query()
          .findById(testRecord.id)
          .withGraphFetched('returnVersion')

        expect(result).to.be.instanceOf(ModLogModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.returnVersion).to.be.an.instanceOf(ReturnVersionModel)
        expect(result.returnVersion).to.equal(testReturnVersion)
      })
    })
  })
})
