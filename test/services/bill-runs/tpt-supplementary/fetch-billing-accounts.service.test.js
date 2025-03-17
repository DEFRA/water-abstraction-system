'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, after, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const BillingAccountHelper = require('../../../support/helpers/billing-account.helper.js')
const ChargeCategoryHelper = require('../../../support/helpers/charge-category.helper.js')
const ChargeElementHelper = require('../../../support/helpers/charge-element.helper.js')
const ChargeReferenceHelper = require('../../../support/helpers/charge-reference.helper.js')
const ChargeVersionHelper = require('../../../support/helpers/charge-version.helper.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const LicenceSupplementaryYearHelper = require('../../../support/helpers/licence-supplementary-year.helper.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')
const ReviewChargeElementHelper = require('../../../support/helpers/review-charge-element.helper.js')
const ReviewChargeReferenceHelper = require('../../../support/helpers/review-charge-reference.helper.js')
const ReviewChargeVersionHelper = require('../../../support/helpers/review-charge-version.helper.js')
const ReviewLicenceHelper = require('../../../support/helpers/review-licence.helper.js')

// Things we need to stub
const FetchNonChargeableBillingAccountsService = require('../../../../app/services/bill-runs/tpt-supplementary/fetch-non-chargeable-billing-accounts.service.js')

// Thing under test
const FetchBillingAccountsService = require('../../../../app/services/bill-runs/tpt-supplementary/fetch-billing-accounts.service.js')

// NOTE: These are declared outside the describe to make them accessible to our `_cleanUp()` function
let billRun
let billingAccount
let billingAccountNotInBillRun
let licence
let licenceSupplementaryYear
let nonTptChargeElement
let nonTptChargeReference
let nonTptChargeVersion
let reviewChargeElement
let reviewChargeReference
let reviewChargeVersion
let tptChargeElement
let tptChargeReference
let tptChargeVersion

describe('Bill Runs - TPT Supplementary - Fetch Billing Accounts service', () => {
  const billingPeriod = {
    startDate: new Date('2023-04-01'),
    endDate: new Date('2024-03-31')
  }

  let chargeCategory
  let fetchNonChargeableBillingAccountsStub
  let nonChargeableMergedBillingAccount
  let nonChargeableNewBillingAccount
  let region

  before(async () => {
    region = RegionHelper.select()
    chargeCategory = ChargeCategoryHelper.select()

    const financialYear = billingPeriod.endDate.getFullYear()
    billRun = await BillRunHelper.add({
      batchType: 'two_part_supplementary',
      fromFinancialYearEnding: financialYear,
      regionId: region.id,
      toFinancialYearEnding: financialYear
    })

    licence = await LicenceHelper.add({ regionId: region.id })

    licenceSupplementaryYear = await LicenceSupplementaryYearHelper.add({
      billRunId: billRun.id,
      licenceId: licence.id
    })

    billingAccount = await BillingAccountHelper.add()
    billingAccountNotInBillRun = await BillingAccountHelper.add()

    // First create a two-part tariff charge version linked to the licence. If at least one charge version is TPT in the
    // bill run, then the bill run would have gone through the match and allocate stage, and that charge version will
    // have `review_charge_[]` records linked to it.
    tptChargeVersion = await ChargeVersionHelper.add({
      billingAccountId: billingAccount.id,
      endDate: new Date('2023-09-30'),
      licenceId: licence.id,
      licenceRef: licence.licenceRef,
      startDate: new Date('2023-04-01')
    })

    tptChargeReference = await ChargeReferenceHelper.add({
      adjustments: { s126: null, s127: true, s130: false, charge: null, winter: false, aggregate: 0.562114443 },
      chargeVersionId: tptChargeVersion.id,
      chargeCategoryId: chargeCategory.id
    })

    tptChargeElement = await ChargeElementHelper.add({ chargeReferenceId: tptChargeReference.id })

    const reviewLicence = await ReviewLicenceHelper.add({ billRunId: billRun.id, licenceId: licence.id })

    reviewChargeVersion = await ReviewChargeVersionHelper.add({
      chargeVersionId: tptChargeVersion.id,
      reviewLicenceId: reviewLicence.id
    })

    reviewChargeReference = await ReviewChargeReferenceHelper.add({
      chargeReferenceId: tptChargeReference.id,
      reviewChargeVersionId: reviewChargeVersion.id
    })

    reviewChargeElement = await ReviewChargeElementHelper.add({
      chargeElementId: tptChargeElement.id,
      reviewChargeReferenceId: reviewChargeReference.id
    })

    // Then we create a non-two-part tariff charge version. This replicates a licence that has been made non-chargeable,
    // and the change was made in the past i.e. we've already generated bills for the licence and now someone has made
    // it to be non-chargeable for part of the period billed (hence we created an applicable TPT charge version for the
    // part that still is billable!) We're simulating both states on a single licence which can happen. But the service
    // also handles licences where only one of these scenarios applies.
    nonTptChargeVersion = await ChargeVersionHelper.add({
      billingAccountId: billingAccount.id,
      endDate: null,
      licenceId: licence.id,
      licenceRef: licence.licenceRef,
      startDate: new Date('2023-10-01')
    })

    nonTptChargeReference = await ChargeReferenceHelper.add({
      chargeVersionId: nonTptChargeVersion.id,
      chargeCategoryId: chargeCategory.id
    })

    nonTptChargeElement = await ChargeElementHelper.add({ chargeReferenceId: nonTptChargeReference.id })
  })

  beforeEach(() => {
    fetchNonChargeableBillingAccountsStub = Sinon.stub(FetchNonChargeableBillingAccountsService, 'go')
  })

  after(async () => {
    await _cleanUp()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when there are billing accounts that are linked to the bill run', () => {
    beforeEach(() => {
      fetchNonChargeableBillingAccountsStub.resolves([])
    })

    it('returns the applicable billing accounts', async () => {
      const results = await FetchBillingAccountsService.go(billRun.id, billingPeriod)

      expect(results).to.have.length(1)

      expect(results[0].id).to.equal(billingAccount.id)
      expect(results[0].accountNumber).to.equal(billingAccount.accountNumber)
    })

    describe('and each billing account', () => {
      describe('for the charge versions property', () => {
        it('returns the applicable charge versions', async () => {
          const results = await FetchBillingAccountsService.go(billRun.id, billingPeriod)

          const [tptChargeVersionResult, nonTptChargeVersionResult] = results[0].chargeVersions

          expect(tptChargeVersionResult.id).to.equal(tptChargeVersion.id)
          expect(tptChargeVersionResult.scheme).to.equal('sroc')
          expect(tptChargeVersionResult.startDate).to.equal(new Date('2023-04-01'))
          expect(tptChargeVersionResult.endDate).to.equal(new Date('2023-09-30'))
          expect(tptChargeVersionResult.billingAccountId).to.equal(billingAccount.id)
          expect(tptChargeVersionResult.status).to.equal('current')

          expect(nonTptChargeVersionResult.id).to.equal(nonTptChargeVersion.id)
          expect(nonTptChargeVersionResult.scheme).to.equal('sroc')
          expect(nonTptChargeVersionResult.startDate).to.equal(new Date('2023-10-01'))
          expect(nonTptChargeVersionResult.endDate).to.be.null()
          expect(nonTptChargeVersionResult.billingAccountId).to.equal(billingAccount.id)
          expect(nonTptChargeVersionResult.status).to.equal('current')
        })
      })

      describe('and against each charge version', () => {
        it('includes the licence', async () => {
          const results = await FetchBillingAccountsService.go(billRun.id, billingPeriod)

          let licence = results[0].chargeVersions[0].licence

          expect(licence.id).to.equal(licence.id)
          expect(licence.licenceRef).to.equal(licence.licenceRef)
          expect(licence.waterUndertaker).to.equal(false)
          expect(licence.historicalAreaCode).to.equal('SAAR')
          expect(licence.regionalChargeArea).to.equal('Southern')
          expect(licence.region).to.equal({
            id: region.id,
            chargeRegionId: region.chargeRegionId
          })

          licence = results[0].chargeVersions[1].licence

          expect(licence.id).to.equal(licence.id)
          expect(licence.licenceRef).to.equal(licence.licenceRef)
          expect(licence.waterUndertaker).to.equal(false)
          expect(licence.historicalAreaCode).to.equal('SAAR')
          expect(licence.regionalChargeArea).to.equal('Southern')
          expect(licence.region).to.equal({
            id: region.id,
            chargeRegionId: region.chargeRegionId
          })
        })

        describe('and when the charge version is two-part tariff (been through match & allocate)', () => {
          it('includes the applicable charge references', async () => {
            const results = await FetchBillingAccountsService.go(billRun.id, billingPeriod)

            const { chargeReferences } = results[0].chargeVersions[0]

            expect(chargeReferences[0].id).to.equal(tptChargeReference.id)
            expect(chargeReferences[0].source).to.equal('non-tidal')
            expect(chargeReferences[0].loss).to.equal('low')
            expect(chargeReferences[0].volume).to.equal(6.819)
            expect(chargeReferences[0].adjustments).to.equal({
              s126: null,
              s127: true,
              s130: false,
              charge: null,
              winter: false,
              aggregate: 0.562114443
            })
            expect(chargeReferences[0].additionalCharges).to.equal({ isSupplyPublicWater: true })
            expect(chargeReferences[0].description).to.equal('Mineral washing')
          })

          describe('and against each charge reference', () => {
            it('includes the charge category', async () => {
              const results = await FetchBillingAccountsService.go(billRun.id, billingPeriod)

              const { chargeCategory: result } = results[0].chargeVersions[0].chargeReferences[0]

              expect(result.id).to.equal(chargeCategory.id)
              expect(result.reference).to.equal(chargeCategory.reference)
              expect(result.shortDescription).to.equal(chargeCategory.shortDescription)
            })

            it('includes the review charge references', async () => {
              const results = await FetchBillingAccountsService.go(billRun.id, billingPeriod)

              const { reviewChargeReferences: result } = results[0].chargeVersions[0].chargeReferences[0]

              expect(result[0].id).to.equal(reviewChargeReference.id)
              expect(result[0].amendedAggregate).to.equal(reviewChargeReference.amendedAggregate)
              expect(result[0].amendedChargeAdjustment).to.equal(reviewChargeReference.amendedChargeAdjustment)
              expect(result[0].amendedAuthorisedVolume).to.equal(reviewChargeReference.amendedAuthorisedVolume)
            })

            it('includes the charge elements', async () => {
              const results = await FetchBillingAccountsService.go(billRun.id, billingPeriod)

              const { chargeElements: result } = results[0].chargeVersions[0].chargeReferences[0]

              expect(result[0].id).to.equal(tptChargeElement.id)
              expect(result[0].abstractionPeriodStartDay).to.equal(tptChargeElement.abstractionPeriodStartDay)
              expect(result[0].abstractionPeriodStartMonth).to.equal(tptChargeElement.abstractionPeriodStartMonth)
              expect(result[0].abstractionPeriodEndDay).to.equal(tptChargeElement.abstractionPeriodEndDay)
              expect(result[0].abstractionPeriodEndMonth).to.equal(tptChargeElement.abstractionPeriodEndMonth)
            })

            describe('and against each charge element', () => {
              it('includes the review charge elements', async () => {
                const results = await FetchBillingAccountsService.go(billRun.id, billingPeriod)

                const { reviewChargeElements: result } =
                  results[0].chargeVersions[0].chargeReferences[0].chargeElements[0]

                expect(result[0].id).to.equal(reviewChargeElement.id)
                expect(result[0].amendedAllocated).to.equal(reviewChargeElement.amendedAllocated)
              })
            })
          })
        })

        describe('and when the charge version is not two-part tariff (not been through match & allocate)', () => {
          it('does not include any charge references', async () => {
            const results = await FetchBillingAccountsService.go(billRun.id, billingPeriod)

            const { chargeReferences } = results[0].chargeVersions[1]

            expect(chargeReferences).to.be.empty()
          })
        })
      })
    })
  })

  describe('when there is a billing account linked to the bill run which has non-chargeable licences', () => {
    describe('as well as chargeable licences (billing account found by both services)', () => {
      beforeEach(() => {
        nonChargeableMergedBillingAccount = {
          id: billingAccount.id,
          accountNumber: BillingAccountHelper.generateAccountNumber(),
          chargeVersions: [
            {
              chargeReferences: [],
              licence: {
                id: '830d16ad-6e82-45b4-8cfd-e32d549920f8',
                licenceRef: LicenceHelper.generateLicenceRef(),
                historicalAreaCode: 'SE',
                regionalChargeArea: 'Wales',
                region: { chargeRegionId: 'W' }
              }
            }
          ]
        }

        fetchNonChargeableBillingAccountsStub.resolves([nonChargeableMergedBillingAccount])
      })

      it('merges the billing account record into one result', async () => {
        const results = await FetchBillingAccountsService.go(billRun.id, billingPeriod)

        expect(results).to.have.length(1)

        expect(results[0].id).to.equal(billingAccount.id)
        expect(results[0].accountNumber).to.equal(billingAccount.accountNumber)

        expect(results[0].chargeVersions).to.have.length(3)

        // The TPT charge version
        expect(results[0].chargeVersions[0].id).to.equal(tptChargeVersion.id)
        expect(results[0].chargeVersions[0].licence.id).to.equal(licence.id)
        expect(results[0].chargeVersions[0].licence.licenceRef).to.equal(licence.licenceRef)

        // The non-TPT charge version
        expect(results[0].chargeVersions[1].id).to.equal(nonTptChargeVersion.id)
        expect(results[0].chargeVersions[1].licence.id).to.equal(licence.id)
        expect(results[0].chargeVersions[1].licence.licenceRef).to.equal(licence.licenceRef)

        // The non-chargeable charge version
        expect(results[0].chargeVersions[2].licence.id).to.equal(
          nonChargeableMergedBillingAccount.chargeVersions[0].licence.id
        )
        expect(results[0].chargeVersions[2].licence.licenceRef).to.equal(
          nonChargeableMergedBillingAccount.chargeVersions[0].licence.licenceRef
        )
      })
    })

    describe('but no chargeable licences (billing account only found by FetchNonChargeableBillingAccounts)', () => {
      beforeEach(() => {
        nonChargeableNewBillingAccount = {
          id: '3ce59018-02ad-4d5f-851f-3e5eead68f66',
          accountNumber: BillingAccountHelper.generateAccountNumber(),
          chargeVersions: [
            {
              chargeReferences: [],
              licence: {
                id: 'f03b7c0f-778a-454b-a20e-9449305abe90',
                licenceRef: LicenceHelper.generateLicenceRef(),
                historicalAreaCode: 'SE',
                regionalChargeArea: 'Wales',
                region: { chargeRegionId: 'W' }
              }
            }
          ]
        }

        fetchNonChargeableBillingAccountsStub.resolves([nonChargeableNewBillingAccount])
      })

      it('adds the billing account record to the results', async () => {
        const results = await FetchBillingAccountsService.go(billRun.id, billingPeriod)

        expect(results).to.have.length(2)

        // Billing account found by this service
        expect(results[0].id).to.equal(billingAccount.id)
        expect(results[0].accountNumber).to.equal(billingAccount.accountNumber)

        expect(results[0].chargeVersions).to.have.length(2)

        // The TPT charge version
        expect(results[0].chargeVersions[0].id).to.equal(tptChargeVersion.id)
        expect(results[0].chargeVersions[0].licence.id).to.equal(licence.id)
        expect(results[0].chargeVersions[0].licence.licenceRef).to.equal(licence.licenceRef)

        // The non-TPT charge version
        expect(results[0].chargeVersions[1].id).to.equal(nonTptChargeVersion.id)
        expect(results[0].chargeVersions[1].licence.id).to.equal(licence.id)
        expect(results[0].chargeVersions[1].licence.licenceRef).to.equal(licence.licenceRef)

        // Billing account found by FetchNonChargeableBillingAccounts
        expect(results[1].id).to.equal(nonChargeableNewBillingAccount.id)
        expect(results[1].accountNumber).to.equal(nonChargeableNewBillingAccount.accountNumber)

        expect(results[1].chargeVersions).to.have.length(1)

        expect(results[1].chargeVersions[0].licence.id).to.equal(
          nonChargeableNewBillingAccount.chargeVersions[0].licence.id
        )
        expect(results[1].chargeVersions[0].licence.licenceRef).to.equal(
          nonChargeableNewBillingAccount.chargeVersions[0].licence.licenceRef
        )
      })
    })
  })

  describe('when there are billing accounts not linked to the bill run', () => {
    beforeEach(() => {
      fetchNonChargeableBillingAccountsStub.resolves([])
    })

    it('does not include them in the results', async () => {
      const results = await FetchBillingAccountsService.go(billRun.id, billingPeriod)

      expect(results).to.have.length(1)

      expect(results[0].id).not.to.equal(billingAccountNotInBillRun.id)
    })
  })

  describe('when there are no billing accounts at all (no results)', () => {
    beforeEach(() => {
      fetchNonChargeableBillingAccountsStub.resolves([])
    })

    it('returns no results', async () => {
      const results = await FetchBillingAccountsService.go('1c1f7af5-9cba-47a7-8fc4-2c03b0d1124d', billingPeriod)

      expect(results).to.be.empty()
    })
  })
})

async function _cleanUp() {
  if (billingAccount) await billingAccount.$query().delete()
  if (billingAccountNotInBillRun) await billingAccountNotInBillRun.$query().delete()
  if (nonTptChargeElement) await nonTptChargeElement.$query().delete()
  if (nonTptChargeReference) await nonTptChargeReference.$query().delete()
  if (nonTptChargeVersion) await nonTptChargeVersion.$query().delete()
  if (tptChargeElement) await tptChargeElement.$query().delete()
  if (tptChargeReference) await tptChargeReference.$query().delete()
  if (tptChargeVersion) await tptChargeVersion.$query().delete()
  if (licenceSupplementaryYear) await licenceSupplementaryYear.$query().delete()
  if (licence) await licence.$query().delete()
  if (reviewChargeElement) await reviewChargeElement.$query().delete()
  if (reviewChargeReference) await reviewChargeReference.$query().delete()
  if (reviewChargeVersion) await reviewChargeVersion.$query().delete()
  if (billRun) await billRun.$query().delete()
}
