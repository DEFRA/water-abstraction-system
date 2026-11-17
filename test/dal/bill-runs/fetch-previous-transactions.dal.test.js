// Test framework
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import * as PreviousBillingDataSeeder from '../../support/seeders/previous-billing-data.seeder.js'

// Thing under test
import FetchPreviousTransactionsDal from '../../../src/dal/bill-runs/fetch-previous-transactions.dal.js'

describe('Bill Runs - Fetch Previous Transactions dal', () => {
  let seededData
  let standard
  let twoPartTariff
  let twoPartTariffFlag

  beforeAll(async () => {
    seededData = await PreviousBillingDataSeeder.seed()

    standard = seededData.standard
    twoPartTariff = seededData.twoPartTariff
  })

  afterAll(async () => {
    await PreviousBillingDataSeeder.zap(seededData)
  })

  describe('when a "standard" supplementary bill run is being created', () => {
    beforeAll(() => {
      twoPartTariffFlag = false
    })

    describe('and the billing account has bills in the previous annual and supplementary bill runs', () => {
      describe('and the licence is in both bill runs', () => {
        // NOTE: This would result in 3 transactions for the licence
        //
        // - Bill Run 1 - Annual - debit
        // - Bill Run 2 - Supplementary - credit
        // - Bill Run 2 - Supplementary - debit
        //
        // The credit being for the debit in the annual.
        //
        // When creating Bill Run 3 FetchPreviousTransactions will find these 3 transactions. The annual debit and
        // supplementary credit will cancel each other out, leaving just the supplementary debit to be taken forward.
        //
        // For reference, ProcessSupplementaryTransactions, which calls this service, will flip it to a credit, then
        // compare it to the transactions it is generating.
        it('returns the debit from the supplementary (transactions in the annual and supplementary cancel out)', async () => {
          const results = await FetchPreviousTransactionsDal(
            seededData.billingAccount.id,
            seededData.licenceBoth.id,
            seededData.toFinancialYearEnding,
            twoPartTariffFlag
          )

          expect(results).toHaveLength(1)

          const expectedDebit = standard.supplementaryBillRun.bills[0].billLicences[0].transactions[1]

          expect(results[0]).toEqual({
            adjustmentFactor: expectedDebit.adjustmentFactor,
            aggregateFactor: expectedDebit.aggregateFactor,
            authorisedDays: expectedDebit.authorisedDays,
            authorisedQuantity: expectedDebit.authorisedQuantity,
            billableDays: expectedDebit.billableDays,
            billableQuantity: expectedDebit.billableQuantity,
            chargeCategoryCode: expectedDebit.chargeCategoryCode,
            chargeCategoryDescription: expectedDebit.chargeCategoryDescription,
            chargeReferenceId: expectedDebit.chargeReferenceId,
            chargeType: 'standard',
            credit: false,
            description: expectedDebit.description,
            endDate: expectedDebit.endDate,
            loss: expectedDebit.loss,
            newLicence: expectedDebit.newLicence,
            purposes: expectedDebit.purposes,
            scheme: expectedDebit.scheme,
            season: expectedDebit.season,
            secondPartCharge: expectedDebit.secondPartCharge,
            section126Factor: expectedDebit.section126Factor,
            section127Agreement: expectedDebit.section127Agreement,
            section130Agreement: expectedDebit.section130Agreement === 'true',
            source: expectedDebit.source,
            startDate: expectedDebit.startDate,
            supportedSource: expectedDebit.supportedSource,
            supportedSourceName: expectedDebit.supportedSourceName,
            volume: expectedDebit.volume,
            waterCompanyCharge: expectedDebit.waterCompanyCharge,
            waterUndertaker: expectedDebit.waterUndertaker,
            winterOnly: expectedDebit.winterOnly
          })
        })
      })

      describe('but the licence is only in one of the bill runs', () => {
        // NOTE: In this example the licence was billed in the annual, but this is its first supplementary bill run.
        //
        // So, the service will have no credits to cancel it off and will just return it for further processing.
        it('returns the debit from the debit from it', async () => {
          const results = await FetchPreviousTransactionsDal(
            seededData.billingAccount.id,
            seededData.licenceAnnual.id,
            seededData.toFinancialYearEnding,
            twoPartTariffFlag
          )

          expect(results).toHaveLength(1)

          const expectedDebit = standard.annualBillRun.bills[0].billLicences[0].transactions[0]

          expect(results[0]).toEqual({
            adjustmentFactor: expectedDebit.adjustmentFactor,
            aggregateFactor: expectedDebit.aggregateFactor,
            authorisedDays: expectedDebit.authorisedDays,
            authorisedQuantity: expectedDebit.authorisedQuantity,
            billableDays: expectedDebit.billableDays,
            billableQuantity: expectedDebit.billableQuantity,
            chargeCategoryCode: expectedDebit.chargeCategoryCode,
            chargeCategoryDescription: expectedDebit.chargeCategoryDescription,
            chargeReferenceId: expectedDebit.chargeReferenceId,
            chargeType: 'standard',
            credit: false,
            description: expectedDebit.description,
            endDate: expectedDebit.endDate,
            loss: expectedDebit.loss,
            newLicence: expectedDebit.newLicence,
            purposes: expectedDebit.purposes,
            scheme: expectedDebit.scheme,
            season: expectedDebit.season,
            secondPartCharge: expectedDebit.secondPartCharge,
            section126Factor: expectedDebit.section126Factor,
            section127Agreement: expectedDebit.section127Agreement,
            section130Agreement: expectedDebit.section130Agreement === 'true',
            source: expectedDebit.source,
            startDate: expectedDebit.startDate,
            supportedSource: expectedDebit.supportedSource,
            supportedSourceName: expectedDebit.supportedSourceName,
            volume: expectedDebit.volume,
            waterCompanyCharge: expectedDebit.waterCompanyCharge,
            waterUndertaker: expectedDebit.waterUndertaker,
            winterOnly: expectedDebit.winterOnly
          })
        })
      })

      describe('but the licence has never been billed', () => {
        it('returns an empty array', async () => {
          const results = await FetchPreviousTransactionsDal(
            seededData.billingAccount.id,
            '6d2b7db9-afee-4af2-8916-88c23dd9807d',
            seededData.toFinancialYearEnding,
            twoPartTariffFlag
          )

          expect(results).toHaveLength(0)
        })
      })
    })

    describe('and the billing account has no previous bills', () => {
      it('returns an empty array', async () => {
        const results = await FetchPreviousTransactionsDal(
          'c772d96a-7e99-4f37-8fbd-414828e42ac4',
          '6d2b7db9-afee-4af2-8916-88c23dd9807d',
          seededData.toFinancialYearEnding,
          twoPartTariffFlag
        )

        expect(results).toHaveLength(0)
      })
    })
  })

  describe('when a "two-part tariff" supplementary bill run is being created', () => {
    beforeAll(() => {
      twoPartTariffFlag = true
    })

    describe('and the billing account has bills in the previous annual and supplementary bill runs', () => {
      describe('and the licence is in both bill runs', () => {
        // NOTE: This would result in 3 transactions for the licence
        //
        // - Bill Run 1 - Annual - debit
        // - Bill Run 2 - Supplementary - credit
        // - Bill Run 2 - Supplementary - debit
        //
        // The credit being for the debit in the annual.
        //
        // When creating Bill Run 3 FetchPreviousTransactions will find these 3 transactions. The annual debit and
        // supplementary credit will cancel each other out, leaving just the supplementary debit to be taken forward.
        //
        // For reference, ProcessSupplementaryTransactions, which calls this service, will flip it to a credit, then
        // compare it to the transactions it is generating.
        it('returns the debit from the supplementary (transactions in the annual and supplementary cancel out)', async () => {
          const results = await FetchPreviousTransactionsDal(
            seededData.billingAccount.id,
            seededData.licenceBoth.id,
            seededData.toFinancialYearEnding,
            twoPartTariffFlag
          )

          expect(results).toHaveLength(1)

          const expectedDebit = twoPartTariff.supplementaryBillRun.bills[0].billLicences[0].transactions[1]

          expect(results[0]).toEqual({
            adjustmentFactor: expectedDebit.adjustmentFactor,
            aggregateFactor: expectedDebit.aggregateFactor,
            authorisedDays: expectedDebit.authorisedDays,
            authorisedQuantity: expectedDebit.authorisedQuantity,
            billableDays: expectedDebit.billableDays,
            billableQuantity: expectedDebit.billableQuantity,
            chargeCategoryCode: expectedDebit.chargeCategoryCode,
            chargeCategoryDescription: expectedDebit.chargeCategoryDescription,
            chargeReferenceId: expectedDebit.chargeReferenceId,
            chargeType: 'standard',
            credit: false,
            description: expectedDebit.description,
            endDate: expectedDebit.endDate,
            loss: expectedDebit.loss,
            newLicence: expectedDebit.newLicence,
            purposes: expectedDebit.purposes,
            scheme: expectedDebit.scheme,
            season: expectedDebit.season,
            secondPartCharge: expectedDebit.secondPartCharge,
            section126Factor: expectedDebit.section126Factor,
            section127Agreement: expectedDebit.section127Agreement,
            section130Agreement: expectedDebit.section130Agreement === 'true',
            source: expectedDebit.source,
            startDate: expectedDebit.startDate,
            supportedSource: expectedDebit.supportedSource,
            supportedSourceName: expectedDebit.supportedSourceName,
            volume: expectedDebit.volume,
            waterCompanyCharge: expectedDebit.waterCompanyCharge,
            waterUndertaker: expectedDebit.waterUndertaker,
            winterOnly: expectedDebit.winterOnly
          })
        })
      })

      describe('but the licence is only in one of the bill runs', () => {
        // NOTE: In this example the licence was billed in the annual, but this is its first supplementary bill run.
        //
        // So, the service will have no credits to cancel it off and will just return it for further processing.
        it('returns the debit from the debit from it', async () => {
          const results = await FetchPreviousTransactionsDal(
            seededData.billingAccount.id,
            seededData.licenceAnnual.id,
            seededData.toFinancialYearEnding,
            twoPartTariffFlag
          )

          expect(results).toHaveLength(1)

          const expectedDebit = twoPartTariff.annualBillRun.bills[0].billLicences[0].transactions[0]

          expect(results[0]).toEqual({
            adjustmentFactor: expectedDebit.adjustmentFactor,
            aggregateFactor: expectedDebit.aggregateFactor,
            authorisedDays: expectedDebit.authorisedDays,
            authorisedQuantity: expectedDebit.authorisedQuantity,
            billableDays: expectedDebit.billableDays,
            billableQuantity: expectedDebit.billableQuantity,
            chargeCategoryCode: expectedDebit.chargeCategoryCode,
            chargeCategoryDescription: expectedDebit.chargeCategoryDescription,
            chargeReferenceId: expectedDebit.chargeReferenceId,
            chargeType: 'standard',
            credit: false,
            description: expectedDebit.description,
            endDate: expectedDebit.endDate,
            loss: expectedDebit.loss,
            newLicence: expectedDebit.newLicence,
            purposes: expectedDebit.purposes,
            scheme: expectedDebit.scheme,
            season: expectedDebit.season,
            secondPartCharge: expectedDebit.secondPartCharge,
            section126Factor: expectedDebit.section126Factor,
            section127Agreement: expectedDebit.section127Agreement,
            section130Agreement: expectedDebit.section130Agreement === 'true',
            source: expectedDebit.source,
            startDate: expectedDebit.startDate,
            supportedSource: expectedDebit.supportedSource,
            supportedSourceName: expectedDebit.supportedSourceName,
            volume: expectedDebit.volume,
            waterCompanyCharge: expectedDebit.waterCompanyCharge,
            waterUndertaker: expectedDebit.waterUndertaker,
            winterOnly: expectedDebit.winterOnly
          })
        })
      })

      describe('but the licence has never been billed', () => {
        it('returns an empty array', async () => {
          const results = await FetchPreviousTransactionsDal(
            seededData.billingAccount.id,
            '6d2b7db9-afee-4af2-8916-88c23dd9807d',
            seededData.toFinancialYearEnding,
            twoPartTariffFlag
          )

          expect(results).toHaveLength(0)
        })
      })
    })

    describe('and the billing account has no previous bills', () => {
      it('returns an empty array', async () => {
        const results = await FetchPreviousTransactionsDal(
          'c772d96a-7e99-4f37-8fbd-414828e42ac4',
          '6d2b7db9-afee-4af2-8916-88c23dd9807d',
          seededData.toFinancialYearEnding,
          twoPartTariffFlag
        )

        expect(results).toHaveLength(0)
      })
    })
  })
})
