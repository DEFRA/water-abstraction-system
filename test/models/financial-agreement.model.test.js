'use strict'

// Test framework dependencies

const Code = require('@hapi/code')

const { describe, it, before } = require('node:test')
const { expect } = Code

// Test helpers
const FinancialAgreementHelper = require('../support/helpers/financial-agreement.helper.js')
const LicenceAgreementHelper = require('../support/helpers/licence-agreement.helper.js')
const LicenceAgreementModel = require('../../app/models/licence-agreement.model.js')

// Thing under test
const FinancialAgreementModel = require('../../app/models/financial-agreement.model.js')

const FINANCIAL_AGREEMENT_MVAL_INDEX = 7

describe('Financial Agreement model', () => {
  let testRecord

  before(async () => {
    testRecord = FinancialAgreementHelper.select(FINANCIAL_AGREEMENT_MVAL_INDEX)
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await FinancialAgreementModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(FinancialAgreementModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence agreements', () => {
      let testLicenceAgreements

      before(async () => {
        testLicenceAgreements = []
        for (let i = 0; i < 2; i++) {
          const licenceAgreement = await LicenceAgreementHelper.add({ financialAgreementId: testRecord.id })

          testLicenceAgreements.push(licenceAgreement)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await FinancialAgreementModel.query()
          .innerJoinRelated('licenceAgreements')

        expect(query).to.exist()
      })

      it('can eager load the licence agreements', async () => {
        const result = await FinancialAgreementModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceAgreements')

        expect(result).to.be.instanceOf(FinancialAgreementModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceAgreements).to.be.an.array()
        expect(result.licenceAgreements[0]).to.be.an.instanceOf(LicenceAgreementModel)
        expect(result.licenceAgreements).to.include(testLicenceAgreements[0])
        expect(result.licenceAgreements).to.include(testLicenceAgreements[1])
      })
    })
  })
})
