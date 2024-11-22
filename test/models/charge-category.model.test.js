'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ChargeCategoryHelper = require('../support/helpers/charge-category.helper.js')
const ChargeReferenceHelper = require('../support/helpers/charge-reference.helper.js')
const ChargeReferenceModel = require('../../app/models/charge-reference.model.js')

// Thing under test
const ChargeCategoryModel = require('../../app/models/charge-category.model.js')

describe('Charge Category model', () => {
  let testRecord

  beforeEach(() => {
    testRecord = ChargeCategoryHelper.select()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ChargeCategoryModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ChargeCategoryModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to charge references', () => {
      let testChargeReferences

      beforeEach(async () => {
        const { id } = testRecord

        testChargeReferences = []
        for (let i = 0; i < 2; i++) {
          const chargeReference = await ChargeReferenceHelper.add({ description: `CE ${i}`, chargeCategoryId: id })

          testChargeReferences.push(chargeReference)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await ChargeCategoryModel.query().innerJoinRelated('chargeReferences')

        expect(query).to.exist()
      })

      it('can eager load the charge references', async () => {
        const result = await ChargeCategoryModel.query().findById(testRecord.id).withGraphFetched('chargeReferences')

        expect(result).to.be.instanceOf(ChargeCategoryModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.chargeReferences).to.be.an.array()
        expect(result.chargeReferences[0]).to.be.an.instanceOf(ChargeReferenceModel)
        expect(result.chargeReferences).to.include(testChargeReferences[0])
        expect(result.chargeReferences).to.include(testChargeReferences[1])
      })
    })
  })
})
