'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ChargeElementHelper = require('../../support/helpers/water/charge-element.helper.js')
const ChargeReferenceHelper = require('../../support/helpers/water/charge-reference.helper.js')
const ChargeReferenceModel = require('../../../app/models/water/charge-reference.model.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const PurposeModel = require('../../../app/models/water/purpose.model.js')
const PurposeHelper = require('../../support/helpers/water/purpose.helper.js')

// Thing under test
const ChargeElementModel = require('../../../app/models/water/charge-element.model.js')

describe('Charge Element model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()

    testRecord = await ChargeElementHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ChargeElementModel.query().findById(testRecord.chargePurposeId)

      expect(result).to.be.an.instanceOf(ChargeElementModel)
      expect(result.chargePurposeId).to.equal(testRecord.chargePurposeId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to charge reference', () => {
      let testChargeReference

      beforeEach(async () => {
        testChargeReference = await ChargeReferenceHelper.add()

        const { chargeElementId } = testChargeReference
        testRecord = await ChargeElementHelper.add({ chargeElementId })
      })

      it('can successfully run a related query', async () => {
        const query = await ChargeElementModel.query()
          .innerJoinRelated('chargeReference')

        expect(query).to.exist()
      })

      it('can eager load the charge reference', async () => {
        const result = await ChargeElementModel.query()
          .findById(testRecord.chargePurposeId)
          .withGraphFetched('chargeReference')

        expect(result).to.be.instanceOf(ChargeElementModel)
        expect(result.chargePurposeId).to.equal(testRecord.chargePurposeId)

        expect(result.chargeReference).to.be.an.instanceOf(ChargeReferenceModel)
        expect(result.chargeReference).to.equal(testChargeReference)
      })
    })

    describe('when linking to purpose', () => {
      let testPurpose

      beforeEach(async () => {
        testPurpose = await PurposeHelper.add()

        const { purposeUseId } = testPurpose
        testRecord = await ChargeElementHelper.add({ purposeUseId })
      })

      it('can successfully run a related query', async () => {
        const query = await ChargeElementModel.query()
          .innerJoinRelated('purpose')

        expect(query).to.exist()
      })

      it('can eager load the purposes use', async () => {
        const result = await ChargeElementModel.query()
          .findById(testRecord.chargePurposeId)
          .withGraphFetched('purpose')

        expect(result).to.be.instanceOf(ChargeElementModel)
        expect(result.chargePurposeId).to.equal(testRecord.chargePurposeId)

        expect(result.purpose).to.be.an.instanceOf(PurposeModel)
        expect(result.purpose).to.equal(testPurpose)
      })
    })
  })
})
