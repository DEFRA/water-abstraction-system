'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const BillingAccountHelper = require('../../../support/helpers/billing-account.helper.js')
const BillingAccountModel = require('../../../../app/models/billing-account.model.js')
const ChargeCategoryHelper = require('../../../support/helpers/charge-category.helper.js')
const ChargeElementHelper = require('../../../support/helpers/charge-element.helper.js')
const ChargeReferenceHelper = require('../../../support/helpers/charge-reference.helper.js')
const ChargeVersionHelper = require('../../../support/helpers/charge-version.helper.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')
const ReviewChargeElementHelper = require('../../../support/helpers/review-charge-element.helper.js')
const ReviewChargeReferenceHelper = require('../../../support/helpers/review-charge-reference.helper.js')
const ReviewChargeVersionHelper = require('../../../support/helpers/review-charge-version.helper.js')
const ReviewLicenceHelper = require('../../../support/helpers/review-licence.helper.js')

// Thing under test
const FetchBillingAccountsService = require('../../../../app/services/bill-runs/tpt-supplementary/fetch-billing-accounts.service.js')

describe('Bill Runs - TPT Supplementary - Fetch Billing Accounts service', () => {
  let billRun
  let billingAccount
  let billingAccountNotInBillRun
  let chargeCategory
  let chargeElement
  let chargeReference
  let chargeVersion
  let licence
  let region
  let reviewChargeElement
  let reviewChargeReference
  let reviewChargeVersion

  before(async () => {
    region = RegionHelper.select()
    billRun = await BillRunHelper.add({ batchType: 'two_part_supplementary', regionId: region.id })

    licence = await LicenceHelper.add({ regionId: region.id })

    billingAccount = await BillingAccountHelper.add()
    billingAccountNotInBillRun = await BillingAccountHelper.add()

    const reviewLicence = await ReviewLicenceHelper.add({ billRunId: billRun.id, licenceId: licence.id })
    const { id: reviewLicenceId } = reviewLicence

    chargeVersion = await ChargeVersionHelper.add({
      startDate: new Date('2023-11-01'),
      billingAccountId: billingAccount.id,
      licenceId: licence.id,
      licenceRef: licence.licenceRef
    })
    const { id: chargeVersionId } = chargeVersion

    reviewChargeVersion = await ReviewChargeVersionHelper.add({ chargeVersionId, reviewLicenceId })
    const { id: reviewChargeVersionId } = reviewChargeVersion

    chargeCategory = ChargeCategoryHelper.select()
    const { id: chargeCategoryId } = chargeCategory

    chargeReference = await ChargeReferenceHelper.add({ chargeVersionId, chargeCategoryId })
    const { id: chargeReferenceId } = chargeReference

    reviewChargeReference = await ReviewChargeReferenceHelper.add({ chargeReferenceId, reviewChargeVersionId })
    const { id: reviewChargeReferenceId } = reviewChargeReference

    chargeElement = await ChargeElementHelper.add({ chargeReferenceId })
    const { id: chargeElementId } = chargeElement

    reviewChargeElement = await ReviewChargeElementHelper.add({ chargeElementId, reviewChargeReferenceId })
  })

  describe('when there are billing accounts that are linked to a TPT supplementary bill run', () => {
    it('returns the applicable billing accounts', async () => {
      const results = await FetchBillingAccountsService.go(billRun.id)

      expect(results).to.have.length(1)

      expect(results[0]).to.be.instanceOf(BillingAccountModel)
      expect(results[0].id).to.equal(billingAccount.id)
      expect(results[0].accountNumber).to.equal(billingAccount.accountNumber)
    })

    describe('and each billing account', () => {
      describe('for the charge versions property', () => {
        it('returns the applicable charge versions', async () => {
          const results = await FetchBillingAccountsService.go(billRun.id)

          const { chargeVersions } = results[0]

          expect(chargeVersions[0].id).to.equal(chargeVersion.id)
          expect(chargeVersions[0].scheme).to.equal('sroc')
          expect(chargeVersions[0].startDate).to.equal(new Date('2023-11-01'))
          expect(chargeVersions[0].endDate).to.be.null()
          expect(chargeVersions[0].billingAccountId).to.equal(billingAccount.id)
          expect(chargeVersions[0].status).to.equal('current')
        })

        describe('and against each charge version', () => {
          it('includes the licence', async () => {
            const results = await FetchBillingAccountsService.go(billRun.id)

            const { licence } = results[0].chargeVersions[0]

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

          it('includes the applicable charge references', async () => {
            const results = await FetchBillingAccountsService.go(billRun.id)

            const { chargeReferences } = results[0].chargeVersions[0]

            expect(chargeReferences[0].id).to.equal(chargeReference.id)
            expect(chargeReferences[0].source).to.equal('non-tidal')
            expect(chargeReferences[0].loss).to.equal('low')
            expect(chargeReferences[0].volume).to.equal(6.819)
            expect(chargeReferences[0].adjustments).to.equal({
              s126: null,
              s127: false,
              s130: false,
              charge: null,
              winter: false,
              aggregate: '0.562114443'
            })
            expect(chargeReferences[0].additionalCharges).to.equal({ isSupplyPublicWater: true })
            expect(chargeReferences[0].description).to.equal('Mineral washing')
          })

          describe('and against each charge reference', () => {
            it('includes the charge category', async () => {
              const results = await FetchBillingAccountsService.go(billRun.id)

              const { chargeCategory: result } = results[0].chargeVersions[0].chargeReferences[0]

              expect(result.id).to.equal(chargeCategory.id)
              expect(result.reference).to.equal(chargeCategory.reference)
              expect(result.shortDescription).to.equal(chargeCategory.shortDescription)
            })

            it('includes the review charge references', async () => {
              const results = await FetchBillingAccountsService.go(billRun.id)

              const { reviewChargeReferences: result } = results[0].chargeVersions[0].chargeReferences[0]

              expect(result[0].id).to.equal(reviewChargeReference.id)
              expect(result[0].amendedAggregate).to.equal(reviewChargeReference.amendedAggregate)
              expect(result[0].amendedChargeAdjustment).to.equal(reviewChargeReference.amendedChargeAdjustment)
              expect(result[0].amendedAuthorisedVolume).to.equal(reviewChargeReference.amendedAuthorisedVolume)
            })

            it('includes the charge elements', async () => {
              const results = await FetchBillingAccountsService.go(billRun.id)

              const { chargeElements: result } = results[0].chargeVersions[0].chargeReferences[0]

              expect(result[0].id).to.equal(chargeElement.id)
              expect(result[0].abstractionPeriodStartDay).to.equal(chargeElement.abstractionPeriodStartDay)
              expect(result[0].abstractionPeriodStartMonth).to.equal(chargeElement.abstractionPeriodStartMonth)
              expect(result[0].abstractionPeriodEndDay).to.equal(chargeElement.abstractionPeriodEndDay)
              expect(result[0].abstractionPeriodEndMonth).to.equal(chargeElement.abstractionPeriodEndMonth)
            })

            describe('and against each charge element', () => {
              it('includes the review charge elements', async () => {
                const results = await FetchBillingAccountsService.go(billRun.id)

                const { reviewChargeElements: result } =
                  results[0].chargeVersions[0].chargeReferences[0].chargeElements[0]

                expect(result[0].id).to.equal(reviewChargeElement.id)
                expect(result[0].amendedAllocated).to.equal(reviewChargeElement.amendedAllocated)
              })
            })
          })
        })
      })
    })
  })

  describe('when there are billing accounts not linked to a TPT supplementary bill run', () => {
    it('does not include them in the results', async () => {
      const results = await FetchBillingAccountsService.go(billRun.id)

      expect(results).to.have.length(1)

      expect(results[0]).to.be.instanceOf(BillingAccountModel)
      expect(results[0].id).not.to.equal(billingAccountNotInBillRun.id)
    })
  })

  describe('when there are no billing accounts at all (no results)', () => {
    it('returns no results', async () => {
      const results = await FetchBillingAccountsService.go('1c1f7af5-9cba-47a7-8fc4-2c03b0d1124d')

      expect(results).to.be.empty()
    })
  })
})
