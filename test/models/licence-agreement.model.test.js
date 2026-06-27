'use strict'

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
  let testFinancialAgreement
  let testLicence
  let testRecord

  beforeAll(async () => {
    // Link to financial agreement
    testFinancialAgreement = FinancialAgreementHelper.select(FINANCIAL_AGREEMENT_MCHG_INDEX)

    // Link to licence
    testLicence = await LicenceHelper.add()

    // Test record
    testRecord = await LicenceAgreementHelper.add({
      financialAgreementId: testFinancialAgreement.id,
      licenceRef: testLicence.licenceRef
    })
  })

  afterAll(async () => {
    await testLicence.$query().delete()

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LicenceAgreementModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(LicenceAgreementModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to financial agreement', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceAgreementModel.query().innerJoinRelated('financialAgreement')

        expect(query).toBeDefined()
      })

      it('can eager load the financial agreement', async () => {
        const result = await LicenceAgreementModel.query()
          .findById(testRecord.id)
          .withGraphFetched('financialAgreement')

        expect(result).toBeInstanceOf(LicenceAgreementModel)
        expect(result.id).toMatchObject(testRecord.id)

        expect(result.financialAgreement).toBeInstanceOf(FinancialAgreementModel)
        expect(result.financialAgreement).toMatchObject(testFinancialAgreement)
      })
    })

    describe('when linking to licence', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceAgreementModel.query().innerJoinRelated('licence')

        expect(query).toBeDefined()
      })

      it('can eager load the licence', async () => {
        const result = await LicenceAgreementModel.query().findById(testRecord.id).withGraphFetched('licence')

        expect(result).toBeInstanceOf(LicenceAgreementModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licence).toBeInstanceOf(LicenceModel)
        expect(result.licence.id).toEqual(testLicence.id)
      })
    })
  })
})
