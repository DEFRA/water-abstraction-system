'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillHelper = require('../../../support/helpers/bill.helper.js')
const BillLicenceHelper = require('../../../support/helpers/bill-licence.helper.js')
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const ChargeReferenceHelper = require('../../../support/helpers/charge-reference.helper.js')
const ChargeVersionHelper = require('../../../support/helpers/charge-version.helper.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')

// Thing under test
const FetchChargeVersionBillingDataService = require('../../../../app/services/licences/supplementary/fetch-charge-version-billing-data.service.js')

describe('Licences - Supplementary - Fetch Charge Version Billing Data service', () => {
  describe('when passed a charge version ID', () => {
    let bill
    let licence
    let preSrocChargeReference
    let preSrocChargeVersion
    let srocChargeReference
    let srocChargeVersion

    before(async () => {
      licence = await LicenceHelper.add()
      // Add sroc charge version and charge reference
      srocChargeVersion = await ChargeVersionHelper.add({ licenceId: licence.id, startDate: new Date('2023-04-01') })
      srocChargeReference = await ChargeReferenceHelper.add({
        chargeVersionId: srocChargeVersion.id,
        adjustments: { s127: true }
      })

      // Add pre sroc charge version
      preSrocChargeVersion = await ChargeVersionHelper.add({ scheme: 'alcs', licenceId: licence.id })
      preSrocChargeReference = await ChargeReferenceHelper.add({
        chargeVersionId: preSrocChargeVersion.id,
        scheme: 'alcs',
        adjustments: { s127: true }
      })
    })

    describe('and the charge version has a scheme of `alcs`', () => {
      it('fetches the charge version data', async () => {
        const result = await FetchChargeVersionBillingDataService.go(preSrocChargeVersion.id)

        expect(result.chargeVersion).to.equal({
          id: preSrocChargeVersion.id,
          scheme: 'alcs',
          startDate: preSrocChargeVersion.startDate,
          endDate: null,
          chargeReferences: [
            {
              id: preSrocChargeReference.id,
              scheme: 'alcs',
              twoPartTariff: true
            }
          ],
          licence: {
            id: licence.id,
            regionId: licence.regionId,
            includeInSrocBilling: false,
            includeInPresrocBilling: 'no'
          }
        })
      })

      it('does not fetch any bill runs data', async () => {
        const result = await FetchChargeVersionBillingDataService.go(preSrocChargeVersion.id)

        expect(result.srocBillRuns).to.not.exist()
      })
    })

    describe('and the charge version has a scheme of `sroc`', () => {
      it('fetches the charge version data', async () => {
        const result = await FetchChargeVersionBillingDataService.go(srocChargeVersion.id)

        expect(result.chargeVersion).to.equal({
          id: srocChargeVersion.id,
          scheme: 'sroc',
          startDate: srocChargeVersion.startDate,
          endDate: null,
          chargeReferences: [
            {
              id: srocChargeReference.id,
              scheme: 'sroc',
              twoPartTariff: true
            }
          ],
          licence: {
            id: licence.id,
            regionId: licence.regionId,
            includeInSrocBilling: false,
            includeInPresrocBilling: 'no'
          }
        })
      })

      describe('when the licence has been included in multiple sroc bill runs', () => {
        let srocAnnualBillRun
        let srocSupplementaryBillRun

        before(async () => {
          // Add an annual sroc bill run
          srocAnnualBillRun = await BillRunHelper.add({
            batchType: 'annual',
            scheme: 'sroc',
            toFinancialYearEnding: '2025',
            status: 'sent'
          })

          bill = await BillHelper.add({ billRunId: srocAnnualBillRun.id })
          await BillLicenceHelper.add({ billId: bill.id, licenceId: licence.id })

          // Add a sroc supplementary bill run
          srocSupplementaryBillRun = await BillRunHelper.add({
            batchType: 'supplementary',
            scheme: 'sroc',
            toFinancialYearEnding: '2024',
            status: 'review'
          })

          bill = await BillHelper.add({ billRunId: srocSupplementaryBillRun.id })
          await BillLicenceHelper.add({ billId: bill.id, licenceId: licence.id })
        })

        it('fetches the bill runs in ascending order', async () => {
          const result = await FetchChargeVersionBillingDataService.go(srocChargeVersion.id)

          expect(result.srocBillRuns).to.equal([
            {
              regionId: srocSupplementaryBillRun.regionId,
              scheme: 'sroc',
              toFinancialYearEnding: 2024,
              batchType: 'supplementary'
            },
            {
              regionId: srocAnnualBillRun.regionId,
              scheme: 'sroc',
              toFinancialYearEnding: 2025,
              batchType: 'annual'
            }
          ])
        })
      })

      describe('when the licence has been included in a pre sroc bill run', () => {
        before(async () => {
          // Add a pre sroc supplementary bill run
          const preSrocAnnualBillRun = await BillRunHelper.add({
            batchType: 'annual',
            scheme: 'alcs',
            toFinancialYearEnding: '2021',
            status: 'sent'
          })

          bill = await BillHelper.add({ billRunId: preSrocAnnualBillRun.id })
          await BillLicenceHelper.add({ billId: bill.id, licenceId: licence.id })
        })

        it('fetches only the sroc bill runs', async () => {
          const result = await FetchChargeVersionBillingDataService.go(srocChargeVersion.id)

          expect(result.srocBillRuns.length).to.equal(2)
          expect(result.srocBillRuns[0].scheme).to.equal('sroc')
          expect(result.srocBillRuns[1].scheme).to.equal('sroc')
        })
      })

      describe('when the licence has been included in a sroc bill run for financial year end 2023', () => {
        before(async () => {
          // Add a sroc supplementary bill run
          const preSrocAnnualBillRun = await BillRunHelper.add({
            batchType: 'annual',
            scheme: 'sroc',
            toFinancialYearEnding: '2023',
            status: 'sent'
          })

          bill = await BillHelper.add({ billRunId: preSrocAnnualBillRun.id })
          await BillLicenceHelper.add({ billId: bill.id, licenceId: licence.id })
        })

        it('fetches only the bill runs that have a financial year end >= to the charge version start date', async () => {
          const result = await FetchChargeVersionBillingDataService.go(srocChargeVersion.id)

          expect(result.srocBillRuns.length).to.equal(2)
          expect(result.srocBillRuns[0].toFinancialYearEnding).to.equal(2024)
          expect(result.srocBillRuns[1].toFinancialYearEnding).to.equal(2025)
        })
      })

      describe('when the licence has been in an errored bill run', () => {
        let reviewBillRun

        before(async () => {
          // Add a errored bill run
          const erroredBillRun = await BillRunHelper.add({
            batchType: 'annual',
            scheme: 'sroc',
            toFinancialYearEnding: '2024',
            status: 'errored'
          })

          bill = await BillHelper.add({ billRunId: erroredBillRun.id })
          await BillLicenceHelper.add({ billId: bill.id, licenceId: licence.id })

          // Add a cancelled bill run
          const cancelledBillRun = await BillRunHelper.add({
            batchType: 'annual',
            scheme: 'sroc',
            toFinancialYearEnding: '2025',
            status: 'cancelled'
          })

          bill = await BillHelper.add({ billRunId: cancelledBillRun.id })
          await BillLicenceHelper.add({ billId: bill.id, licenceId: licence.id })

          // Add a review bill run
          reviewBillRun = await BillRunHelper.add({
            batchType: 'annual',
            scheme: 'sroc',
            toFinancialYearEnding: '2025',
            status: 'review'
          })

          bill = await BillHelper.add({ billRunId: reviewBillRun.id })
          await BillLicenceHelper.add({ billId: bill.id, licenceId: licence.id })
        })

        it('only fetches bills run with a status of sent, ready or review', async () => {
          const result = await FetchChargeVersionBillingDataService.go(srocChargeVersion.id)

          expect(result.srocBillRuns.length).to.equal(3)
          expect(result.srocBillRuns[0].toFinancialYearEnding).to.equal(2024)
          expect(result.srocBillRuns[1].toFinancialYearEnding).to.equal(2025)
          expect(result.srocBillRuns[1].toFinancialYearEnding).to.equal(2025)
        })
      })
    })
  })
})
