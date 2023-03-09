'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingChargeCategoryHelper = require('../../support/helpers/water/billing-charge-category.helper.js')
const ChargeElementHelper = require('../../support/helpers/water/charge-element.helper.js')
const ChargePurposeHelper = require('../../support/helpers/water/charge-purpose.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')

// Things we need to stub
const CalculateAuthorisedAndBillableDaysServiceService = require('../../../app/services/supplementary-billing/calculate-authorised-and-billable-days.service.js')

// Thing under test
const GenerateBillingTransactionsService = require('../../../app/services/supplementary-billing/generate-billing-transactions.service.js')

describe('Generate billing transactions service', () => {
  let chargePeriod
  let chargePurpose
  let chargeElement
  let isNewLicence
  let isWaterUndertaker

  const billingPeriod = {
    startDate: new Date('2022-04-01'),
    endDate: new Date('2023-03-31')
  }

  beforeEach(async () => {
    const billingChargeCategory = await BillingChargeCategoryHelper.add()
    const { billingChargeCategoryId } = billingChargeCategory

    const baseChargeElement = await ChargeElementHelper.add({ billingChargeCategoryId })
    chargePurpose = await ChargePurposeHelper.add({ chargeElementId: baseChargeElement.chargeElementId })
    chargeElement = await baseChargeElement.$query()
      .withGraphFetched('billingChargeCategory')
      .withGraphFetched('chargePurposes')
  })

  afterEach(async () => {
    await DatabaseHelper.clean()
    Sinon.restore()
  })

  describe('when a charge element has billable days', () => {
    let expectedStandardChargeResult

    beforeEach(() => {
      chargePeriod = {
        startDate: new Date('2022-04-01'),
        endDate: new Date('2022-10-31')
      }
      isNewLicence = false

      expectedStandardChargeResult = {
        chargeElementId: chargeElement.chargeElementId,
        startDate: chargePeriod.startDate,
        endDate: chargePeriod.endDate,
        source: 'non-tidal',
        season: 'all year',
        loss: 'low',
        isCredit: false,
        chargeType: 'standard',
        authorisedQuantity: 6.82,
        billableQuantity: 6.82,
        authorisedDays: 365,
        billableDays: 214,
        status: 'candidate',
        description: 'Water abstraction charge: Mineral washing',
        volume: 6.82,
        section126Factor: 1,
        section127Agreement: false,
        section130Agreement: false,
        isNewLicence: false,
        isTwoPartSecondPartCharge: false,
        scheme: 'sroc',
        aggregateFactor: 0.562114443,
        adjustmentFactor: 1,
        chargeCategoryCode: '4.4.5',
        chargeCategoryDescription: 'Low loss, non-tidal, restricted water, up to and including 5,000 ML/yr, Tier 1 model',
        isSupportedSource: false,
        supportedSourceName: null,
        isWaterCompanyCharge: true,
        isWinterOnly: false
      }

      Sinon.stub(CalculateAuthorisedAndBillableDaysServiceService, 'go').returns({ authorisedDays: 365, billableDays: 214 })
    })

    describe('and is a water undertaker', () => {
      beforeEach(() => {
        isWaterUndertaker = true
      })

      it('returns an array of one transaction containing the expected data', () => {
        const result = GenerateBillingTransactionsService.go(chargeElement, billingPeriod, chargePeriod, isNewLicence, isWaterUndertaker)

        // Should only return the 'standard' charge transaction line
        expect(result).to.have.length(1)
        // We skip checking 'purposes' as we test this elsewhere
        expect(result[0]).to.equal(
          {
            ...expectedStandardChargeResult,
            isWaterUndertaker
          },
          { skip: ['purposes', 'billingTransactionId'] }
        )
      })

      it('returns the charge purpose as JSON in the transaction line `purposes` property', () => {
        const result = GenerateBillingTransactionsService.go(chargeElement, billingPeriod, chargePeriod, isNewLicence, isWaterUndertaker)

        const parsedPurposes = JSON.parse(result[0].purposes)

        expect(parsedPurposes[0].chargePurposeId).to.equal(chargePurpose.chargePurposeId)
      })
    })

    describe('and is not a water undertaker', () => {
      beforeEach(() => {
        isWaterUndertaker = false
      })

      it('returns an array of two transactions containing the expected data', () => {
        const result = GenerateBillingTransactionsService.go(chargeElement, billingPeriod, chargePeriod, isNewLicence, isWaterUndertaker)

        // Should return both a 'standard' charge and 'compensation' charge transaction line
        expect(result).to.have.length(2)
        // We skip checking 'purposes' as we test this elsewhere
        expect(result[0]).to.equal(
          {
            ...expectedStandardChargeResult,
            isWaterUndertaker
          },
          { skip: ['purposes', 'billingTransactionId'] }
        )
      })

      it('returns a second compensation charge transaction', () => {
        const result = GenerateBillingTransactionsService.go(chargeElement, billingPeriod, chargePeriod, isNewLicence, isWaterUndertaker)

        expect(result[1]).to.equal(
          {
            ...expectedStandardChargeResult,
            isWaterUndertaker,
            chargeType: 'compensation',
            description: 'Compensation charge: calculated from the charge reference, activity description and regional environmental improvement charge; excludes any supported source additional charge and two-part tariff charge agreement'
          },
          { skip: ['purposes', 'billingTransactionId'] }
        )
      })

      it('returns the charge purpose as JSON in both transaction lines `purposes` property', () => {
        const result = GenerateBillingTransactionsService.go(chargeElement, billingPeriod, chargePeriod, isNewLicence, isWaterUndertaker)

        const parsedStandardPurposes = JSON.parse(result[0].purposes)
        const parsedCompensationPurposes = JSON.parse(result[1].purposes)

        expect(parsedStandardPurposes[0].chargePurposeId).to.equal(chargePurpose.chargePurposeId)
        expect(parsedCompensationPurposes[0].chargePurposeId).to.equal(chargePurpose.chargePurposeId)
      })
    })

    // NOTE: isNewLicence unlike isWaterUndertaker does not result in any behaviour changes in the service. It is just
    // getting applied to the transaction lines the service generates as is. But as an arg to the service we felt it
    // worth adding unit tests for, if only to document it as something that the service expects
    describe('and is a new licence', () => {
      beforeEach(() => {
        isWaterUndertaker = false
        isNewLicence = true
      })

      it('returns `isNewLicence` as true on both transaction lines in the result', () => {
        const result = GenerateBillingTransactionsService.go(chargeElement, billingPeriod, chargePeriod, isNewLicence, isWaterUndertaker)

        expect(result[0].isNewLicence).to.be.true()
      })
    })

    describe('returns `isNewLicence` as false on both transaction lines in the result', () => {
      beforeEach(() => {
        isWaterUndertaker = false
      })

      it('returns the expected data', () => {
        const result = GenerateBillingTransactionsService.go(chargeElement, billingPeriod, chargePeriod, isNewLicence, isWaterUndertaker)

        expect(result[0].isNewLicence).to.be.false()
      })
    })
  })

  describe('when a charge element does not have billable days', () => {
    beforeEach(() => {
      chargePeriod = {
        startDate: new Date('2022-04-01'),
        endDate: new Date('2022-10-31')
      }
      isNewLicence = false
      isWaterUndertaker = false

      Sinon.stub(CalculateAuthorisedAndBillableDaysServiceService, 'go').returns({ authorisedDays: 365, billableDays: 0 })
    })

    it('returns an empty array', () => {
      const result = GenerateBillingTransactionsService.go(chargeElement, billingPeriod, chargePeriod, isNewLicence, isWaterUndertaker)

      expect(result).to.be.empty()
    })
  })
})
