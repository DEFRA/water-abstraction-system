// Test framework
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import FinancialAgreementHelper from '../../support/helpers/financial-agreement.helper.js'
import LicenceAgreementHelper from '../../support/helpers/licence-agreement.helper.js'

// Thing under test
import FetchAgreementsService from '../../../app/services/licences/fetch-agreements.service.js'

const FINANCIAL_AGREEMENT_S130U_INDEX = 5

describe('Licences - Fetch Agreements service', () => {
  const endDate = new Date('2040-05-01')
  const signedOn = new Date('2022-04-01')
  const startDate = new Date('2022-04-01')

  let licenceAgreement
  let financialAgreement

  beforeAll(async () => {
    financialAgreement = FinancialAgreementHelper.select(FINANCIAL_AGREEMENT_S130U_INDEX)
  })

  afterEach(async () => {
    await licenceAgreement.$query().delete()
  })

  describe('when the licence has agreements data', () => {
    describe('and the agreement has not been deleted', () => {
      beforeEach(async () => {
        licenceAgreement = await LicenceAgreementHelper.add({
          endDate,
          financialAgreementId: financialAgreement.id,
          startDate,
          signedOn
        })
      })

      it('returns the matching agreements data', async () => {
        const results = await FetchAgreementsService(licenceAgreement.licenceRef)

        expect(results[0]).toMatchObject({
          endDate,
          financialAgreement: {
            id: financialAgreement.id,
            code: financialAgreement.code
          },
          startDate,
          signedOn
        })
      })
    })

    describe('and the agreement has been deleted', () => {
      beforeEach(async () => {
        licenceAgreement = await LicenceAgreementHelper.add({
          endDate,
          financialAgreementId: financialAgreement.id,
          startDate,
          signedOn,
          deletedAt: new Date()
        })
      })

      it('does not return the agreements data', async () => {
        const results = await FetchAgreementsService(licenceAgreement.licenceRef)

        expect(results).toHaveLength(0)
      })
    })
  })
})
