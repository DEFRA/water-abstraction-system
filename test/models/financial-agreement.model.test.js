'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../support/database.js')
const FinancialAgreementHelper = require('../support/helpers/financial-agreement.helper.js')
const LicenceAgreementHelper = require('../support/helpers/licence-agreement.helper.js')
const LicenceAgreementModel = require('../../app/models/licence-agreement.model.js')

// Thing under test
const FinancialAgreementModel = require('../../app/models/financial-agreement.model.js')

describe('Financial Agreement model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await FinancialAgreementHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await FinancialAgreementModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(FinancialAgreementModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence entity roles', () => {
      let testLicenceAgreements

      beforeEach(async () => {
        testRecord = await FinancialAgreementHelper.add()

        const { id: financialAgreementTypeId } = testRecord

        testLicenceAgreements = await LicenceAgreementHelper.add({ financialAgreementTypeId })
      })

      it('can successfully run a related query', async () => {
        const query = await FinancialAgreementModel.query()
          .innerJoinRelated('licenceAgreementTypes')

        expect(query).to.exist()
      })

      it('can eager load the licence entity roles', async () => {
        const result = await FinancialAgreementModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceAgreementTypes')

        expect(result).to.be.instanceOf(FinancialAgreementModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceAgreementTypes).to.be.an.array()
        expect(result.licenceAgreementTypes[0]).to.be.an.instanceOf(LicenceAgreementModel)
        expect(result.licenceAgreementTypes).to.include(testLicenceAgreements)
      })
    })
  })
})
