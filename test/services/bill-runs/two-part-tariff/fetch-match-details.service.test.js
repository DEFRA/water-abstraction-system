'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const ChargeElementHelper = require('../../../support/helpers/charge-element.helper.js')
const ChargeReferenceHelper = require('../../../support/helpers/charge-reference.helper.js')
const ReturnLogHelper = require('../../../support/helpers/return-log.helper.js')
const ReviewChargeElementHelper = require('../../../support/helpers/review-charge-element.helper.js')
const ReviewChargeElementReturnHelper = require('../../../support/helpers/review-charge-element-return.helper.js')
const ReviewChargeReferenceHelper = require('../../../support/helpers/review-charge-reference.helper.js')
const ReviewChargeVersionHelper = require('../../../support/helpers/review-charge-version.helper.js')
const ReviewReturnHelper = require('../../../support/helpers/review-return.helper.js')

// Thing under test
const FetchMatchDetailsService = require('../../../../app/services/bill-runs/two-part-tariff/fetch-match-details.service.js')

describe('Fetch Match Details service', () => {
  afterEach(() => {
    Sinon.restore()
  })

  describe('when there is a valid bill run', () => {
    let billRun

    beforeEach(async () => {
      billRun = await BillRunHelper.add()
    })

    describe('and a valid review charge element', () => {
      let reviewChargeElement
      let chargeElement
      let chargeReference
      let reviewChargeVersion
      let reviewChargeReference
      let returnLog

      beforeEach(async () => {
        reviewChargeVersion = await ReviewChargeVersionHelper.add()
        chargeReference = await ChargeReferenceHelper.add()
        reviewChargeReference = await ReviewChargeReferenceHelper.add(
          { reviewChargeVersionId: reviewChargeVersion.id, chargeReferenceId: chargeReference.id }
        )

        chargeElement = await ChargeElementHelper.add({ chargeReferenceId: reviewChargeReference.chargeReferenceId })
        reviewChargeElement = await ReviewChargeElementHelper.add(
          { reviewChargeReferenceId: reviewChargeReference.id, chargeElementId: chargeElement.id }
        )
      })

      describe('that has a matching return', () => {
        let reviewReturn

        beforeEach(async () => {
          const metadata = {
            nald: {
              periodEndDay: 30,
              periodEndMonth: 9,
              periodStartDay: 1,
              periodStartMonth: 4
            }
          }

          returnLog = await ReturnLogHelper.add({ metadata })
          reviewReturn = await ReviewReturnHelper.add({ returnId: returnLog.id })

          await ReviewChargeElementReturnHelper.add({
            reviewChargeElementId: reviewChargeElement.id,
            reviewReturnId: reviewReturn.id
          })
        })

        it('returns details of the bill run', async () => {
          const result = await FetchMatchDetailsService.go(billRun.id, reviewChargeElement.id)

          expect(result.billRun).to.equal({
            id: billRun.id,
            fromFinancialYearEnding: billRun.fromFinancialYearEnding,
            toFinancialYearEnding: billRun.toFinancialYearEnding
          })
        })

        it('returns details of the charge element and its matched returns', async () => {
          const result = await FetchMatchDetailsService.go(billRun.id, reviewChargeElement.id)

          expect(result.reviewChargeElement).to.equal({
            id: reviewChargeElement.id,
            reviewChargeReferenceId: reviewChargeReference.id,
            chargeElementId: chargeElement.id,
            allocated: reviewChargeElement.allocated,
            amendedAllocated: reviewChargeElement.amendedAllocated,
            chargeDatesOverlap: reviewChargeElement.chargeDatesOverlap,
            issues: reviewChargeElement.issues,
            status: reviewChargeElement.status,
            createdAt: reviewChargeElement.createdAt,
            updatedAt: reviewChargeElement.updatedAt,
            reviewReturns: [
              {
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
                purposes: {},
                description: reviewReturn.description,
                startDate: reviewReturn.startDate,
                endDate: reviewReturn.endDate,
                issues: reviewReturn.issues,
                createdAt: reviewReturn.createdAt,
                updatedAt: reviewReturn.updatedAt,
                returnLog: {
                  periodEndDay: returnLog.metadata.nald.periodEndDay,
                  periodEndMonth: returnLog.metadata.nald.periodEndMonth,
                  periodStartDay: returnLog.metadata.nald.periodStartDay,
                  periodStartMonth: returnLog.metadata.nald.periodStartMonth
                }
              }
            ],
            chargeElement: {
              description: chargeElement.description,
              abstractionPeriodStartDay: chargeElement.abstractionPeriodStartDay,
              abstractionPeriodStartMonth: chargeElement.abstractionPeriodStartMonth,
              abstractionPeriodEndDay: chargeElement.abstractionPeriodEndDay,
              abstractionPeriodEndMonth: chargeElement.abstractionPeriodEndMonth,
              authorisedAnnualQuantity: chargeElement.authorisedAnnualQuantity
            },
            reviewChargeReference: {
              id: reviewChargeReference.id,
              amendedAuthorisedVolume: reviewChargeReference.amendedAuthorisedVolume,
              reviewChargeVersion: {
                chargePeriodStartDate: reviewChargeVersion.chargePeriodStartDate,
                chargePeriodEndDate: reviewChargeVersion.chargePeriodEndDate
              }
            }
          })
        })
      })

      describe('with a charge element that did not match to a return', () => {
        it('does not return any matching return details', async () => {
          const result = await FetchMatchDetailsService.go(billRun.id, reviewChargeElement.id)

          expect(result.reviewChargeElement).to.equal({
            id: reviewChargeElement.id,
            reviewChargeReferenceId: reviewChargeReference.id,
            chargeElementId: chargeElement.id,
            allocated: reviewChargeElement.allocated,
            amendedAllocated: reviewChargeElement.amendedAllocated,
            chargeDatesOverlap: reviewChargeElement.chargeDatesOverlap,
            issues: reviewChargeElement.issues,
            status: reviewChargeElement.status,
            createdAt: reviewChargeElement.createdAt,
            updatedAt: reviewChargeElement.updatedAt,
            reviewReturns: [],
            chargeElement: {
              description: chargeElement.description,
              abstractionPeriodStartDay: chargeElement.abstractionPeriodStartDay,
              abstractionPeriodStartMonth: chargeElement.abstractionPeriodStartMonth,
              abstractionPeriodEndDay: chargeElement.abstractionPeriodEndDay,
              abstractionPeriodEndMonth: chargeElement.abstractionPeriodEndMonth,
              authorisedAnnualQuantity: chargeElement.authorisedAnnualQuantity
            },
            reviewChargeReference: {
              id: reviewChargeReference.id,
              amendedAuthorisedVolume: reviewChargeReference.amendedAuthorisedVolume,
              reviewChargeVersion: {
                chargePeriodStartDate: reviewChargeVersion.chargePeriodStartDate,
                chargePeriodEndDate: reviewChargeVersion.chargePeriodEndDate
              }
            }
          })
        })
      })
    })
  })
})
