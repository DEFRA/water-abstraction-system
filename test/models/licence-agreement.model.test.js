'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../support/database.js')
const FinancialAgreementHelper = require('../support/helpers/financial-agreement.helper.js')
const FinancialAgreementModel = require('../../app/models/financial-agreement.model.js')
const LicenceAgreementHelper = require('../support/helpers/licence-agreement.helper.js')

// Thing under test
const LicenceAgreementModel = require('../../app/models/licence-agreement.model.js')

describe('Licence Agreement model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

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
    describe('when linking to financial agreements', () => {
      let testFinancialAgreements

      beforeEach(async () => {
        testFinancialAgreements = await FinancialAgreementHelper.add()

        const { id: financialAgreementId } = testFinancialAgreements

        testRecord = await LicenceAgreementHelper.add({ financialAgreementId })
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceAgreementModel.query()
          .innerJoinRelated('financialAgreements')

        expect(query).to.exist()
      })

      it('can eager load the financial agreements', async () => {
        const result = await LicenceAgreementModel.query()
          .findById(testRecord.id)
          .withGraphFetched('financialAgreements')

        expect(result).to.be.instanceOf(LicenceAgreementModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.financialAgreements).to.be.an.array()
        expect(result.financialAgreements[0]).to.be.an.instanceOf(FinancialAgreementModel)
        expect(result.financialAgreements).to.include(testFinancialAgreements)
      })
    })
  })
})
