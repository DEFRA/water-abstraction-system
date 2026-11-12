// Test framework
import { beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import BillHelper from 'water-abstraction-engine/test/helpers/bill.helper.js'
import BillLicenceHelper from 'water-abstraction-engine/test/helpers/bill-licence.helper.js'
import BillRunHelper from 'water-abstraction-engine/test/helpers/bill-run.helper.js'
import ChargeReferenceHelper from 'water-abstraction-engine/test/helpers/charge-reference.helper.js'
import ChargeVersionHelper from 'water-abstraction-engine/test/helpers/charge-version.helper.js'
import LicenceHelper from 'water-abstraction-engine/test/helpers/licence.helper.js'

// Thing under test
import FetchChargeVersionBillingDataService from '../../../../src/services/licences/supplementary/fetch-charge-version-billing-data.service.js'

describe('Licences - Supplementary - Fetch Charge Version Billing Data service', () => {
  describe('when passed a charge version ID', () => {
    let bill
    let licence
    let preSrocChargeReference
    let preSrocChargeVersion
    let srocChargeReference
    let srocChargeVersion

    beforeAll(async () => {
      licence = await LicenceHelper.add()
      // Add sroc charge version and charge reference
      srocChargeVersion = await ChargeVersionHelper.add({ licenceId: licence.id, startDate: new Date('2023-04-01') })
      srocChargeReference = await ChargeReferenceHelper.add({
        abstractionPeriodEndDay: 31,
        abstractionPeriodEndMonth: 3,
        abstractionPeriodStartDay: 1,
        abstractionPeriodStartMonth: 4,
        adjustments: { aggregate: null, charge: null, s126: null, s127: true, s130: false, winter: false },
        chargeVersionId: srocChargeVersion.id,
        description: 'Charge reference 1 - SROC',
        scheme: 'sroc'
      })

      // Add pre sroc charge version
      preSrocChargeVersion = await ChargeVersionHelper.add({ licenceId: licence.id, scheme: 'alcs' })
      preSrocChargeReference = await ChargeReferenceHelper.add({
        abstractionPeriodEndDay: 31,
        abstractionPeriodEndMonth: 3,
        abstractionPeriodStartDay: 1,
        abstractionPeriodStartMonth: 4,
        authorisedAnnualQuantity: 200,
        chargeVersionId: preSrocChargeVersion.id,
        description: 'Charge element 1 - PRESROC',
        restrictedSource: false,
        scheme: 'alcs',
        season: 'all year',
        seasonDerived: 'all year',
        section127Agreement: true,
        source: 'unsupported'
      })
    })

    describe('and the charge version has a scheme of `alcs`', () => {
      it('fetches the charge version data', async () => {
        const result = await FetchChargeVersionBillingDataService(preSrocChargeVersion.id)

        expect(result.chargeVersion).toEqual({
          chargeReferences: [
            {
              id: preSrocChargeReference.id,
              scheme: 'alcs',
              twoPartTariff: null
            }
          ],
          endDate: null,
          id: preSrocChargeVersion.id,
          licence: {
            id: licence.id,
            includeInPresrocBilling: 'no',
            includeInSrocBilling: false,
            regionId: licence.regionId
          },
          scheme: 'alcs',
          startDate: preSrocChargeVersion.startDate
        })
      })

      it('does not fetch any bill runs data', async () => {
        const result = await FetchChargeVersionBillingDataService(preSrocChargeVersion.id)

        expect(result.srocBillRuns).toBeUndefined()
      })
    })

    describe('and the charge version has a scheme of `sroc`', () => {
      it('fetches the charge version data', async () => {
        const result = await FetchChargeVersionBillingDataService(srocChargeVersion.id)

        expect(result.chargeVersion).toEqual({
          chargeReferences: [
            {
              id: srocChargeReference.id,
              scheme: 'sroc',
              twoPartTariff: true
            }
          ],
          endDate: null,
          id: srocChargeVersion.id,
          licence: {
            id: licence.id,
            includeInPresrocBilling: 'no',
            includeInSrocBilling: false,
            regionId: licence.regionId
          },
          scheme: 'sroc',
          startDate: srocChargeVersion.startDate
        })
      })

      describe('when the licence has been included in multiple sroc bill runs', () => {
        let srocAnnualBillRun
        let srocSupplementaryBillRun

        beforeAll(async () => {
          // Add an annual sroc bill run
          srocAnnualBillRun = await BillRunHelper.add({
            batchType: 'annual',
            scheme: 'sroc',
            status: 'sent',
            toFinancialYearEnding: '2025'
          })

          bill = await BillHelper.add({ billRunId: srocAnnualBillRun.id })
          await BillLicenceHelper.add({ billId: bill.id, licenceId: licence.id })

          // Add a sroc supplementary bill run
          srocSupplementaryBillRun = await BillRunHelper.add({
            batchType: 'supplementary',
            scheme: 'sroc',
            status: 'review',
            toFinancialYearEnding: '2024'
          })

          bill = await BillHelper.add({ billRunId: srocSupplementaryBillRun.id })
          await BillLicenceHelper.add({ billId: bill.id, licenceId: licence.id })
        })

        it('fetches the bill runs in ascending order', async () => {
          const result = await FetchChargeVersionBillingDataService(srocChargeVersion.id)

          expect(result.srocBillRuns).toEqual([
            {
              batchType: 'supplementary',
              regionId: srocSupplementaryBillRun.regionId,
              scheme: 'sroc',
              toFinancialYearEnding: 2024
            },
            {
              batchType: 'annual',
              regionId: srocAnnualBillRun.regionId,
              scheme: 'sroc',
              toFinancialYearEnding: 2025
            }
          ])
        })
      })

      describe('when the licence has been included in a pre sroc bill run', () => {
        beforeAll(async () => {
          // Add a pre sroc supplementary bill run
          const preSrocAnnualBillRun = await BillRunHelper.add({
            batchType: 'annual',
            scheme: 'alcs',
            status: 'sent',
            toFinancialYearEnding: '2021'
          })

          bill = await BillHelper.add({ billRunId: preSrocAnnualBillRun.id })
          await BillLicenceHelper.add({ billId: bill.id, licenceId: licence.id })
        })

        it('fetches only the sroc bill runs', async () => {
          const result = await FetchChargeVersionBillingDataService(srocChargeVersion.id)

          expect(result.srocBillRuns).toHaveLength(2)
          expect(result.srocBillRuns[0].scheme).toEqual('sroc')
          expect(result.srocBillRuns[1].scheme).toEqual('sroc')
        })
      })

      describe('when the licence has been included in a sroc bill run for financial year end 2023', () => {
        beforeAll(async () => {
          // Add a sroc supplementary bill run
          const preSrocAnnualBillRun = await BillRunHelper.add({
            batchType: 'annual',
            scheme: 'sroc',
            status: 'sent',
            toFinancialYearEnding: '2023'
          })

          bill = await BillHelper.add({ billRunId: preSrocAnnualBillRun.id })
          await BillLicenceHelper.add({ billId: bill.id, licenceId: licence.id })
        })

        it('fetches only the bill runs that have a financial year end >= to the charge version start date', async () => {
          const result = await FetchChargeVersionBillingDataService(srocChargeVersion.id)

          expect(result.srocBillRuns).toHaveLength(2)
          expect(result.srocBillRuns[0].toFinancialYearEnding).toEqual(2024)
          expect(result.srocBillRuns[1].toFinancialYearEnding).toEqual(2025)
        })
      })

      describe('when the licence has been in an errored bill run', () => {
        let reviewBillRun

        beforeAll(async () => {
          // Add a errored bill run
          const erroredBillRun = await BillRunHelper.add({
            batchType: 'annual',
            scheme: 'sroc',
            status: 'errored',
            toFinancialYearEnding: '2024'
          })

          bill = await BillHelper.add({ billRunId: erroredBillRun.id })
          await BillLicenceHelper.add({ billId: bill.id, licenceId: licence.id })

          // Add a cancelled bill run
          const cancelledBillRun = await BillRunHelper.add({
            batchType: 'annual',
            scheme: 'sroc',
            status: 'cancelled',
            toFinancialYearEnding: '2025'
          })

          bill = await BillHelper.add({ billRunId: cancelledBillRun.id })
          await BillLicenceHelper.add({ billId: bill.id, licenceId: licence.id })

          // Add a review bill run
          reviewBillRun = await BillRunHelper.add({
            batchType: 'annual',
            scheme: 'sroc',
            status: 'review',
            toFinancialYearEnding: '2025'
          })

          bill = await BillHelper.add({ billRunId: reviewBillRun.id })
          await BillLicenceHelper.add({ billId: bill.id, licenceId: licence.id })
        })

        it('only fetches bills run with a status of sent, ready or review', async () => {
          const result = await FetchChargeVersionBillingDataService(srocChargeVersion.id)

          expect(result.srocBillRuns).toHaveLength(3)
          expect(result.srocBillRuns[0].toFinancialYearEnding).toEqual(2024)
          expect(result.srocBillRuns[1].toFinancialYearEnding).toEqual(2025)
          expect(result.srocBillRuns[1].toFinancialYearEnding).toEqual(2025)
        })
      })
    })
  })
})
