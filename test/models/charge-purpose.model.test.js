'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ChargeElementHelper = require('../support/helpers/charge-element.helper.js')
const ChargeElementModel = require('../../app/models/charge-element.model.js')
const ChargePurposeHelper = require('../support/helpers/charge-purpose.helper.js')
const DatabaseHelper = require('../support/helpers/database.helper.js')

// Thing under test
const ChargePurposeModel = require('../../app/models/charge-purpose.model.js')

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
    describe('when linking to charge element', () => {
      let testChargeElement

      beforeEach(async () => {
        testChargeElement = await ChargeElementHelper.add()

        const { chargeElementId } = testChargeElement
        testRecord = await ChargePurposeHelper.add({ chargeElementId })
      })

      it('can successfully run a related query', async () => {
        const query = await ChargePurposeModel.query()
          .innerJoinRelated('chargeElement')

        expect(query).to.exist()
      })

      it('can eager load the charge element', async () => {
        const result = await ChargePurposeModel.query()
          .findById(testRecord.chargePurposeId)
          .withGraphFetched('chargeElement')

        expect(result).to.be.instanceOf(ChargePurposeModel)
        expect(result.chargePurposeId).to.equal(testRecord.chargePurposeId)

        expect(result.chargeElement).to.be.an.instanceOf(ChargeElementModel)
        expect(result.chargeElement).to.equal(testChargeElement)
      })
    })
  })
})
