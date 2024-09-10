'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const ChargeCategoryHelper = require('../../../support/helpers/charge-category.helper.js')
const ChargeElementHelper = require('../../../support/helpers/charge-element.helper.js')
const ChargeReferenceHelper = require('../../../support/helpers/charge-reference.helper.js')
const ChargeVersionHelper = require('../../../support/helpers/charge-version.helper.js')
const DatabaseSupport = require('../../../support/database.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const PurposeHelper = require('../../../support/helpers/purpose.helper.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')
const ReturnLogHelper = require('../../../support/helpers/return-log.helper.js')
const ReviewChargeElementHelper = require('../../../support/helpers/review-charge-element.helper.js')
const ReviewChargeElementReturnHelper = require('../../../support/helpers/review-charge-element-return.helper.js')
const ReviewChargeReferenceHelper = require('../../../support/helpers/review-charge-reference.helper.js')
const ReviewChargeVersionHelper = require('../../../support/helpers/review-charge-version.helper.js')
const ReviewLicenceHelper = require('../../../support/helpers/review-licence.helper.js')
const ReviewReturnHelper = require('../../../support/helpers/review-return.helper.js')

// Things we need to stub
const FetchBillingAccountService = require('../../../../app/services/fetch-billing-account.service.js')

// Thing under test
const FetchReviewLicenceResultsService = require('../../../../app/services/bill-runs/two-part-tariff/fetch-review-licence-results.service.js')

describe('Fetch Review Licence Results Service', () => {
  let billRun
  let region

  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when there is a valid bill run', () => {
    beforeEach(async () => {
      region = RegionHelper.select()
      billRun = await BillRunHelper.add({ regionId: region.id, batchType: 'two_part_tariff' })
    })

    describe('and a valid licence that is included in the bill run', () => {
      let licence
      let reviewLicence
      let chargeVersion
      let reviewChargeVersion
      let chargeReference
      let reviewChargeReference
      let chargeElement
      let reviewChargeElement
      let returnLog
      let reviewReturn
      let purpose
      let chargeCategory

      beforeEach(async () => {
        licence = await LicenceHelper.add()
        reviewLicence = await ReviewLicenceHelper.add({ licenceId: licence.id, billRunId: billRun.id })

        chargeVersion = await ChargeVersionHelper.add({ licenceId: licence.id, licenceRef: licence.licenceRef })
        reviewChargeVersion = await ReviewChargeVersionHelper.add({
          reviewLicenceId: reviewLicence.id,
          chargeVersionId: chargeVersion.id
        })

        chargeCategory = ChargeCategoryHelper.select()
        chargeReference = await ChargeReferenceHelper.add({
          chargeVersionId: chargeVersion.id,
          chargeCategoryId: chargeCategory.id
        })
        reviewChargeReference = await ReviewChargeReferenceHelper.add({
          reviewChargeVersionId: reviewChargeVersion.id,
          chargeReferenceId: chargeReference.id
        })

        purpose = PurposeHelper.select()
        chargeElement = await ChargeElementHelper.add({ chargeReferenceId: chargeReference.id, purposeId: purpose.id })
        reviewChargeElement = await ReviewChargeElementHelper.add({
          reviewChargeReferenceId: reviewChargeReference.id,
          chargeElementId: chargeElement.id
        })

        const metadata = {
          nald: {
            periodEndDay: 30,
            periodEndMonth: 9,
            periodStartDay: 1,
            periodStartMonth: 4
          }
        }

        returnLog = await ReturnLogHelper.add({ licenceRef: licence.licenceRef, metadata })
        reviewReturn = await ReviewReturnHelper.add({ returnId: returnLog.id, reviewLicenceId: reviewLicence.id })

        await ReviewChargeElementReturnHelper.add({
          reviewChargeElementId: reviewChargeElement.id,
          reviewReturnId: reviewReturn.id
        })

        Sinon.stub(FetchBillingAccountService, 'go').resolves([])
      })

      it('returns details of the bill run', async () => {
        const result = await FetchReviewLicenceResultsService.go(billRun.id, licence.id)

        expect(result.billRun).to.equal({
          id: billRun.id,
          fromFinancialYearEnding: 2023,
          toFinancialYearEnding: 2023,
          region: {
            displayName: region.displayName
          }
        })
      })

      it('returns the licence review data', async () => {
        const result = await FetchReviewLicenceResultsService.go(billRun.id, licence.id)

        expect(result.licence).to.equal([{
          id: reviewLicence.id,
          billRunId: billRun.id,
          licenceId: licence.id,
          licenceRef: reviewLicence.licenceRef,
          licenceHolder: reviewLicence.licenceHolder,
          issues: reviewLicence.issues,
          status: reviewLicence.status,
          progress: false,
          hasReviewStatus: false,
          reviewReturns: [{
            id: reviewReturn.id,
            reviewLicenceId: reviewReturn.reviewLicenceId,
            returnId: reviewReturn.returnId,
            returnReference: reviewReturn.returnReference,
            quantity: reviewReturn.quantity,
            allocated: reviewReturn.allocated,
            underQuery: reviewReturn.underQuery,
            returnStatus: reviewReturn.returnStatus,
            nilReturn: reviewReturn.nilReturn,
            abstractionOutsidePeriod: reviewReturn.abstractionOutsidePeriod,
            receivedDate: reviewReturn.receivedDate,
            dueDate: reviewReturn.dueDate,
            purposes: reviewReturn.purposes,
            description: reviewReturn.description,
            startDate: reviewReturn.startDate,
            endDate: reviewReturn.endDate,
            issues: reviewReturn.issues,
            createdAt: reviewReturn.createdAt,
            updatedAt: reviewReturn.updatedAt,
            reviewChargeElements: [{
              id: reviewChargeElement.id,
              reviewChargeReferenceId: reviewChargeElement.reviewChargeReferenceId,
              chargeElementId: reviewChargeElement.chargeElementId,
              allocated: reviewChargeElement.allocated,
              amendedAllocated: reviewChargeElement.amendedAllocated,
              chargeDatesOverlap: reviewChargeElement.chargeDatesOverlap,
              issues: reviewChargeElement.issues,
              status: reviewChargeElement.status,
              createdAt: reviewChargeElement.createdAt,
              updatedAt: reviewChargeElement.updatedAt
            }],
            returnLog: {
              periodEndDay: returnLog.metadata.nald.periodEndDay,
              periodEndMonth: returnLog.metadata.nald.periodEndMonth,
              periodStartDay: returnLog.metadata.nald.periodStartDay,
              periodStartMonth: returnLog.metadata.nald.periodStartMonth
            }
          }],
          reviewChargeVersions: [{
            id: reviewChargeVersion.id,
            reviewLicenceId: reviewLicence.id,
            chargeVersionId: chargeVersion.id,
            changeReason: reviewChargeVersion.changeReason,
            chargePeriodStartDate: reviewChargeVersion.chargePeriodStartDate,
            chargePeriodEndDate: reviewChargeVersion.chargePeriodEndDate,
            createdAt: reviewChargeVersion.createdAt,
            updatedAt: reviewChargeVersion.updatedAt,
            reviewChargeReferences: [{
              id: reviewChargeReference.id,
              reviewChargeVersionId: reviewChargeVersion.id,
              chargeReferenceId: reviewChargeReference.chargeReferenceId,
              aggregate: reviewChargeReference.aggregate,
              amendedAggregate: reviewChargeReference.amendedAggregate,
              chargeAdjustment: reviewChargeReference.chargeAdjustment,
              amendedChargeAdjustment: reviewChargeReference.amendedChargeAdjustment,
              canalAndRiverTrustAgreement: reviewChargeReference.canalAndRiverTrustAgreement,
              abatementAgreement: reviewChargeReference.abatementAgreement,
              winterDiscount: reviewChargeReference.winterDiscount,
              twoPartTariffAgreement: reviewChargeReference.twoPartTariffAgreement,
              authorisedVolume: reviewChargeReference.authorisedVolume,
              amendedAuthorisedVolume: reviewChargeReference.amendedAuthorisedVolume,
              createdAt: reviewChargeReference.createdAt,
              updatedAt: reviewChargeReference.updatedAt,
              chargeReference: {
                chargeCategoryId: chargeReference.chargeCategoryId,
                chargeCategory: {
                  reference: chargeCategory.reference,
                  shortDescription: chargeCategory.shortDescription
                }
              },
              reviewChargeElements: [{
                id: reviewChargeElement.id,
                reviewChargeReferenceId: reviewChargeElement.reviewChargeReferenceId,
                chargeElementId: reviewChargeElement.chargeElementId,
                allocated: reviewChargeElement.allocated,
                amendedAllocated: reviewChargeElement.amendedAllocated,
                chargeDatesOverlap: reviewChargeElement.chargeDatesOverlap,
                issues: reviewChargeElement.issues,
                status: reviewChargeElement.status,
                createdAt: reviewChargeElement.createdAt,
                updatedAt: reviewChargeElement.updatedAt,
                chargeElement: {
                  description: chargeElement.description,
                  abstractionPeriodStartDay: chargeElement.abstractionPeriodStartDay,
                  abstractionPeriodStartMonth: chargeElement.abstractionPeriodStartMonth,
                  abstractionPeriodEndDay: chargeElement.abstractionPeriodEndDay,
                  abstractionPeriodEndMonth: chargeElement.abstractionPeriodEndMonth,
                  authorisedAnnualQuantity: chargeElement.authorisedAnnualQuantity,
                  purpose: {
                    description: purpose.description
                  }
                },
                reviewReturns: [{
                  id: reviewReturn.id,
                  reviewLicenceId: reviewReturn.reviewLicenceId,
                  returnId: reviewReturn.returnId,
                  returnReference: reviewReturn.returnReference,
                  quantity: reviewReturn.quantity,
                  allocated: reviewReturn.allocated,
                  underQuery: reviewReturn.underQuery,
                  returnStatus: reviewReturn.returnStatus,
                  nilReturn: reviewReturn.nilReturn,
                  abstractionOutsidePeriod: reviewReturn.abstractionOutsidePeriod,
                  receivedDate: reviewReturn.receivedDate,
                  dueDate: reviewReturn.dueDate,
                  purposes: reviewReturn.purposes,
                  description: reviewReturn.description,
                  startDate: reviewReturn.startDate,
                  endDate: reviewReturn.endDate,
                  issues: reviewReturn.issues,
                  createdAt: reviewReturn.createdAt,
                  updatedAt: reviewReturn.updatedAt
                }]
              }]
            }],
            chargeVersion: {
              billingAccountId: chargeVersion.billingAccountId
            },
            billingAccountDetails: []
          }]
        }])
      })
    })
  })
})
