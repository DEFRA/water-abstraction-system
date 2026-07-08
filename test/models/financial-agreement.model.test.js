// Test helpers
import * as FinancialAgreementHelper from '../support/helpers/financial-agreement.helper.js'
import * as LicenceAgreementHelper from '../support/helpers/licence-agreement.helper.js'
import LicenceAgreementModel from '../../app/models/licence-agreement.model.js'

// Thing under test
import FinancialAgreementModel from '../../app/models/financial-agreement.model.js'

const FINANCIAL_AGREEMENT_MVAL_INDEX = 7

describe('Financial Agreement model', () => {
  let testLicenceAgreements
  let testRecord

  beforeAll(async () => {
    // Test record
    testRecord = FinancialAgreementHelper.select(FINANCIAL_AGREEMENT_MVAL_INDEX)

    // Link to licence agreements
    testLicenceAgreements = []
    for (let i = 0; i < 2; i++) {
      const licenceAgreement = await LicenceAgreementHelper.add({ financialAgreementId: testRecord.id })

      testLicenceAgreements.push(licenceAgreement)
    }
  })

  afterAll(async () => {
    for (const licenceAgreement of testLicenceAgreements) {
      await licenceAgreement.$query().delete()
    }

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await FinancialAgreementModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(FinancialAgreementModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence agreements', () => {
      it('can successfully run a related query', async () => {
        const query = await FinancialAgreementModel.query().innerJoinRelated('licenceAgreements')

        expect(query).toBeDefined()
      })

      it('can eager load the licence agreements', async () => {
        const result = await FinancialAgreementModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceAgreements')

        expect(result).toBeInstanceOf(FinancialAgreementModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licenceAgreements).toBeInstanceOf(Array)
        expect(result.licenceAgreements[0]).toBeInstanceOf(LicenceAgreementModel)
        expect(result.licenceAgreements).toContainEqual(testLicenceAgreements[0])
        expect(result.licenceAgreements).toContainEqual(testLicenceAgreements[1])
      })
    })
  })
})
