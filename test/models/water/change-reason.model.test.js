'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ChangeReasonHelper = require('../../support/helpers/water/change-reason.helper.js')
const ChargeInformationHelper = require('../../support/helpers/water/charge-information.helper.js')
const ChargeInformationModel = require('../../../app/models/water/charge-information.model.js')
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
    describe('when linking to charge informations', () => {
      let testChargeInformations

      beforeEach(async () => {
        const { changeReasonId } = testRecord

        testChargeInformations = []
        for (let i = 0; i < 2; i++) {
          const chargeInformation = await ChargeInformationHelper.add({ changeReasonId })
          testChargeInformations.push(chargeInformation)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await ChangeReasonModel.query()
          .innerJoinRelated('chargeInformations')

        expect(query).to.exist()
      })

      it('can eager load the charge versions', async () => {
        const result = await ChangeReasonModel.query()
          .findById(testRecord.changeReasonId)
          .withGraphFetched('chargeInformations')

        expect(result).to.be.instanceOf(ChangeReasonModel)
        expect(result.changeReasonId).to.equal(testRecord.changeReasonId)

        expect(result.chargeInformations).to.be.an.array()
        expect(result.chargeInformations[0]).to.be.an.instanceOf(ChargeInformationModel)
        expect(result.chargeInformations).to.include(testChargeInformations[0])
        expect(result.chargeInformations).to.include(testChargeInformations[1])
      })
    })
  })
})
