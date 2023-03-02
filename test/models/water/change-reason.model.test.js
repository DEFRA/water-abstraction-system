'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ChangeReasonHelper = require('../../support/helpers/water/change-reason.helper.js')
const ChargeVersionHelper = require('../../support/helpers/water/charge-version.helper.js')
const ChargeVersionModel = require('../../../app/models/water/charge-version.model.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')

// Thing under test
const ChangeReasonModel = require('../../../app/models/water/change-reason.model.js')

describe('Change Reason model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()

    testRecord = await ChangeReasonHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ChangeReasonModel.query().findById(testRecord.changeReasonId)

      expect(result).to.be.an.instanceOf(ChangeReasonModel)
      expect(result.changeReasonId).to.equal(testRecord.changeReasonId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to charge versions', () => {
      let testChargeVersions

      beforeEach(async () => {
        const { changeReasonId } = testRecord

        testChargeVersions = []
        for (let i = 0; i < 2; i++) {
          const chargeVersion = await ChargeVersionHelper.add({ changeReasonId })
          testChargeVersions.push(chargeVersion)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await ChangeReasonModel.query()
          .innerJoinRelated('chargeVersions')

        expect(query).to.exist()
      })

      it('can eager load the charge versions', async () => {
        const result = await ChangeReasonModel.query()
          .findById(testRecord.changeReasonId)
          .withGraphFetched('chargeVersions')

        expect(result).to.be.instanceOf(ChangeReasonModel)
        expect(result.changeReasonId).to.equal(testRecord.changeReasonId)

        expect(result.chargeVersions).to.be.an.array()
        expect(result.chargeVersions[0]).to.be.an.instanceOf(ChargeVersionModel)
        expect(result.chargeVersions).to.include(testChargeVersions[0])
        expect(result.chargeVersions).to.include(testChargeVersions[1])
      })
    })
  })
})
