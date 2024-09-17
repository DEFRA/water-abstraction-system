'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ChargeCategoryHelper = require('../../../support/helpers/charge-category.helper.js')
const ChargeReferenceHelper = require('../../../support/helpers/charge-reference.helper.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const ReviewChargeElementHelper = require('../../../support/helpers/review-charge-element.helper.js')
const ReviewChargeReferenceHelper = require('../../../support/helpers/review-charge-reference.helper.js')
const ReviewChargeVersionHelper = require('../../../support/helpers/review-charge-version.helper.js')

// Things we need to stub
const CalculateChargeRequest = require('../../../../app/requests/charging-module/calculate-charge.request.js')

// Thing under test
const CalculateChargeService = require('../../../../app/services/bill-runs/two-part-tariff/calculate-charge.service.js')

describe.only('Calculate Charge service', () => {
  let calculateChargeRequestStub
  let chargeCategoryReference
  let licenceId
  let reviewChargeReferenceId
  let yarStub

  beforeEach(async () => {
    const testLicence = await LicenceHelper.add({ waterUndertaker: true })

    licenceId = testLicence.id

    const testChargeCategory = ChargeCategoryHelper.select()

    chargeCategoryReference = testChargeCategory.reference

    const { id: chargeReferenceId } = await ChargeReferenceHelper.add({
      additionalCharges: { isSupplyPublicWater: true, supportedSource: { name: 'TestSource' } },
      chargeCategoryId: testChargeCategory.id
    })

    const { id: reviewChargeVersionId } = await ReviewChargeVersionHelper.add({
      chargePeriodStartDate: new Date('2022-04-01'),
      chargePeriodEndDate: new Date('2023-03-31')
    })

    const testReviewChargeReference = await ReviewChargeReferenceHelper.add({
      reviewChargeVersionId,
      chargeReferenceId
    })

    reviewChargeReferenceId = testReviewChargeReference.id

    await ReviewChargeElementHelper.add({ reviewChargeReferenceId, amendedAllocated: 25 })
    await ReviewChargeElementHelper.add({ reviewChargeReferenceId, amendedAllocated: 25 })

    yarStub = { flash: Sinon.stub() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the charge can be successfully calculated', () => {
    beforeEach(async () => {
      calculateChargeRequestStub = Sinon.stub(CalculateChargeRequest, 'send').resolves(_calculateChargeRequestStub())
    })

    it('sends a valid transaction to the charging module to calculate the charge', async () => {
      await CalculateChargeService.go(licenceId, reviewChargeReferenceId, yarStub)

      const [testTransactionData] = calculateChargeRequestStub.args[0]

      expect(testTransactionData).to.equal({
        abatementFactor: 1,
        actualVolume: 50,
        adjustmentFactor: 1,
        aggregateProportion: 1,
        authorisedDays: 0,
        authorisedVolume: 50,
        billableDays: 0,
        chargeCategoryCode: chargeCategoryReference,
        compensationCharge: false,
        credit: false,
        loss: 'low',
        periodStart: '01-APR-2022',
        periodEnd: '31-MAR-2023',
        ruleset: 'sroc',
        section127Agreement: true,
        section130Agreement: false,
        supportedSource: true,
        supportedSourceName: 'TestSource',
        twoPartTariff: true,
        waterCompanyCharge: true,
        waterUndertaker: true,
        winterOnly: false
      })
    })

    it('will generate a banner message to display the example charge', async () => {
      await CalculateChargeService.go(licenceId, reviewChargeReferenceId, yarStub)
      const [flashType, bannerMessage] = yarStub.flash.args[0]

      expect(yarStub.flash.called).to.be.true()
      expect(flashType).to.equal('charge')
      expect(bannerMessage).to.equal('Based on this information the example charge is £256.48.')
    })
  })

  describe('when the charge is not calculated because the request to calculate the charge fails', () => {
    beforeEach(async () => {
      calculateChargeRequestStub = Sinon.stub(CalculateChargeRequest, 'send').resolves({ succeeded: false })
    })

    it('sends a valid transaction to the charging module to calculate the charge', async () => {
      await CalculateChargeService.go(licenceId, reviewChargeReferenceId, yarStub)

      const [testTransactionData] = calculateChargeRequestStub.args[0]

      expect(testTransactionData).to.equal({
        abatementFactor: 1,
        actualVolume: 50,
        adjustmentFactor: 1,
        aggregateProportion: 1,
        authorisedDays: 0,
        authorisedVolume: 50,
        billableDays: 0,
        chargeCategoryCode: chargeCategoryReference,
        compensationCharge: false,
        credit: false,
        loss: 'low',
        periodStart: '01-APR-2022',
        periodEnd: '31-MAR-2023',
        ruleset: 'sroc',
        section127Agreement: true,
        section130Agreement: false,
        supportedSource: true,
        supportedSourceName: 'TestSource',
        twoPartTariff: true,
        waterCompanyCharge: true,
        waterUndertaker: true,
        winterOnly: false
      })
    })

    it('will not generate a banner message', async () => {
      await CalculateChargeService.go(licenceId, reviewChargeReferenceId, yarStub)

      expect(yarStub.flash.called).to.be.false()
    })
  })
})

function _calculateChargeRequestStub () {
  return {
    succeeded: true,
    response: {
      info: {
        gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
        dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
      },
      statusCode: 200,
      body: {
        calculation: {
          chargeValue: 25648,
          baseCharge: 51300,
          waterCompanyChargeValue: 800,
          supportedSourceValue: 3500,
          winterOnlyFactor: null,
          section130Factor: null,
          section127Factor: 0.5,
          compensationChargePercent: null
        }
      }
    }
  }
}
