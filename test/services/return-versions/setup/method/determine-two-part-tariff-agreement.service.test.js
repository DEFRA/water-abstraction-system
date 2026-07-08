// Test helpers
import * as FinancialAgreementHelper from '../../../../support/helpers/financial-agreement.helper.js'
import { generateLicenceRef } from '../../../../support/helpers/licence.helper.js'
import * as LicenceAgreementHelper from '../../../../support/helpers/licence-agreement.helper.js'

// Thing under test
import DetermineTwoPartTariffAgreementService from '../../../../../app/services/return-versions/setup/method/determine-two-part-tariff-agreement.service.js'

describe('Return Versions - Setup - Determine Two-Part Tariff Agreement service', () => {
  const licenceAgreements = {}
  const licenceRef = generateLicenceRef()

  let startDate

  beforeAll(async () => {
    const section126 = FinancialAgreementHelper.select(2)
    const twoPartTariff = FinancialAgreementHelper.select(3)

    licenceAgreements.firstTwoPartAgreement = await LicenceAgreementHelper.add({
      endDate: new Date('2012-08-12'),
      financialAgreementId: twoPartTariff.id,
      licenceRef,
      startDate: new Date('1999-01-01')
    })

    licenceAgreements.nonTwoPartAgreement = await LicenceAgreementHelper.add({
      financialAgreementId: section126.id,
      licenceRef,
      startDate: new Date('2012-08-12')
    })

    licenceAgreements.currentTwoPartAgreement = await LicenceAgreementHelper.add({
      financialAgreementId: twoPartTariff.id,
      licenceRef,
      startDate: new Date('2019-05-13')
    })
  })

  describe('when the selected start date is before the first two-part tariff licence agreement starts', () => {
    beforeAll(() => {
      startDate = new Date('1998-04-01')
    })

    it('returns false', async () => {
      const result = await DetermineTwoPartTariffAgreementService(licenceRef, startDate)

      expect(result).toBe(false)
    })
  })

  describe('when the selected start date is after the "current" two-part tariff licence agreement starts', () => {
    beforeAll(() => {
      startDate = new Date('2024-04-01')
    })

    it('returns true', async () => {
      const result = await DetermineTwoPartTariffAgreementService(licenceRef, startDate)

      expect(result).toBe(true)
    })
  })

  describe('when the selected start date is after the first two-part tariff licence agreement ends but before the "current" agreement starts', () => {
    beforeAll(() => {
      startDate = new Date('2016-04-01')
    })

    it('returns false', async () => {
      const result = await DetermineTwoPartTariffAgreementService(licenceRef, startDate)

      expect(result).toBe(false)
    })
  })

  describe('when the licence ref is unknown', () => {
    beforeAll(() => {
      startDate = new Date('2024-04-01')
    })

    it('returns false', async () => {
      const result = await DetermineTwoPartTariffAgreementService(generateLicenceRef(), startDate)

      expect(result).toBe(false)
    })
  })
})
