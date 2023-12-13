'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ChargeCategoryHelper = require('../../../support/helpers/charge-category.helper.js')
const ChargeElementHelper = require('../../../support/helpers/charge-element.helper.js')
const ChargeReferenceHelper = require('../../../support/helpers/charge-reference.helper.js')
const ChargeVersionHelper = require('../../../support/helpers/charge-version.helper.js')
const WorkflowHelper = require('../../../support/helpers/workflow.helper.js')
const DatabaseHelper = require('../../../support/helpers/database.helper.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')

// Thing under test
const FetchChargeVersionsService = require('../../../../app/services/bill-runs/two-part-tariff/fetch-charge-versions.service')

describe('Fetch Charge Versions service', () => {
  const billingPeriod = {
    startDate: new Date('2022-04-01'),
    endDate: new Date('2023-03-31')
  }
  const regionCode = 5
  const licenceId = 'cee9ff5f-813a-49c7-ba04-c65cfecf67dd'
  const licenceRef = '01/128'

  let chargeCategoryId
  let regionId

  beforeEach(async () => {
    await DatabaseHelper.clean()

    const chargeCategory = ChargeCategoryHelper.add()
    chargeCategoryId = chargeCategory.id

    const region = await RegionHelper.add({ naldRegionId: regionCode })
    regionId = region.id

    await LicenceHelper.add({ id: licenceId, licenceRef, regionId })
  })

  describe('when there are applicable charge versions', () => {
    let chargeVersionId

    beforeEach(async () => {
      const chargeVersion = await ChargeVersionHelper.add(
        { startDate: new Date('2022-04-01'), licenceId, licenceRef, regionCode }
      )
      chargeVersionId = chargeVersion.id

      const { id: chargeReferenceId } = await ChargeReferenceHelper.add({
        id: 'a86837fa-cf25-42fe-8216-ea8c2d2c939d',
        chargeVersionId,
        chargeCategoryId,
        adjustments: { s127: true, aggregate: 0.562114443 }
      })

      await ChargeElementHelper.add({
        id: '1a966bd1-dbce-499d-ae94-b1d6ab72f0b2',
        chargeReferenceId,
        authorisedAnnualQuantity: 100
      })

      await ChargeElementHelper.add({
        id: 'dab91d76-6778-417f-8f2d-9124a270e926',
        chargeReferenceId,
        authorisedAnnualQuantity: 200
      })
    })

    it('returns the charge version with related licence, charge references and charge elements', async () => {
      const results = await FetchChargeVersionsService.go(regionId, billingPeriod)

      expect(results).to.have.length(1)
      expect(results[0]).to.equal({
        id: chargeVersionId,
        startDate: new Date('2022-04-01'),
        endDate: null,
        status: 'current',
        licence: {
          id: 'cee9ff5f-813a-49c7-ba04-c65cfecf67dd',
          licenceRef: '01/128',
          startDate: new Date('2022-01-01'),
          expiredDate: null,
          lapsedDate: null,
          revokedDate: null
        },
        chargeReferences: [{
          id: 'a86837fa-cf25-42fe-8216-ea8c2d2c939d',
          volume: 6.82,
          description: 'Mineral washing',
          aggregate: 0.562114443,
          s127: 'true',
          chargeCategory: null,
          chargeElements: [
            {
              id: 'dab91d76-6778-417f-8f2d-9124a270e926',
              description: 'Trickle Irrigation - Direct',
              abstractionPeriodStartDay: 1,
              abstractionPeriodStartMonth: 4,
              abstractionPeriodEndDay: 31,
              abstractionPeriodEndMonth: 3,
              authorisedAnnualQuantity: 200,
              purpose: null
            },
            {
              id: '1a966bd1-dbce-499d-ae94-b1d6ab72f0b2',
              description: 'Trickle Irrigation - Direct',
              abstractionPeriodStartDay: 1,
              abstractionPeriodStartMonth: 4,
              abstractionPeriodEndDay: 31,
              abstractionPeriodEndMonth: 3,
              authorisedAnnualQuantity: 100,
              purpose: null
            }
          ]
        }]
      })
    })

    it('returns charge versions with correct ordering based on licence reference', async () => {
      const results = await FetchChargeVersionsService.go(regionId, billingPeriod)

      expect(results).to.have.length(1)
    })

    it('returns the charge elements within each charge version ordered by authorised annual quantity', async () => {
      const results = await FetchChargeVersionsService.go(regionId, billingPeriod)

      expect(results[0].chargeReferences[0].chargeElements[0].id).to.equal('dab91d76-6778-417f-8f2d-9124a270e926')
      expect(results[0].chargeReferences[0].chargeElements[1].id).to.equal('1a966bd1-dbce-499d-ae94-b1d6ab72f0b2')
    })
  })

  describe('when there are no applicable charge versions', () => {
    describe("because the scheme is 'presroc'", () => {
      beforeEach(async () => {
        await ChargeVersionHelper.add(
          { scheme: 'alcs', licenceId, licenceRef, regionCode: 5 }
        )
      })

      it('returns no records', async () => {
        const results = await FetchChargeVersionsService.go(regionId, billingPeriod)

        expect(results).to.be.empty()
      })
    })

    describe('because the start date is after the billing period ends', () => {
      beforeEach(async () => {
        const { id: chargeVersionId } = await ChargeVersionHelper.add(
          { startDate: new Date('2023-04-01'), licenceId, licenceRef, regionCode }
        )

        await ChargeReferenceHelper.add({
          chargeVersionId,
          chargeCategoryId,
          adjustments: { s127: true, aggregate: 0.562114443 }
        })
      })

      it('returns no records', async () => {
        const results = await FetchChargeVersionsService.go(regionId, billingPeriod)

        expect(results).to.be.empty()
      })
    })

    describe("because the status is not 'current'", () => {
      beforeEach(async () => {
        const { id: chargeVersionId } = await ChargeVersionHelper.add(
          { startDate: new Date('2023-04-01'), licenceId, licenceRef, regionCode, status: 'superseded' }
        )

        await ChargeReferenceHelper.add({
          chargeVersionId,
          chargeCategoryId,
          adjustments: { s127: true }
        })
      })

      it('returns no records', async () => {
        const results = await FetchChargeVersionsService.go(regionId, billingPeriod)

        expect(results).to.be.empty()
      })
    })

    describe('because the region is different', () => {
      beforeEach(async () => {
        const { id: chargeVersionId } = await ChargeVersionHelper.add(
          { startDate: new Date('2023-04-01'), licenceId, licenceRef, regionCode: 9 }
        )

        await ChargeReferenceHelper.add({
          chargeVersionId,
          chargeCategoryId,
          adjustments: { s127: true }
        })
      })

      it('returns no records', async () => {
        const results = await FetchChargeVersionsService.go(regionId, billingPeriod)

        expect(results).to.be.empty()
      })
    })

    describe('because the licence is linked to a workflow', () => {
      beforeEach(async () => {
        const { id: chargeVersionId } = await ChargeVersionHelper.add(
          { startDate: new Date('2023-04-01'), licenceId, licenceRef, regionCode }
        )

        await ChargeReferenceHelper.add({
          chargeVersionId,
          chargeCategoryId,
          adjustments: { s127: true }
        })

        await WorkflowHelper.add({ licenceId })
      })

      it('returns no records', async () => {
        const results = await FetchChargeVersionsService.go(regionId, billingPeriod)

        expect(results).to.be.empty()
      })
    })
  })
})
