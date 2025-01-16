'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ReturnLogHelper = require('../../../support/helpers/return-log.helper.js')

// Things we need to stub
const FeatureFlagsConfig = require('../../../../config/feature-flags.config.js')

// Thing under test
const BaseReviewPresenter = require('../../../../app/presenters/bill-runs/review/base-review.presenter.js')

describe('Bill Runs Review - Base Review presenter', () => {
  beforeEach(() => {
    Sinon.stub(FeatureFlagsConfig, 'enableSystemReturnsView').value(true)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('#calculateTotalBillableReturns()', () => {
    const reviewChargeElements = [
      { amendedAllocated: 11.513736 },
      { amendedAllocated: 1.92708 },
      { amendedAllocated: 23.022753 },
      { amendedAllocated: 0.636794 },
      { amendedAllocated: 26.400139 }
    ]

    it('returns the sum of "amendedAllocated" for the review charge elements passed in', () => {
      const result = BaseReviewPresenter.calculateTotalBillableReturns(reviewChargeElements)

      expect(result).to.equal(63.500502)
    })
  })

  describe('#determineReturnLink()', () => {
    const returnId = ReturnLogHelper.generateReturnLogId()

    let reviewReturn

    describe('when the review return has a status of "due"', () => {
      beforeEach(() => {
        reviewReturn = { returnId, returnStatus: 'due' }
      })

      it('returns the link to edit the return', () => {
        const result = BaseReviewPresenter.determineReturnLink(reviewReturn)

        expect(result).to.equal(`/system/return-logs/setup?returnLogId=${returnId}`)
      })
    })

    describe('when the review return has a status of "received"', () => {
      beforeEach(() => {
        reviewReturn = { returnId, returnStatus: 'received' }
      })

      it('returns the link to edit the return', () => {
        const result = BaseReviewPresenter.determineReturnLink(reviewReturn)

        expect(result).to.equal(`/system/return-logs/setup?returnLogId=${returnId}`)
      })
    })

    describe('when the review return has any other status', () => {
      beforeEach(() => {
        reviewReturn = { returnId, returnStatus: 'completed' }
      })

      it('returns the link to view the return', () => {
        const result = BaseReviewPresenter.determineReturnLink(reviewReturn)

        expect(result).to.equal(`/returns/return?id=${returnId}`)
      })
    })
  })

  describe('#formatAdditionalCharges()', () => {
    let chargeReference

    describe('when the charge reference has no additional charges', () => {
      beforeEach(() => {
        chargeReference = { supportedSourceName: null, waterCompanyCharge: null }
      })

      it('returns an empty array', () => {
        const result = BaseReviewPresenter.formatAdditionalCharges(chargeReference)

        expect(result).to.be.empty()
      })
    })

    describe('when the charge reference has a supported source name', () => {
      beforeEach(() => {
        chargeReference = { supportedSourceName: 'Foo source', waterCompanyCharge: null }
      })

      it('returns an array containing the charge formatted for display', () => {
        const result = BaseReviewPresenter.formatAdditionalCharges(chargeReference)

        expect(result).to.equal(['Supported source Foo source'])
      })
    })

    describe('when the charge reference has a water company charge', () => {
      beforeEach(() => {
        chargeReference = { supportedSourceName: null, waterCompanyCharge: true }
      })

      it('returns an array containing the charge formatted for display', () => {
        const result = BaseReviewPresenter.formatAdditionalCharges(chargeReference)

        expect(result).to.equal(['Public Water Supply'])
      })
    })

    describe('when the charge reference has both charges', () => {
      beforeEach(() => {
        chargeReference = { supportedSourceName: 'Foo source', waterCompanyCharge: true }
      })

      it('returns an array containing the charges formatted for display', () => {
        const result = BaseReviewPresenter.formatAdditionalCharges(chargeReference)

        expect(result).to.equal(['Supported source Foo source', 'Public Water Supply'])
      })
    })
  })

  describe('#formatAdjustments()', () => {
    let reviewChargeReference

    describe('when the review charge reference has no adjustments', () => {
      beforeEach(() => {
        reviewChargeReference = {}
      })

      it('returns an empty array', () => {
        const result = BaseReviewPresenter.formatAdjustments(reviewChargeReference)

        expect(result).to.be.empty()
      })
    })

    describe('when the review charge reference has an abatement agreement', () => {
      describe('that is set to a value other than 1', () => {
        beforeEach(() => {
          reviewChargeReference = { abatementAgreement: 0.3 }
        })

        it('includes it in the array returned', () => {
          const result = BaseReviewPresenter.formatAdjustments(reviewChargeReference)

          expect(result).to.include('Abatement agreement (0.3)')
        })
      })

      describe('that is set to 1', () => {
        beforeEach(() => {
          reviewChargeReference = { abatementAgreement: 1 }
        })

        it('does not add include it in the array returned', () => {
          const result = BaseReviewPresenter.formatAdjustments(reviewChargeReference)

          expect(result).to.not.include('Abatement agreement (1)')
        })
      })
    })

    describe('when the review charge reference has a winter discount', () => {
      beforeEach(() => {
        reviewChargeReference = { winterDiscount: true }
      })

      it('includes it in the array returned', () => {
        const result = BaseReviewPresenter.formatAdjustments(reviewChargeReference)

        expect(result).to.include('Winter discount')
      })
    })

    describe('when the review charge reference has a two part tariff agreement', () => {
      beforeEach(() => {
        reviewChargeReference = { twoPartTariffAgreement: true }
      })

      it('includes it in the array returned', () => {
        const result = BaseReviewPresenter.formatAdjustments(reviewChargeReference)

        expect(result).to.include('Two part tariff agreement')
      })
    })

    describe('when the review charge reference has a canal and river trust agreement', () => {
      beforeEach(() => {
        reviewChargeReference = { canalAndRiverTrustAgreement: true }
      })

      it('includes it in the array returned', () => {
        const result = BaseReviewPresenter.formatAdjustments(reviewChargeReference)

        expect(result).to.include('Canal and River trust agreement')
      })
    })
  })

  describe('#formatChargePeriod()', () => {
    const reviewChargeVersion = {
      chargePeriodStartDate: new Date('2024-04-01'),
      chargePeriodEndDate: new Date('2024-09-30')
    }

    it("returns the review charge version's charge period formatted for display", () => {
      const result = BaseReviewPresenter.formatChargePeriod(reviewChargeVersion)

      expect(result).to.equal('1 April 2024 to 30 September 2024')
    })
  })

  describe('#formatChargePeriods()', () => {
    const chargeElement = {
      abstractionPeriodStartDay: 1,
      abstractionPeriodStartMonth: 1,
      abstractionPeriodEndDay: 31,
      abstractionPeriodEndMonth: 12
    }

    let reviewChargeElement

    describe('when no charge period is provided (it will be extracted via linked records)', () => {
      beforeEach(() => {
        reviewChargeElement = {
          chargeElement,
          reviewChargeReference: {
            reviewChargeVersion: {
              chargePeriodStartDate: new Date('2023-05-24'),
              chargePeriodEndDate: new Date('2024-03-31')
            }
          }
        }
      })

      it("will return the review element's charge periods formatted for display", () => {
        const result = BaseReviewPresenter.formatChargePeriods(reviewChargeElement)

        expect(result).to.equal(['24 May 2023 to 31 December 2023', '1 January 2024 to 31 March 2024'])
      })
    })

    describe('when a charge period is provided', () => {
      const chargePeriod = { startDate: new Date('2023-05-24'), endDate: new Date('2024-03-31') }

      beforeEach(() => {
        reviewChargeElement = { chargeElement }
      })

      it("will return the review element's charge periods formatted for display", () => {
        const result = BaseReviewPresenter.formatChargePeriods(reviewChargeElement, chargePeriod)

        expect(result).to.equal(['24 May 2023 to 31 December 2023', '1 January 2024 to 31 March 2024'])
      })
    })
  })

  describe('#formatIssues()', () => {
    let issues

    describe('when "issues" is an empty string', () => {
      beforeEach(() => {
        issues = ''
      })

      it('returns an empty array', () => {
        const result = BaseReviewPresenter.formatIssues(issues)

        expect(result).to.be.empty()
      })
    })

    describe('when "issues" is a single value', () => {
      beforeEach(() => {
        issues = 'Aggregate'
      })

      it('returns an array containing the one value', () => {
        const result = BaseReviewPresenter.formatIssues(issues)

        expect(result).to.equal(['Aggregate'])
      })
    })

    describe('when "issues" contains multiple values', () => {
      beforeEach(() => {
        issues = 'Aggregate, No returns received'
      })

      it('returns an array containing all values', () => {
        const result = BaseReviewPresenter.formatIssues(issues)

        expect(result).to.equal(['Aggregate', 'No returns received'])
      })
    })
  })

  describe('#formatPurposes()', () => {
    let purposes

    describe('when there is a single purpose', () => {
      beforeEach(() => {
        purposes = [{ tertiary: { description: 'Spray Irrigation - Direct' } }]
      })

      it('returns the purpose description', () => {
        const result = BaseReviewPresenter.formatPurposes(purposes)

        expect(result).to.equal('Spray Irrigation - Direct')
      })
    })

    describe('when there is more than one purpose', () => {
      beforeEach(() => {
        purposes = [
          { tertiary: { description: 'Spray Irrigation - Direct' } },
          { tertiary: { description: 'Spray Irrigation - Anti Frost' } },
          { tertiary: { description: 'Spray Irrigation - Storage' } }
        ]
      })

      it('returns the purpose descriptions as a comma separated string', () => {
        const result = BaseReviewPresenter.formatPurposes(purposes)

        expect(result).to.equal('Spray Irrigation - Direct, Spray Irrigation - Anti Frost, Spray Irrigation - Storage')
      })
    })
  })

  describe('#formatReturnStatus()', () => {
    let reviewReturn

    describe("when the review return's status is 'due'", () => {
      beforeEach(() => {
        reviewReturn = { returnStatus: 'due', underQuery: false }
      })

      it('returns "overdue"', () => {
        const result = BaseReviewPresenter.formatReturnStatus(reviewReturn)

        expect(result).to.equal('overdue')
      })
    })

    describe("when the review return is 'under query'", () => {
      beforeEach(() => {
        reviewReturn = { returnStatus: 'completed', underQuery: true }
      })

      it('returns "query"', () => {
        const result = BaseReviewPresenter.formatReturnStatus(reviewReturn)

        expect(result).to.equal('query')
      })
    })

    describe("when the review return is not 'under query' and the status is not 'due'", () => {
      beforeEach(() => {
        reviewReturn = { returnStatus: 'completed', underQuery: false }
      })

      it('returns whatever is the status of the review return', () => {
        const result = BaseReviewPresenter.formatReturnStatus(reviewReturn)

        expect(result).to.equal('completed')
      })
    })
  })

  describe('#formatReturnTotals()', () => {
    let reviewReturn

    describe("when the review return's status is 'due'", () => {
      beforeEach(() => {
        reviewReturn = { allocated: 10.1, quantity: 15, returnStatus: 'due' }
      })

      it('returns "/"', () => {
        const result = BaseReviewPresenter.formatReturnTotals(reviewReturn)

        expect(result).to.equal('/')
      })
    })

    describe("when the review return's status is 'received'", () => {
      beforeEach(() => {
        reviewReturn = { allocated: 10.1, quantity: 15, returnStatus: 'received' }
      })

      it('returns "/"', () => {
        const result = BaseReviewPresenter.formatReturnTotals(reviewReturn)

        expect(result).to.equal('/')
      })
    })

    describe('when the review return has any other status', () => {
      beforeEach(() => {
        reviewReturn = { allocated: 10.1, quantity: 15, returnStatus: 'completed' }
      })

      it('returns "10.1 ML / 15 ML"', () => {
        const result = BaseReviewPresenter.formatReturnTotals(reviewReturn)

        expect(result).to.equal('10.1 ML / 15 ML')
      })
    })
  })
})
