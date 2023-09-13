'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ChargePurposeHelper = require('../../support/helpers/water/charge-purpose.helper.js')
const ChargeReferenceHelper = require('../../support/helpers/water/charge-reference.helper.js')
const ChargeReferenceModel = require('../../../app/models/water/charge-reference.model.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const PurposesUseModel = require('../../../app/models/water/purposes-use.model.js')
const PurposesUseHelper = require('../../support/helpers/water/purposes-use.helper.js')

// Thing under test
const ChargePurposeModel = require('../../../app/models/water/charge-purpose.model.js')

describe('Charge Purpose model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()

    testRecord = await ChargePurposeHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ChargePurposeModel.query().findById(testRecord.chargePurposeId)

      expect(result).to.be.an.instanceOf(ChargePurposeModel)
      expect(result.chargePurposeId).to.equal(testRecord.chargePurposeId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to charge reference', () => {
      let testChargeReference

      beforeEach(async () => {
        testChargeReference = await ChargeReferenceHelper.add()

        const { chargeElementId } = testChargeReference
        testRecord = await ChargePurposeHelper.add({ chargeElementId })
      })

      it('can successfully run a related query', async () => {
        const query = await ChargePurposeModel.query()
          .innerJoinRelated('chargeReference')

        expect(query).to.exist()
      })

      it('can eager load the charge reference', async () => {
        const result = await ChargePurposeModel.query()
          .findById(testRecord.chargePurposeId)
          .withGraphFetched('chargeReference')

        expect(result).to.be.instanceOf(ChargePurposeModel)
        expect(result.chargePurposeId).to.equal(testRecord.chargePurposeId)

        expect(result.chargeReference).to.be.an.instanceOf(ChargeReferenceModel)
        expect(result.chargeReference).to.equal(testChargeReference)
      })
    })

    describe('when linking to purposes use', () => {
      let testPurposesUse

      beforeEach(async () => {
        testPurposesUse = await PurposesUseHelper.add()

        const { purposeUseId } = testPurposesUse
        testRecord = await ChargePurposeHelper.add({ purposeUseId })
      })

      it('can successfully run a related query', async () => {
        const query = await ChargePurposeModel.query()
          .innerJoinRelated('purposesUse')

        expect(query).to.exist()
      })

      it('can eager load the purposes use', async () => {
        const result = await ChargePurposeModel.query()
          .findById(testRecord.chargePurposeId)
          .withGraphFetched('purposesUse')

        expect(result).to.be.instanceOf(ChargePurposeModel)
        expect(result.chargePurposeId).to.equal(testRecord.chargePurposeId)

        expect(result.purposesUse).to.be.an.instanceOf(PurposesUseModel)
        expect(result.purposesUse).to.equal(testPurposesUse)
      })
    })
  })
})
