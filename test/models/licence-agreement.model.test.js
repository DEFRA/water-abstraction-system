'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const FinancialAgreementHelper = require('../support/helpers/financial-agreement.helper.js')
const FinancialAgreementModel = require('../../app/models/financial-agreement.model.js')
const LicenceAgreementHelper = require('../support/helpers/licence-agreement.helper.js')
const LicenceHelper = require('../support/helpers/licence.helper.js')
const LicenceModel = require('../../app/models/licence.model.js')

// Thing under test
const LicenceAgreementModel = require('../../app/models/licence-agreement.model.js')

const FINANCIAL_AGREEMENT_MCHG_INDEX = 6

describe('Licence Agreement model', () => {
  let testRecord

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await LicenceAgreementHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await LicenceAgreementModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(LicenceAgreementModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to financial agreement', () => {
      let testFinancialAgreement

      before(async () => {
        testFinancialAgreement = FinancialAgreementHelper.select(FINANCIAL_AGREEMENT_MCHG_INDEX)

        const { id: financialAgreementId } = testFinancialAgreement

        testRecord = await LicenceAgreementHelper.add({ financialAgreementId })
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceAgreementModel.query().innerJoinRelated('financialAgreement')

        expect(query).to.exist()
      })

      it('can eager load the financial agreement', async () => {
        const result = await LicenceAgreementModel.query()
          .findById(testRecord.id)
          .withGraphFetched('financialAgreement')

        expect(result).to.be.instanceOf(LicenceAgreementModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.financialAgreement).to.be.an.instanceOf(FinancialAgreementModel)
        expect(result.financialAgreement).to.equal(testFinancialAgreement, { skip: ['createdAt', 'updatedAt'] })
      })
    })

    describe('when linking to licence', () => {
      let testLicence

      beforeEach(async () => {
        testLicence = await LicenceHelper.add()

        const { licenceRef } = testLicence

        testRecord = await LicenceAgreementHelper.add({ licenceRef })
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceAgreementModel.query().innerJoinRelated('licence')

        expect(query).to.exist()
      })

      it('can eager load the licence', async () => {
        const result = await LicenceAgreementModel.query().findById(testRecord.id).withGraphFetched('licence')

        expect(result).to.be.instanceOf(LicenceAgreementModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licence).to.be.an.instanceOf(LicenceModel)
        expect(result.licence.id).to.equal(testLicence.id)
      })
    })
  })
})
