'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ChangeReasonHelper = require('../../../support/helpers/change-reason.helper.js')
const ChargeCategoryHelper = require('../../../support/helpers/charge-category.helper.js')
const ChargeElementHelper = require('../../../support/helpers/charge-element.helper.js')
const ChargeReferenceHelper = require('../../../support/helpers/charge-reference.helper.js')
const ChargeVersionHelper = require('../../../support/helpers/charge-version.helper.js')
const WorkflowHelper = require('../../../support/helpers/workflow.helper.js')
const DatabaseHelper = require('../../../support/helpers/database.helper.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')

// Thing under test
const FetchChargeVersionsService = require('../../../../app/services/bill-runs/annual/fetch-charge-versions.service.js')

describe('Fetch Charge Versions service', () => {
  const billingPeriod = _currentBillingPeriod()

  let licence
  let licenceId
  let region
  let regionId

  beforeEach(async () => {
    await DatabaseHelper.clean()

    region = await RegionHelper.add({ chargeRegionId: 'W' })
    regionId = region.id

    licence = await LicenceHelper.add({ regionId })
    licenceId = licence.id
  })

  describe('when there are charge versions that should be considered for annual billing', () => {
    let changeReason
    let chargeCategory
    let chargeElement
    let chargeReference
    let chargeVersion

    beforeEach(async () => {
      changeReason = await ChangeReasonHelper.add({ triggersMinimumCharge: true })

      const { id: licenceId, licenceRef } = licence
      const { id: changeReasonId } = changeReason
      const billingAccountId = '77483323-daec-443e-912f-b87e1e9d0721'

      chargeVersion = await ChargeVersionHelper.add(
        { startDate: new Date('2023-11-01'), changeReasonId, billingAccountId, licenceId, licenceRef }
      )
      const { id: chargeVersionId } = chargeVersion

      chargeCategory = await ChargeCategoryHelper.add()
      const { id: chargeCategoryId } = chargeCategory

      chargeReference = await ChargeReferenceHelper.add({ chargeVersionId, chargeCategoryId })
      const { id: chargeReferenceId } = chargeReference

      chargeElement = await ChargeElementHelper.add({ chargeReferenceId })
    })

    it('returns the applicable charge versions', async () => {
      const results = await FetchChargeVersionsService.go(regionId, billingPeriod)

      expect(results).to.have.length(1)

      expect(results[0].id).to.equal(chargeVersion.id)
      expect(results[0].scheme).to.equal('sroc')
      expect(results[0].startDate).to.equal(new Date('2023-11-01'))
      expect(results[0].endDate).to.be.null()
      expect(results[0].billingAccountId).to.equal('77483323-daec-443e-912f-b87e1e9d0721')
      expect(results[0].status).to.equal('current')
    })

    it('includes the related licence and region in each result', async () => {
      const results = await FetchChargeVersionsService.go(regionId, billingPeriod)

      expect(results[0].licence.id).to.equal(licence.id)
      expect(results[0].licence.licenceRef).to.equal(licence.licenceRef)
      expect(results[0].licence.waterUndertaker).to.equal(false)
      expect(results[0].licence.historicalAreaCode).to.equal('SAAR')
      expect(results[0].licence.regionalChargeArea).to.equal('Southern')
      expect(results[0].licence.region.id).to.equal(regionId)
      expect(results[0].licence.region.chargeRegionId).to.equal('W')
    })

    it('includes the related change reason in each result', async () => {
      const results = await FetchChargeVersionsService.go(regionId, billingPeriod)

      expect(results[0].changeReason.id).to.equal(changeReason.id)
      expect(results[0].changeReason.triggersMinimumCharge).to.equal(changeReason.triggersMinimumCharge)
    })

    it('includes the related charge references, charge category and charge elements in each result', async () => {
      const results = await FetchChargeVersionsService.go(regionId, billingPeriod)

      expect(results[0].chargeReferences).to.have.length(1)

      expect(results[0].chargeReferences[0]).to.equal({
        id: chargeReference.id,
        source: 'non-tidal',
        loss: 'low',
        volume: 6.819,
        adjustments: {
          s126: null, s127: false, s130: false, charge: null, winter: false, aggregate: '0.562114443'
        },
        additionalCharges: { isSupplyPublicWater: true },
        description: 'Mineral washing',
        chargeCategory: {
          id: chargeCategory.id,
          reference: chargeCategory.reference,
          shortDescription: 'Low loss, non-tidal, restricted water, up to and including 5,000 ML/yr, Tier 1 model'
        },
        chargeElements: [{
          id: chargeElement.id,
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 4,
          abstractionPeriodEndDay: 31,
          abstractionPeriodEndMonth: 3
        }]
      })
    })
  })

  describe('when there are no charge version that should be considered for the annual bill run', () => {
    describe("because all the applicable charge versions have a 'draft' status", () => {
      beforeEach(async () => {
        await ChargeVersionHelper.add({ status: 'draft', licenceId })
      })

      it('returns empty results', async () => {
        const results = await FetchChargeVersionsService.go(regionId, billingPeriod)

        expect(results).to.be.empty()
      })
    })

    describe("because all of them are for the 'alcs' (presroc) scheme", () => {
      beforeEach(async () => {
        await ChargeVersionHelper.add({ scheme: 'alcs', licenceId })
      })

      it('returns empty results', async () => {
        const results = await FetchChargeVersionsService.go(regionId, billingPeriod)

        expect(results).to.be.empty()
      })
    })

    describe('because none of them have a `billingAccountId`', () => {
      beforeEach(async () => {
        await ChargeVersionHelper.add({ billingAccountId: null, licenceId })
      })

      it('returns empty results', async () => {
        const results = await FetchChargeVersionsService.go(regionId, billingPeriod)

        expect(results).to.be.empty()
      })
    })

    describe('because they all have start dates after the billing period', () => {
      beforeEach(async () => {
        const financialEndYear = billingPeriod.endDate.getFullYear()

        // This creates an charge version with a start date after the billing period. This will be picked in
        // next years bill run
        await ChargeVersionHelper.add(
          { startDate: new Date(financialEndYear, 8, 15), licenceId }
        )
      })

      it('returns empty results', async () => {
        const results = await FetchChargeVersionsService.go(regionId, billingPeriod)

        expect(results).to.be.empty()
      })
    })

    describe('because they are all linked to licences in a different region', () => {
      beforeEach(async () => {
        const { id: licenceId } = await LicenceHelper.add({ regionId: 'e117b501-e3c1-4337-ad35-21c60ed9ad73' })

        // This creates an charge version linked to a licence with an different region than selected
        await ChargeVersionHelper.add({ licenceId })
      })

      it('returns empty results', async () => {
        const results = await FetchChargeVersionsService.go(regionId, billingPeriod)

        expect(results).to.be.empty()
      })
    })

    describe('because they are all linked to licences in workflow', () => {
      beforeEach(async () => {
        await ChargeVersionHelper.add({ licenceId })
        await WorkflowHelper.add({ licenceId })
      })

      it('returns empty results', async () => {
        const results = await FetchChargeVersionsService.go(regionId, billingPeriod)

        expect(results).to.be.empty()
      })
    })
  })
})

// TODO: This was copied from app/services/bill-runs/determine-billing-periods.service.js. We should consider
// refactoring to a helper
function _currentBillingPeriod () {
  // 01-APR to 31-MAR
  const financialPeriod = {
    start: { day: 1, month: 3 },
    end: { day: 31, month: 2 }
  }

  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()

  let startYear
  let endYear

  // IMPORTANT! getMonth returns an integer (0-11). So, January is represented as 0 and December as 11. This is why
  // financialPeriod.end.month is 2 rather than 3, even though we mean March
  if (currentDate.getMonth() <= financialPeriod.end.month) {
    // For example, if currentDate was 2022-02-15 it would fall in financial year 2021-04-01 to 2022-03-31
    startYear = currentYear - 1
    endYear = currentYear
  } else {
    // For example, if currentDate was 2022-06-15 it would fall in financial year 2022-04-01 to 2023-03-31
    startYear = currentYear
    endYear = currentYear + 1
  }

  return {
    startDate: new Date(startYear, 3, 1),
    endDate: new Date(endYear, 2, 31)
  }
}
