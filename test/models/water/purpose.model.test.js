'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ChargeElementHelper = require('../../support/helpers/water/charge-element.helper.js')
const ChargeElementModel = require('../../../app/models/water/charge-element.model.js')
const ChargeReferenceHelper = require('../../support/helpers/water/charge-reference.helper.js')
const ChargeReferenceModel = require('../../../app/models/water/charge-reference.model.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const PurposeHelper = require('../../support/helpers/water/purpose.helper.js')

// Thing under test
const PurposeModel = require('../../../app/models/water/purpose.model.js')

describe('Purpose model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()

    testRecord = await PurposeHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await PurposeModel.query().findById(testRecord.purposeUseId)

      expect(result).to.be.an.instanceOf(PurposeModel)
      expect(result.purposeUseId).to.equal(testRecord.purposeUseId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to charge element', () => {
      let testChargeElement

      beforeEach(async () => {
        const { purposeUseId } = testRecord

        testChargeElement = await ChargeElementHelper.add({ purposeUseId })
      })

      it('can successfully run a related query', async () => {
        const query = await PurposeModel.query()
          .innerJoinRelated('chargeElement')

        expect(query).to.exist()
      })

      it('can eager load the charge element', async () => {
        const result = await PurposeModel.query()
          .findById(testRecord.purposeUseId)
          .withGraphFetched('chargeElement')

        expect(result).to.be.instanceOf(PurposeModel)
        expect(result.purposeUseId).to.equal(testRecord.purposeUseId)

        expect(result.chargeElement).to.be.an.instanceOf(ChargeElementModel)
        expect(result.chargeElement).to.equal(testChargeElement)
      })
    })

    describe('when linking to charge references', () => {
      let testChargeReferences

      beforeEach(async () => {
        const { purposeUseId } = testRecord

        testChargeReferences = []
        for (let i = 0; i < 2; i++) {
          const chargeReference = await ChargeReferenceHelper.add({ purposeUseId })
          testChargeReferences.push(chargeReference)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await PurposeModel.query()
          .innerJoinRelated('chargeReferences')

        expect(query).to.exist()
      })

      it('can eager load the charge references', async () => {
        const result = await PurposeModel.query()
          .findById(testRecord.purposeUseId)
          .withGraphFetched('chargeReferences')

        expect(result).to.be.instanceOf(PurposeModel)
        expect(result.purposeUseId).to.equal(testRecord.purposeUseId)

        expect(result.chargeReferences).to.be.an.array()
        expect(result.chargeReferences[0]).to.be.an.instanceOf(ChargeReferenceModel)
        expect(result.chargeReferences).to.include(testChargeReferences[0])
        expect(result.chargeReferences).to.include(testChargeReferences[1])
      })
    })
  })
})
