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

  let chargeCategoryId
  let licence
  let regionId

  beforeEach(async () => {
    await DatabaseHelper.clean()

    const chargeCategory = ChargeCategoryHelper.add()
    chargeCategoryId = chargeCategory.id

    const region = await RegionHelper.add({ naldRegionId: regionCode })
    regionId = region.id

    licence = await LicenceHelper.add({ regionId })
  })

  describe('when there are charge versions', () => {
    describe('and the scheme is SROC', () => {
      let chargeVersionId

      beforeEach(async () => {
        const { id: licenceId, licenceRef } = licence

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

      it('includes the related charge references and charge elements', async () => {
        const results = await FetchChargeVersionsService.go(regionId, billingPeriod)

        expect(results).to.have.length(1)
        expect(results[0]).to.equal({
          id: chargeVersionId,
          startDate: new Date('2022-04-01'),
          endDate: null,
          status: 'current',
          licence: {
            id: licence.id,
            licenceRef: licence.licenceRef,
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

    describe('and the scheme is PRE SROC', () => {
      beforeEach(async () => {
        const { id: licenceId, licenceRef } = licence

        await ChargeVersionHelper.add(
          { scheme: 'alcs', licenceId, licenceRef, regionCode }
        )
      })

      it('does not return the charge version', async () => {
        const results = await FetchChargeVersionsService.go(regionId, billingPeriod)

        expect(results).to.have.length(0)
      })
    })

    describe('and the start date', () => {
      describe('is after the billing period end', () => {
        let notInDateChargeReference

        beforeEach(async () => {
          const { id: licenceId, licenceRef } = licence

          const notInDateChargeVersion = await ChargeVersionHelper.add(
            { startDate: new Date('2023-04-01'), licenceId, licenceRef, regionCode }
          )

          notInDateChargeReference = await ChargeReferenceHelper.add({
            chargeVersionId: notInDateChargeVersion.id,
            chargeCategoryId,
            adjustments: { s127: true, aggregate: 0.562114443 }
          })

          await ChargeElementHelper.add({
            chargeReferenceId: notInDateChargeReference.id
          })
        })

        it('returns the charge versions that are applicable', async () => {
          const results = await FetchChargeVersionsService.go(regionId, billingPeriod)

          expect(results).to.have.length(0)
          expect(results).to.equal([])
        })
      })
    })

    describe('and the charge version does not have a status of current', () => {
      let notCurrentChargeReference

      beforeEach(async () => {
        const { id: licenceId, licenceRef } = licence

        const notCurrentChargeVersion = await ChargeVersionHelper.add(
          { status: 'superseded', licenceId, licenceRef, regionCode }
        )

        notCurrentChargeReference = await ChargeReferenceHelper.add({
          chargeVersionId: notCurrentChargeVersion.id,
          chargeCategoryId,
          adjustments: { s127: true, aggregate: 0.562114443 }
        })

        await ChargeElementHelper.add({
          chargeReferenceId: notCurrentChargeReference.id
        })
      })

      it('returns the charge versions that are applicable', async () => {
        const results = await FetchChargeVersionsService.go(regionId, billingPeriod)

        expect(results).to.have.length(0)
      })
    })

    describe('and the licence associated with it', () => {
      let testRecordsSameRegion
      let sameRegionChargeReference
      let sameRegionChargeElement

      beforeEach(async () => {
        const { id: licenceId, licenceRef } = licence

        const sameRegionChargeVersion = await ChargeVersionHelper.add(
          { startDate: new Date('2022-04-01'), licenceId, licenceRef, regionCode }
        )

        sameRegionChargeReference = await ChargeReferenceHelper.add({
          chargeVersionId: sameRegionChargeVersion.id,
          chargeCategoryId,
          adjustments: { s127: true, aggregate: 0.562114443 }
        })

        sameRegionChargeElement = await ChargeElementHelper.add({
          chargeReferenceId: sameRegionChargeReference.id
        })

        testRecordsSameRegion = [
          sameRegionChargeVersion,
          sameRegionChargeReference,
          sameRegionChargeElement
        ]
      })

      describe('is in workflow', () => {
        beforeEach(async () => {
          await WorkflowHelper.add({ licenceId: licence.id })
        })

        it('does not return the related charge versions', async () => {
          const results = await FetchChargeVersionsService.go(regionId, billingPeriod)

          expect(results).to.equal([])
        })
      })

      describe('has a soft-deleted workflow record', () => {
        beforeEach(async () => {
          await WorkflowHelper.add({ licenceId: licence.id, deletedAt: new Date('2022-04-01') })
        })

        it('returns the charge versions that are applicable', async () => {
          const results = await FetchChargeVersionsService.go(regionId, billingPeriod)

          expect(results).to.have.length(1)
          expect(results[0].id).to.include(testRecordsSameRegion[0].id)
        })
      })

      describe('does not have the same region code', () => {
        let differentRegionChargeReference

        beforeEach(async () => {
          const { id: licenceId, licenceRef } = licence

          const differentRegionChargeVersion = await ChargeVersionHelper.add(
            { startDate: new Date('2022-04-01'), licenceId, licenceRef, regionCode: 4 }
          )

          differentRegionChargeReference = await ChargeReferenceHelper.add({
            chargeVersionId: differentRegionChargeVersion.id,
            chargeCategoryId,
            adjustments: { s127: true, aggregate: 0.562114443 }
          })

          await ChargeElementHelper.add({
            chargeReferenceId: differentRegionChargeReference.id
          })
        })

        it('returns the charge versions that are applicable', async () => {
          const result = await FetchChargeVersionsService.go(regionId, billingPeriod)

          expect(result).to.have.length(1)
          expect(result[0].id).to.include(testRecordsSameRegion[0].id)
        })
      })
    })
  })
})
