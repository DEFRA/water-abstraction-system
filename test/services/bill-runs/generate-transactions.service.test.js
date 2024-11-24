'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ChargeCategoryHelper = require('../../support/helpers/charge-category.helper.js')
const ChargeElementHelper = require('../../support/helpers/charge-element.helper.js')
const ChargeReferenceHelper = require('../../support/helpers/charge-reference.helper.js')

// Things we need to stub
const CalculateAuthorisedAndBillableDaysService = require('../../../app/services/bill-runs/calculate-authorised-and-billable-days.service.js')

// Thing under test
const GenerateTransactionsService = require('../../../app/services/bill-runs/generate-transactions.service.js')

describe('Generate Transactions service', () => {
  const billLicenceId = '5e2afb53-ca92-4515-ad71-36a7cefbcebb'

  let chargeCategory
  let chargeElement
  let chargePeriod
  let chargeReference
  let newLicence
  let waterUndertaker

  const billingPeriod = {
    startDate: new Date('2022-04-01'),
    endDate: new Date('2023-03-31')
  }

  beforeEach(async () => {
    chargeCategory = ChargeCategoryHelper.select()
    const { id: chargeCategoryId } = chargeCategory

    const baseChargeReference = await ChargeReferenceHelper.add({ chargeCategoryId })

    chargeElement = await ChargeElementHelper.add({ chargeReferenceId: baseChargeReference.id })
    chargeReference = await baseChargeReference
      .$query()
      .withGraphFetched('chargeCategory')
      .withGraphFetched('chargeElements')
  })

  afterEach(async () => {
    Sinon.restore()
  })

  describe('when a charge reference has billable days', () => {
    let expectedStandardChargeResult

    beforeEach(() => {
      chargePeriod = {
        startDate: new Date('2022-04-01'),
        endDate: new Date('2022-10-31')
      }
      waterUndertaker = false
      newLicence = false

      expectedStandardChargeResult = {
        billLicenceId,
        chargeReferenceId: chargeReference.id,
        startDate: chargePeriod.startDate,
        endDate: chargePeriod.endDate,
        source: 'non-tidal',
        season: 'all year',
        loss: 'low',
        credit: false,
        chargeType: 'standard',
        authorisedQuantity: 6.819,
        billableQuantity: 6.819,
        authorisedDays: 365,
        billableDays: 214,
        status: 'candidate',
        description: 'Water abstraction charge: Mineral washing',
        volume: 6.819,
        section126Factor: 1,
        section127Agreement: false,
        section130Agreement: false,
        newLicence: false,
        secondPartCharge: false,
        scheme: 'sroc',
        aggregateFactor: 0.562114443,
        adjustmentFactor: 1,
        chargeCategoryCode: chargeCategory.reference,
        chargeCategoryDescription: chargeCategory.shortDescription,
        supportedSource: false,
        supportedSourceName: null,
        waterCompanyCharge: true,
        winterOnly: false
      }

      Sinon.stub(CalculateAuthorisedAndBillableDaysService, 'go').returns({ authorisedDays: 365, billableDays: 214 })
    })

    describe('and is a water undertaker', () => {
      beforeEach(() => {
        waterUndertaker = true
      })

      it('returns an array of one transaction containing the expected data', () => {
        const results = GenerateTransactionsService.go(
          billLicenceId,
          chargeReference,
          billingPeriod,
          chargePeriod,
          newLicence,
          waterUndertaker
        )

        // Should only return the 'standard' charge transaction line
        expect(results).to.have.length(1)
        // We skip checking 'purposes' as we test this elsewhere
        expect(results[0]).to.equal(
          {
            ...expectedStandardChargeResult,
            waterUndertaker
          },
          { skip: ['purposes', 'id'] }
        )
      })

      it('returns the charge element as JSON in the transaction line "purposes" property', () => {
        const results = GenerateTransactionsService.go(
          billLicenceId,
          chargeReference,
          billingPeriod,
          chargePeriod,
          newLicence,
          waterUndertaker
        )

        const parsedElements = JSON.parse(results[0].purposes)

        expect(parsedElements[0].id).to.equal(chargeElement.id)
      })
    })

    describe('and is not a water undertaker', () => {
      it('returns an array of two transactions containing the expected data', () => {
        const results = GenerateTransactionsService.go(
          billLicenceId,
          chargeReference,
          billingPeriod,
          chargePeriod,
          newLicence,
          waterUndertaker
        )

        // Should return both a 'standard' charge and 'compensation' charge transaction line
        expect(results).to.have.length(2)
        // We skip checking 'purposes' as we test this elsewhere
        expect(results[0]).to.equal(
          {
            ...expectedStandardChargeResult,
            waterUndertaker
          },
          { skip: ['purposes', 'id'] }
        )
      })

      it('returns a second compensation charge transaction', () => {
        const results = GenerateTransactionsService.go(
          billLicenceId,
          chargeReference,
          billingPeriod,
          chargePeriod,
          newLicence,
          waterUndertaker
        )

        expect(results[1]).to.equal(
          {
            ...expectedStandardChargeResult,
            waterUndertaker,
            chargeType: 'compensation',
            description:
              'Compensation charge: calculated from the charge reference, activity description and regional environmental improvement charge; excludes any supported source additional charge and two-part tariff charge agreement'
          },
          { skip: ['purposes', 'id'] }
        )
      })

      it('returns the charge element as JSON in both transaction lines "purposes" property', () => {
        const results = GenerateTransactionsService.go(
          billLicenceId,
          chargeReference,
          billingPeriod,
          chargePeriod,
          newLicence,
          waterUndertaker
        )

        const parsedStandardElements = JSON.parse(results[0].purposes)
        const parsedCompensationElements = JSON.parse(results[1].purposes)

        expect(parsedStandardElements[0].id).to.equal(chargeElement.id)
        expect(parsedCompensationElements[0].id).to.equal(chargeElement.id)
      })
    })

    // NOTE: newLicence unlike waterUndertaker does not result in any behaviour changes in the service. It is just
    // getting applied to the transaction lines the service generates as is. But as an arg to the service we felt it
    // worth adding unit tests for, if only to document it as something that the service expects
    describe('and is a new licence', () => {
      beforeEach(() => {
        newLicence = true
      })

      it('returns "newLicence" as true in the results', () => {
        const results = GenerateTransactionsService.go(
          billLicenceId,
          chargeReference,
          billingPeriod,
          chargePeriod,
          newLicence,
          waterUndertaker
        )

        expect(results[0].newLicence).to.be.true()
      })
    })

    describe('and is not a new licence', () => {
      it('returns "newLicence" as false in the results', () => {
        const results = GenerateTransactionsService.go(
          billLicenceId,
          chargeReference,
          billingPeriod,
          chargePeriod,
          newLicence,
          waterUndertaker
        )

        expect(results[0].newLicence).to.be.false()
      })
    })

    describe('and a two-part tariff agreement (section 127)', () => {
      describe('has not applied', () => {
        it('returns the standard description', () => {
          const results = GenerateTransactionsService.go(
            billLicenceId,
            chargeReference,
            billingPeriod,
            chargePeriod,
            newLicence,
            waterUndertaker
          )

          expect(results[0].description).to.equal(`Water abstraction charge: ${chargeReference.description}`)
        })
      })

      describe('has been applied', () => {
        beforeEach(() => {
          chargeReference.adjustments.s127 = true
        })

        it('returns the two-part tariff prefixed description', () => {
          const results = GenerateTransactionsService.go(
            billLicenceId,
            chargeReference,
            billingPeriod,
            chargePeriod,
            newLicence,
            waterUndertaker
          )

          expect(results[0].description).to.equal(
            `Two-part tariff basic water abstraction charge: ${chargeReference.description}`
          )
        })
      })
    })
  })

  describe('when a charge reference does not have billable days', () => {
    beforeEach(() => {
      chargePeriod = {
        startDate: new Date('2022-04-01'),
        endDate: new Date('2022-10-31')
      }

      Sinon.stub(CalculateAuthorisedAndBillableDaysService, 'go').returns({ authorisedDays: 365, billableDays: 0 })
    })

    it('returns an empty array', () => {
      const results = GenerateTransactionsService.go(
        billLicenceId,
        chargeReference,
        billingPeriod,
        chargePeriod,
        newLicence,
        waterUndertaker
      )

      expect(results).to.be.empty()
    })
  })
})
