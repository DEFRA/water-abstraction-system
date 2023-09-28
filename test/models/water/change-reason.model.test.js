'use strict'

// Test helpers
const ChangeReasonHelper = require('../../support/helpers/water/change-reason.helper.js')
const ChargeVersionHelper = require('../../support/helpers/water/charge-version.helper.js')
const ChargeVersionModel = require('../../../app/models/water/charge-version.model.js')

// Thing under test
const ChangeReasonModel = require('../../../app/models/water/change-reason.model.js')

describe('Change Reason model', () => {
  let testChargeVersions
  let testRecord

  beforeAll(async () => {
    testChargeVersions = []
    testRecord = await ChangeReasonHelper.add()

    const { changeReasonId } = testRecord

    for (let i = 0; i < 2; i++) {
      const chargeVersion = await ChargeVersionHelper.add({ changeReasonId })
      testChargeVersions.push(chargeVersion)
    }
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ChangeReasonModel.query().findById(testRecord.changeReasonId)

      expect(result).toBeInstanceOf(ChangeReasonModel)
      expect(result.changeReasonId).toBe(testRecord.changeReasonId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to charge versions', () => {
      it('can successfully run a related query', async () => {
        const query = await ChangeReasonModel.query()
          .innerJoinRelated('chargeVersions')

        expect(query).toBeTruthy()
      })

      it('can eager load the charge versions', async () => {
        const result = await ChangeReasonModel.query()
          .findById(testRecord.changeReasonId)
          .withGraphFetched('chargeVersions')

        expect(result).toBeInstanceOf(ChangeReasonModel)
        expect(result.changeReasonId).toBe(testRecord.changeReasonId)

        expect(result.chargeVersions).toBeInstanceOf(Array)
        expect(result.chargeVersions[0]).toBeInstanceOf(ChargeVersionModel)
        expect(result.chargeVersions).toContainEqual(testChargeVersions[0])
        expect(result.chargeVersions).toContainEqual(testChargeVersions[1])
      })
    })
  })
})
