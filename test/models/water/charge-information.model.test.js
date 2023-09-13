'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ChangeReasonHelper = require('../../support/helpers/water/change-reason.helper.js')
const ChangeReasonModel = require('../../../app/models/water/change-reason.model.js')
const ChargeInformationHelper = require('../../support/helpers/water/charge-information.helper.js')
const ChargeReferenceHelper = require('../../support/helpers/water/charge-reference.helper.js')
const ChargeReferenceModel = require('../../../app/models/water/charge-reference.model.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const LicenceHelper = require('../../support/helpers/water/licence.helper.js')
const LicenceModel = require('../../../app/models/water/licence.model.js')

// Thing under test
const ChargeInformationModel = require('../../../app/models/water/charge-information.model.js')

describe('Charge Information model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()

    testRecord = await ChargeInformationHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ChargeInformationModel.query().findById(testRecord.chargeVersionId)

      expect(result).to.be.an.instanceOf(ChargeInformationModel)
      expect(result.chargeVersionId).to.equal(testRecord.chargeVersionId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence', () => {
      let testLicence

      beforeEach(async () => {
        testLicence = await LicenceHelper.add()

        const { licenceId } = testLicence
        testRecord = await ChargeInformationHelper.add({ licenceId })
      })

      it('can successfully run a related query', async () => {
        const query = await ChargeInformationModel.query()
          .innerJoinRelated('licence')

        expect(query).to.exist()
      })

      it('can eager load the licence', async () => {
        const result = await ChargeInformationModel.query()
          .findById(testRecord.chargeVersionId)
          .withGraphFetched('licence')

        expect(result).to.be.instanceOf(ChargeInformationModel)
        expect(result.chargeVersionId).to.equal(testRecord.chargeVersionId)

        expect(result.licence).to.be.an.instanceOf(LicenceModel)
        expect(result.licence).to.equal(testLicence)
      })
    })

    describe('when linking to change reason', () => {
      let testChangeReason

      beforeEach(async () => {
        testChangeReason = await ChangeReasonHelper.add()

        const { changeReasonId } = testChangeReason
        testRecord = await ChargeInformationHelper.add({ changeReasonId })
      })

      it('can successfully run a related query', async () => {
        const query = await ChargeInformationModel.query()
          .innerJoinRelated('changeReason')

        expect(query).to.exist()
      })

      it('can eager load the change reason', async () => {
        const result = await ChargeInformationModel.query()
          .findById(testRecord.chargeVersionId)
          .withGraphFetched('changeReason')

        expect(result).to.be.instanceOf(ChargeInformationModel)
        expect(result.chargeVersionId).to.equal(testRecord.chargeVersionId)

        expect(result.changeReason).to.be.an.instanceOf(ChangeReasonModel)
        expect(result.changeReason).to.equal(testChangeReason)
      })
    })

    describe('when linking to charge references', () => {
      let testChargeReferences

      beforeEach(async () => {
        const { chargeVersionId } = testRecord

        testChargeReferences = []
        for (let i = 0; i < 2; i++) {
          const chargeReference = await ChargeReferenceHelper.add({ description: `CE ${i}`, chargeVersionId })
          testChargeReferences.push(chargeReference)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await ChargeInformationModel.query()
          .innerJoinRelated('chargeReferences')

        expect(query).to.exist()
      })

      it('can eager load the charge references', async () => {
        const result = await ChargeInformationModel.query()
          .findById(testRecord.chargeVersionId)
          .withGraphFetched('chargeReferences')

        expect(result).to.be.instanceOf(ChargeInformationModel)
        expect(result.chargeVersionId).to.equal(testRecord.chargeVersionId)

        expect(result.chargeReferences).to.be.an.array()
        expect(result.chargeReferences[0]).to.be.an.instanceOf(ChargeReferenceModel)
        expect(result.chargeReferences).to.include(testChargeReferences[0])
        expect(result.chargeReferences).to.include(testChargeReferences[1])
      })
    })
  })
})
