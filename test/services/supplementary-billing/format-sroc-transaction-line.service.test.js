'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingChargeCategoryHelper = require('../../support/helpers/water/billing-charge-category.helper.js')
const ChargeElementHelper = require('../../support/helpers/water/charge-element.helper.js')
const ChargePurposeHelper = require('../../support/helpers/water/charge-purpose.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')

// Thing under test
const FormatSrocTransactionLineservice = require('../../../app/services/supplementary-billing/format-sroc-transaction-line.service.js')

describe.only('Format Sroc Transaction Line service', () => {
  let billingChargeCategoryId
  let chargePeriod
  let chargePurpose
  let eagerChargeElement

  beforeEach(async () => {
    const billingChargeCategory = await BillingChargeCategoryHelper.add()
    billingChargeCategoryId = billingChargeCategory.billingChargeCategoryId

    const chargeElement = await ChargeElementHelper.add({ billingChargeCategoryId })
    chargePurpose = await ChargePurposeHelper.add({ chargeElementId: chargeElement.chargeElementId })
    eagerChargeElement = await chargeElement.$query()
      .withGraphFetched('billingChargeCategory')
      .withGraphFetched('chargePurposes')

    chargePeriod = {
      startDate: new Date(2022, 10, 1),
      endDate: new Date(2023, 2, 1)
    }
  })

  afterEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('when a standard charge element is supplied', () => {
    it('returns the expected data', () => {
      const result = FormatSrocTransactionLineservice.go(eagerChargeElement, chargePeriod, 2023)

      const expectedResult = {
        chargeElementId: eagerChargeElement.chargeElementId,
        startDate: new Date(2022, 10, 1),
        endDate: new Date(2023, 2, 1),
        source: 'non-tidal',
        season: 'all year',
        loss: 'low',
        isCredit: false,
        chargeType: 'standard',
        authorisedQuantity: '6.82',
        billableQuantity: '6.82',
        authorisedDays: 365,
        billableDays: 121,
        status: 'candidate',
        description: 'Water abstraction charge: Mineral washing',
        volume: '6.82',
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
        isWinterOnly: false,
        isWaterUndertaker: false
      }

      // We skip checking 'purposes' as we test this elsewhere
      expect(result).to.equal(expectedResult, { skip: 'purposes' })
    })

    it('returns the charge purpose as JSON in `purposes`', () => {
      const result = FormatSrocTransactionLineservice.go(eagerChargeElement, chargePeriod, 2023)

      const parsedPurposes = JSON.parse(result.purposes)

      expect(parsedPurposes[0].chargePurposeId).to.equal(chargePurpose.chargePurposeId)
    })
  })

  describe('when options are supplied', () => {
    describe('isCompensation charge is `true`', () => {
      it('returns the expected data', () => {
        const result = FormatSrocTransactionLineservice.go(eagerChargeElement, chargePeriod, 2023, { isCompensationCharge: true })

        expect(result.chargeType).to.equal('compensation')
      })
    })

    describe('isWaterUndertaker charge is `true`', () => {
      it('returns the expected data', () => {
        const result = FormatSrocTransactionLineservice.go(eagerChargeElement, chargePeriod, 2023, { isWaterUndertaker: true })

        expect(result.isWaterUndertaker).to.equal(true)
      })
    })

    describe('isNewLicence charge is `true`', () => {
      it('returns the expected data', () => {
        const result = FormatSrocTransactionLineservice.go(eagerChargeElement, chargePeriod, 2023, { isNewLicence: true })

        expect(result.isNewLicence).to.equal(true)
      })
    })
  })

  describe('when the charge element has a supported source', () => {
    let eagerSupportedSourceChargeElement

    beforeEach(async () => {
      const additionalCharges = {
        supportedSource: {
          id: '87391339-25c3-4132-9a78-0f7d7c111042',
          name: 'SUPPORTED_SOURCE_NAME'
        },
        isSupplyPublicWater: false
      }

      const supportedSourceChargeElement = await ChargeElementHelper.add({ additionalCharges, billingChargeCategoryId })
      await ChargePurposeHelper.add({ chargeElementId: supportedSourceChargeElement.chargeElementId })
      eagerSupportedSourceChargeElement = await supportedSourceChargeElement.$query()
        .withGraphFetched('billingChargeCategory')
        .withGraphFetched('chargePurposes')
    })

    it('returns `isSupportedSource` as `true`', () => {
      const result = FormatSrocTransactionLineservice.go(eagerSupportedSourceChargeElement, chargePeriod, 2023)

      expect(result.isSupportedSource).to.equal(true)
    })

    it('returns `supportedSourceName` field with the supported source name', () => {
      const result = FormatSrocTransactionLineservice.go(eagerSupportedSourceChargeElement, chargePeriod, 2023)

      expect(result.supportedSourceName).to.equal('SUPPORTED_SOURCE_NAME')
    })
  })

  describe('when the description differs from the default', () => {
    describe('because this is a compensation charge', () => {
      it('returns the expected compensation charge description', () => {
        const result = FormatSrocTransactionLineservice.go(eagerChargeElement, chargePeriod, 2023, { isCompensationCharge: true })

        expect(result.description).to.startWith('Compensation charge')
      })
    })
  })
})
