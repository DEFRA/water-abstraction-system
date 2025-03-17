'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillHelper = require('../../../support/helpers/bill.helper.js')
const BillLicenceHelper = require('../../../support/helpers/bill-licence.helper.js')
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const BillingAccountHelper = require('../../../support/helpers/billing-account.helper.js')
const ChangeReasonHelper = require('../../../support/helpers/change-reason.helper.js')
const ChargeVersionHelper = require('../../../support/helpers/charge-version.helper.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const LicenceSupplementaryYearHelper = require('../../../support/helpers/licence-supplementary-year.helper.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')

// Thing under test
const FetchNonChargeableBillingAccountsService = require('../../../../app/services/bill-runs/tpt-supplementary/fetch-non-chargeable-billing-accounts.service.js')

const ABATEMENT_S126 = 16
const MAJOR_CHANGE = 0

// NOTE: These are declared outside the describe to make them accessible to our `_cleanUp()` function
let annualTptBillRun
let billA
let billB
let billLicenceA
let billLicenceB
let billingAccountA
let billingAccountB
let billingAccountNotInBillRun
let chargeableChargeVersionA
let chargeableChargeVersionB
let inProgressTptBillRun
let licenceA
let licenceB
let licenceNotAssigned
let licenceSupplementaryYearA
let licenceSupplementaryYearB
let licenceSupplementaryYearNotAssigned
let nonChargeableChargeVersionA
let nonChargeableChargeVersionB
let outOfPeriodTptBillRun

describe('Bill Runs - TPT Supplementary - Fetch Non-Chargeable Billing Accounts service', () => {
  const billingPeriod = {
    startDate: new Date('2023-04-01'),
    endDate: new Date('2024-03-31')
  }
  const chargeableChangeReason = ChangeReasonHelper.select(MAJOR_CHANGE)
  const nonChargeableChangeReason = ChangeReasonHelper.select(ABATEMENT_S126)

  let billingAccountResults
  let region

  beforeEach(async () => {
    const financialYearEnd = billingPeriod.endDate.getFullYear()
    region = RegionHelper.select()

    annualTptBillRun = await BillRunHelper.add({
      batchType: 'two_part_tariff',
      fromFinancialYearEnding: financialYearEnd,
      regionId: region.id,
      scheme: 'sroc',
      status: 'sent',
      toFinancialYearEnding: financialYearEnd
    })

    inProgressTptBillRun = await BillRunHelper.add({
      batchType: 'two_part_supplementary',
      fromFinancialYearEnding: financialYearEnd,
      regionId: region.id,
      scheme: 'sroc',
      status: 'processing',
      toFinancialYearEnding: financialYearEnd
    })

    outOfPeriodTptBillRun = await BillRunHelper.add({
      batchType: 'two_part_tariff',
      fromFinancialYearEnding: financialYearEnd - 1,
      regionId: region.id,
      scheme: 'sroc',
      status: 'sent',
      toFinancialYearEnding: financialYearEnd - 1
    })

    licenceA = await LicenceHelper.add({ regionId: region.id })
    licenceB = await LicenceHelper.add({ regionId: region.id })
    licenceNotAssigned = await LicenceHelper.add({ regionId: region.id })

    licenceSupplementaryYearA = await LicenceSupplementaryYearHelper.add({
      billRunId: inProgressTptBillRun.id,
      financialYearEnd,
      licenceId: licenceA.id
    })
    licenceSupplementaryYearB = await LicenceSupplementaryYearHelper.add({
      billRunId: inProgressTptBillRun.id,
      financialYearEnd,
      licenceId: licenceB.id
    })
    licenceNotAssigned = await LicenceSupplementaryYearHelper.add({
      billRunId: null,
      financialYearEnd,
      licenceId: licenceNotAssigned.id
    })

    billingAccountA = await BillingAccountHelper.add()
    billingAccountB = await BillingAccountHelper.add()
    billingAccountNotInBillRun = await BillingAccountHelper.add()
  })

  afterEach(async () => {
    await _cleanUp()
  })

  describe('A billing account and licence should not appear in the results', () => {
    describe('when it has no non-chargeable charge versions for the billing period', () => {
      beforeEach(async () => {
        chargeableChargeVersionA = await ChargeVersionHelper.add({
          billingAccountId: billingAccountA.id,
          changeReasonId: chargeableChangeReason.id,
          endDate: new Date('2024-03-31'),
          licenceId: licenceA.id,
          licenceRef: licenceA.licenceRef,
          startDate: new Date('2022-04-01')
        })

        nonChargeableChargeVersionA = await ChargeVersionHelper.add({
          billingAccountId: null,
          changeReasonId: nonChargeableChangeReason.id,
          endDate: null,
          licenceId: licenceA.id,
          licenceRef: licenceA.licenceRef,
          startDate: new Date('2024-04-01')
        })

        billA = await BillHelper.add({
          accountNumber: billingAccountA.accountNumber,
          billRunId: annualTptBillRun.id,
          billingAccountId: billingAccountA.id,
          financialYearEnding: annualTptBillRun.toFinancialYearEnding
        })
        billLicenceA = await BillLicenceHelper.add({
          billId: billA.id,
          licenceId: licenceA.id,
          licenceRef: licenceA.licenceRef
        })

        billingAccountResults = []
      })

      it('returns no results', async () => {
        const results = await FetchNonChargeableBillingAccountsService.go(
          inProgressTptBillRun.id,
          billingPeriod,
          billingAccountResults
        )

        expect(results).to.be.empty()
      })
    })

    describe('when it was not previously billed in the period', () => {
      beforeEach(async () => {
        chargeableChargeVersionA = await ChargeVersionHelper.add({
          billingAccountId: billingAccountA.id,
          changeReasonId: chargeableChangeReason.id,
          endDate: new Date('2023-03-31'),
          licenceId: licenceA.id,
          licenceRef: licenceA.licenceRef,
          startDate: new Date('2022-04-01')
        })

        nonChargeableChargeVersionA = await ChargeVersionHelper.add({
          billingAccountId: null,
          changeReasonId: nonChargeableChangeReason.id,
          endDate: null,
          licenceId: licenceA.id,
          licenceRef: licenceA.licenceRef,
          startDate: new Date('2023-04-01')
        })

        billA = await BillHelper.add({
          accountNumber: billingAccountA.accountNumber,
          billRunId: outOfPeriodTptBillRun.id,
          billingAccountId: billingAccountA.id,
          financialYearEnding: outOfPeriodTptBillRun.toFinancialYearEnding
        })
        billLicenceA = await BillLicenceHelper.add({
          billId: billA.id,
          licenceId: licenceA.id,
          licenceRef: licenceA.licenceRef
        })

        billingAccountResults = []
      })

      it('returns no results', async () => {
        const results = await FetchNonChargeableBillingAccountsService.go(
          inProgressTptBillRun.id,
          billingPeriod,
          billingAccountResults
        )

        expect(results).to.be.empty()
      })
    })

    describe("when the FetchBillingAccountsService's results already includes the licence", () => {
      beforeEach(async () => {
        chargeableChargeVersionA = await ChargeVersionHelper.add({
          billingAccountId: billingAccountA.id,
          changeReasonId: chargeableChangeReason.id,
          endDate: new Date('2023-09-30'),
          licenceId: licenceA.id,
          licenceRef: licenceA.licenceRef,
          startDate: new Date('2022-04-01')
        })

        nonChargeableChargeVersionA = await ChargeVersionHelper.add({
          billingAccountId: null,
          changeReasonId: nonChargeableChangeReason.id,
          endDate: null,
          licenceId: licenceA.id,
          licenceRef: licenceA.licenceRef,
          startDate: new Date('2023-10-01')
        })

        billA = await BillHelper.add({
          accountNumber: billingAccountA.accountNumber,
          billRunId: annualTptBillRun.id,
          billingAccountId: billingAccountA.id,
          financialYearEnding: annualTptBillRun.toFinancialYearEnding
        })
        billLicenceA = await BillLicenceHelper.add({
          billId: billA.id,
          licenceId: licenceA.id,
          licenceRef: licenceA.licenceRef
        })

        billingAccountResults = [
          {
            id: billingAccountA.id,
            accountNumber: billingAccountA.accountNumber,
            chargeVersions: [
              {
                id: chargeableChargeVersionA.id,
                licence: {
                  id: licenceA.id,
                  licenceRef: licenceA.licenceRef
                }
              }
            ]
          }
        ]
      })

      it('returns no results', async () => {
        const results = await FetchNonChargeableBillingAccountsService.go(
          inProgressTptBillRun.id,
          billingPeriod,
          billingAccountResults
        )

        expect(results).to.be.empty()
      })
    })
  })

  describe('A billing account will appear in the results', () => {
    describe('when it has a licence that was previously billed in the period, and now has a non-chargeable charge version', () => {
      beforeEach(async () => {
        chargeableChargeVersionA = await ChargeVersionHelper.add({
          billingAccountId: billingAccountA.id,
          changeReasonId: chargeableChangeReason.id,
          endDate: new Date('2023-03-31'),
          licenceId: licenceA.id,
          licenceRef: licenceA.licenceRef,
          startDate: new Date('2022-04-01')
        })

        nonChargeableChargeVersionA = await ChargeVersionHelper.add({
          billingAccountId: null,
          changeReasonId: nonChargeableChangeReason.id,
          endDate: null,
          licenceId: licenceA.id,
          licenceRef: licenceA.licenceRef,
          startDate: new Date('2023-04-01')
        })

        billA = await BillHelper.add({
          accountNumber: billingAccountA.accountNumber,
          billRunId: annualTptBillRun.id,
          billingAccountId: billingAccountA.id,
          financialYearEnding: annualTptBillRun.toFinancialYearEnding
        })
        billLicenceA = await BillLicenceHelper.add({
          billId: billA.id,
          licenceId: licenceA.id,
          licenceRef: licenceA.licenceRef
        })

        billingAccountResults = []
      })

      it('returns the billing account and licence', async () => {
        const results = await FetchNonChargeableBillingAccountsService.go(
          inProgressTptBillRun.id,
          billingPeriod,
          billingAccountResults
        )

        expect(results).to.have.length(1)
        expect(results[0]).to.equal({
          accountNumber: billingAccountA.accountNumber,
          id: billingAccountA.id,
          chargeVersions: [
            {
              chargeReferences: [],
              licence: {
                id: licenceA.id,
                licenceRef: licenceA.licenceRef,
                historicalAreaCode: licenceA.regions.historicalAreaCode,
                regionalChargeArea: licenceA.regions.regionalChargeArea,
                region: { chargeRegionId: region.chargeRegionId }
              }
            }
          ]
        })
      })
    })

    describe("when the FetchBillingAccountsService's results has the billing account but not the licence", () => {
      beforeEach(async () => {
        chargeableChargeVersionA = await ChargeVersionHelper.add({
          billingAccountId: billingAccountA.id,
          changeReasonId: chargeableChangeReason.id,
          endDate: new Date('2023-03-31'),
          licenceId: licenceA.id,
          licenceRef: licenceA.licenceRef,
          startDate: new Date('2022-04-01')
        })

        nonChargeableChargeVersionA = await ChargeVersionHelper.add({
          billingAccountId: null,
          changeReasonId: nonChargeableChangeReason.id,
          endDate: null,
          licenceId: licenceA.id,
          licenceRef: licenceA.licenceRef,
          startDate: new Date('2023-04-01')
        })

        billA = await BillHelper.add({
          accountNumber: billingAccountA.accountNumber,
          billRunId: annualTptBillRun.id,
          billingAccountId: billingAccountA.id,
          financialYearEnding: annualTptBillRun.toFinancialYearEnding
        })
        billLicenceA = await BillLicenceHelper.add({
          billId: billA.id,
          licenceId: licenceA.id,
          licenceRef: licenceA.licenceRef
        })

        billingAccountResults = [
          {
            id: billingAccountA.id,
            accountNumber: billingAccountA.accountNumber,
            chargeVersions: [
              {
                id: chargeableChargeVersionA.id,
                licence: {
                  id: licenceB.id,
                  licenceRef: licenceB.licenceRef
                }
              }
            ]
          }
        ]
      })

      it('still returns the billing account and licence', async () => {
        const results = await FetchNonChargeableBillingAccountsService.go(
          inProgressTptBillRun.id,
          billingPeriod,
          billingAccountResults
        )

        expect(results).to.have.length(1)
        expect(results[0]).to.equal({
          accountNumber: billingAccountA.accountNumber,
          id: billingAccountA.id,
          chargeVersions: [
            {
              chargeReferences: [],
              licence: {
                id: licenceA.id,
                licenceRef: licenceA.licenceRef,
                historicalAreaCode: licenceA.regions.historicalAreaCode,
                regionalChargeArea: licenceA.regions.regionalChargeArea,
                region: { chargeRegionId: region.chargeRegionId }
              }
            }
          ]
        })
      })
    })

    describe("when the FetchBillingAccountsService's results has the licence but not the billing account", () => {
      beforeEach(async () => {
        chargeableChargeVersionA = await ChargeVersionHelper.add({
          billingAccountId: billingAccountA.id,
          changeReasonId: chargeableChangeReason.id,
          endDate: new Date('2023-03-31'),
          licenceId: licenceA.id,
          licenceRef: licenceA.licenceRef,
          startDate: new Date('2022-04-01')
        })

        nonChargeableChargeVersionA = await ChargeVersionHelper.add({
          billingAccountId: null,
          changeReasonId: nonChargeableChangeReason.id,
          endDate: null,
          licenceId: licenceA.id,
          licenceRef: licenceA.licenceRef,
          startDate: new Date('2023-04-01')
        })

        billA = await BillHelper.add({
          accountNumber: billingAccountA.accountNumber,
          billRunId: annualTptBillRun.id,
          billingAccountId: billingAccountA.id,
          financialYearEnding: annualTptBillRun.toFinancialYearEnding
        })
        billLicenceA = await BillLicenceHelper.add({
          billId: billA.id,
          licenceId: licenceA.id,
          licenceRef: licenceA.licenceRef
        })

        billingAccountResults = [
          {
            id: billingAccountB.id,
            accountNumber: billingAccountB.accountNumber,
            chargeVersions: [
              {
                id: chargeableChargeVersionA.id,
                licence: {
                  id: licenceA.id,
                  licenceRef: licenceA.licenceRef
                }
              }
            ]
          }
        ]
      })

      it('still returns the billing account and licence', async () => {
        const results = await FetchNonChargeableBillingAccountsService.go(
          inProgressTptBillRun.id,
          billingPeriod,
          billingAccountResults
        )

        expect(results).to.have.length(1)
        expect(results[0]).to.equal({
          accountNumber: billingAccountA.accountNumber,
          id: billingAccountA.id,
          chargeVersions: [
            {
              chargeReferences: [],
              licence: {
                id: licenceA.id,
                licenceRef: licenceA.licenceRef,
                historicalAreaCode: licenceA.regions.historicalAreaCode,
                regionalChargeArea: licenceA.regions.regionalChargeArea,
                region: { chargeRegionId: region.chargeRegionId }
              }
            }
          ]
        })
      })
    })
  })

  describe('A billing account linked to multiple licences', () => {
    beforeEach(async () => {
      chargeableChargeVersionA = await ChargeVersionHelper.add({
        billingAccountId: billingAccountA.id,
        changeReasonId: chargeableChangeReason.id,
        endDate: new Date('2023-03-31'),
        licenceId: licenceA.id,
        licenceRef: licenceA.licenceRef,
        startDate: new Date('2022-04-01')
      })

      chargeableChargeVersionB = await ChargeVersionHelper.add({
        billingAccountId: billingAccountA.id,
        changeReasonId: chargeableChangeReason.id,
        endDate: new Date('2023-03-31'),
        licenceId: licenceB.id,
        licenceRef: licenceB.licenceRef,
        startDate: new Date('2022-04-01')
      })
    })

    describe('both of which were previously billed', () => {
      beforeEach(async () => {
        billA = await BillHelper.add({
          accountNumber: billingAccountA.accountNumber,
          billRunId: annualTptBillRun.id,
          billingAccountId: billingAccountA.id,
          financialYearEnding: annualTptBillRun.toFinancialYearEnding
        })

        billLicenceA = await BillLicenceHelper.add({
          billId: billA.id,
          licenceId: licenceA.id,
          licenceRef: licenceA.licenceRef
        })

        billLicenceB = await BillLicenceHelper.add({
          billId: billA.id,
          licenceId: licenceB.id,
          licenceRef: licenceB.licenceRef
        })

        billingAccountResults = []
      })

      describe('and both of which have now been made non-chargeable', () => {
        beforeEach(async () => {
          nonChargeableChargeVersionA = await ChargeVersionHelper.add({
            billingAccountId: billingAccountA.id,
            changeReasonId: nonChargeableChangeReason.id,
            endDate: null,
            licenceId: licenceA.id,
            licenceRef: licenceA.licenceRef,
            startDate: new Date('2023-04-01')
          })

          nonChargeableChargeVersionB = await ChargeVersionHelper.add({
            billingAccountId: billingAccountA.id,
            changeReasonId: nonChargeableChangeReason.id,
            endDate: null,
            licenceId: licenceB.id,
            licenceRef: licenceB.licenceRef,
            startDate: new Date('2023-04-01')
          })
        })

        it('only appears in the results once but with multiple charge versions', async () => {
          const results = await FetchNonChargeableBillingAccountsService.go(
            inProgressTptBillRun.id,
            billingPeriod,
            billingAccountResults
          )

          expect(results).to.have.length(1)
          expect(results[0].id).to.equal(billingAccountA.id)

          expect(results[0].chargeVersions).to.have.length(2)

          // NOTE : Because the results are ordered by account number, and the billing account details are randomly
          // generated, we can't know in which position the two accounts, and therefore the licences will be in.
          const licenceIds = []

          for (const chargeVersion of results[0].chargeVersions) {
            licenceIds.push(chargeVersion.licence.id)
          }

          expect(licenceIds).to.include(licenceA.id)
          expect(licenceIds).to.include(licenceB.id)
        })
      })
    })
  })

  describe('A licence will appear in the results with different billing accounts', () => {
    describe('because it has been linked to multiple billing accounts through chargeable charge version changes', () => {
      beforeEach(async () => {
        chargeableChargeVersionA = await ChargeVersionHelper.add({
          billingAccountId: billingAccountA.id,
          changeReasonId: chargeableChangeReason.id,
          endDate: new Date('2023-09-30'),
          licenceId: licenceA.id,
          licenceRef: licenceA.licenceRef,
          startDate: new Date('2022-04-01')
        })

        chargeableChargeVersionB = await ChargeVersionHelper.add({
          billingAccountId: billingAccountB.id,
          changeReasonId: chargeableChangeReason.id,
          endDate: new Date('2023-03-31'),
          licenceId: licenceA.id,
          licenceRef: licenceA.licenceRef,
          startDate: new Date('2023-10-01')
        })
      })

      describe('which resulted in multiple bills in the previous bill run', () => {
        beforeEach(async () => {
          billA = await BillHelper.add({
            accountNumber: billingAccountA.accountNumber,
            billRunId: annualTptBillRun.id,
            billingAccountId: billingAccountA.id,
            financialYearEnding: annualTptBillRun.toFinancialYearEnding
          })
          billLicenceA = await BillLicenceHelper.add({
            billId: billA.id,
            licenceId: licenceA.id,
            licenceRef: licenceA.licenceRef
          })

          billB = await BillHelper.add({
            accountNumber: billingAccountB.accountNumber,
            billRunId: annualTptBillRun.id,
            billingAccountId: billingAccountB.id,
            financialYearEnding: annualTptBillRun.toFinancialYearEnding
          })
          billLicenceB = await BillLicenceHelper.add({
            billId: billB.id,
            licenceId: licenceA.id,
            licenceRef: licenceA.licenceRef
          })

          billingAccountResults = []
        })

        describe('and now the licence has been made non-chargeable', () => {
          beforeEach(async () => {
            nonChargeableChargeVersionA = await ChargeVersionHelper.add({
              billingAccountId: billingAccountA.id,
              changeReasonId: nonChargeableChangeReason.id,
              endDate: null,
              licenceId: licenceA.id,
              licenceRef: licenceA.licenceRef,
              startDate: new Date('2023-10-01')
            })
          })

          it('returns multiple billing accounts for the licence', async () => {
            const results = await FetchNonChargeableBillingAccountsService.go(
              inProgressTptBillRun.id,
              billingPeriod,
              billingAccountResults
            )

            expect(results).to.have.length(2)

            expect(results[0].chargeVersions[0].licence.id).to.equal(licenceA.id)
            expect(results[1].chargeVersions[0].licence.id).to.equal(licenceA.id)

            // NOTE : Because the results are ordered by account number, and the billing account details are randomly
            // generated, we can't know in which position the two accounts will be in.
            const billingAccountIds = []

            for (const result of results) {
              billingAccountIds.push(result.id)
            }

            expect(billingAccountIds).to.include(billingAccountA.id)
            expect(billingAccountIds).to.include(billingAccountB.id)
          })
        })
      })
    })
  })
})

async function _cleanUp() {
  if (billLicenceA) await billLicenceA.$query().delete()
  if (billLicenceB) await billLicenceB.$query().delete()
  if (billA) await billA.$query().delete()
  if (billB) await billA.$query().delete()
  if (annualTptBillRun) await annualTptBillRun.$query().delete()
  if (inProgressTptBillRun) await inProgressTptBillRun.$query().delete()
  if (outOfPeriodTptBillRun) await outOfPeriodTptBillRun.$query().delete()
  if (chargeableChargeVersionA) await chargeableChargeVersionA.$query().delete()
  if (chargeableChargeVersionB) await chargeableChargeVersionB.$query().delete()
  if (nonChargeableChargeVersionA) await nonChargeableChargeVersionA.$query().delete()
  if (nonChargeableChargeVersionB) await nonChargeableChargeVersionB.$query().delete()
  if (licenceSupplementaryYearA) await licenceSupplementaryYearA.$query().delete()
  if (licenceSupplementaryYearB) await licenceSupplementaryYearB.$query().delete()
  if (licenceSupplementaryYearNotAssigned) await licenceSupplementaryYearNotAssigned.$query().delete()
  if (licenceA) await licenceA.$query().delete()
  if (licenceB) await licenceB.$query().delete()
  if (licenceNotAssigned) await licenceNotAssigned.$query().delete()
  if (billingAccountA) await billingAccountA.$query().delete()
  if (billingAccountB) await billingAccountB.$query().delete()
  if (billingAccountNotInBillRun) await billingAccountNotInBillRun.$query().delete()
}
