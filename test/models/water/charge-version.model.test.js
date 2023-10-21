'use strict'

// Test helpers
const ChangeReasonHelper = require('../../support/helpers/water/change-reason.helper.js')
const ChangeReasonModel = require('../../../app/models/water/change-reason.model.js')
const ChargeReferenceHelper = require('../../support/helpers/water/charge-reference.helper.js')
const ChargeReferenceModel = require('../../../app/models/water/charge-reference.model.js')
const ChargeVersionHelper = require('../../support/helpers/water/charge-version.helper.js')
const LicenceHelper = require('../../support/helpers/water/licence.helper.js')
const LicenceModel = require('../../../app/models/water/licence.model.js')

// Thing under test
const ChargeVersionModel = require('../../../app/models/water/charge-version.model.js')

describe('Charge Version model', () => {
  let testChangeReason
  let testChargeReferences
  let testLicence
  let testRecord

  beforeEach(async () => {
    testChangeReason = await ChangeReasonHelper.add()
    testLicence = await LicenceHelper.add()
    testChargeReferences = []

    const { licenceId } = testLicence
    const { changeReasonId } = testChangeReason
    testRecord = await ChargeVersionHelper.add({ changeReasonId, licenceId })

    const { chargeVersionId } = testRecord

    for (let i = 0; i < 2; i++) {
      const chargeReference = await ChargeReferenceHelper.add({ description: `CE ${i}`, chargeVersionId })
      testChargeReferences.push(chargeReference)
    }
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ChargeVersionModel.query().findById(testRecord.chargeVersionId)

      expect(result).toBeInstanceOf(ChargeVersionModel)
      expect(result.chargeVersionId).toBe(testRecord.chargeVersionId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeVersionModel.query()
          .innerJoinRelated('licence')

        expect(query).toBeTruthy()
      })

      it('can eager load the licence', async () => {
        const result = await ChargeVersionModel.query()
          .findById(testRecord.chargeVersionId)
          .withGraphFetched('licence')

        expect(result).toBeInstanceOf(ChargeVersionModel)
        expect(result.chargeVersionId).toBe(testRecord.chargeVersionId)

        expect(result.licence).toBeInstanceOf(LicenceModel)
        expect(result.licence).toEqual(testLicence)
      })
    })

    describe('when linking to change reason', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeVersionModel.query()
          .innerJoinRelated('changeReason')

        expect(query).toBeTruthy()
      })

      it('can eager load the change reason', async () => {
        const result = await ChargeVersionModel.query()
          .findById(testRecord.chargeVersionId)
          .withGraphFetched('changeReason')

        expect(result).toBeInstanceOf(ChargeVersionModel)
        expect(result.chargeVersionId).toBe(testRecord.chargeVersionId)

        expect(result.changeReason).toBeInstanceOf(ChangeReasonModel)
        expect(result.changeReason).toEqual(testChangeReason)
      })
    })

    describe('when linking to charge references', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeVersionModel.query()
          .innerJoinRelated('chargeReferences')

        expect(query).toBeTruthy()
      })

      it('can eager load the charge references', async () => {
        const result = await ChargeVersionModel.query()
          .findById(testRecord.chargeVersionId)
          .withGraphFetched('chargeReferences')

        expect(result).toBeInstanceOf(ChargeVersionModel)
        expect(result.chargeVersionId).toBe(testRecord.chargeVersionId)

        expect(result.chargeReferences).toBeInstanceOf(Array)
        expect(result.chargeReferences[0]).toBeInstanceOf(ChargeReferenceModel)
        expect(result.chargeReferences).toContainEqual(testChargeReferences[0])
        expect(result.chargeReferences).toContainEqual(testChargeReferences[1])
      })
    })
  })
})
