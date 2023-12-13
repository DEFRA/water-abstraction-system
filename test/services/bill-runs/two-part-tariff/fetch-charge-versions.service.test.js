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
  describe('when there are charge versions', () => {
    const billingPeriod = {
      startDate: new Date('2022-04-01'),
      endDate: new Date('2023-03-31')
    }

    let region
    let regionId
    let licence
    let testRecords

    beforeEach(async () => {
      await DatabaseHelper.clean()

      region = await RegionHelper.add({ naldRegionId: 5 })
      regionId = region.id

      licence = await LicenceHelper.add({ regionId })
    })

    describe('and the scheme is SROC', () => {
      let chargeCategory
      let srocChargeReference
      let srocChargeElement

      beforeEach(async () => {
        const { id: licenceId, licenceRef } = licence

        const srocChargeVersion = await ChargeVersionHelper.add(
          { startDate: new Date('2022-04-01'), licenceId, licenceRef, regionCode: 5 }
        )

        chargeCategory = ChargeCategoryHelper.add()

        srocChargeReference = await ChargeReferenceHelper.add({
          chargeVersionId: srocChargeVersion.id,
          chargeCategoryId: chargeCategory.id,
          adjustments: { s127: true, aggregate: 0.562114443 }
        })

        srocChargeElement = await ChargeElementHelper.add({
          chargeReferenceId: srocChargeReference.id
        })

        testRecords = [
          srocChargeVersion,
          srocChargeReference,
          srocChargeElement
        ]
      })

      it('includes the related charge references and charge elements', async () => {
        const expectedLicence = {
          id: licence.id,
          licenceRef: licence.licenceRef,
          startDate: licence.startDate,
          expiredDate: null,
          lapsedDate: null,
          revokedDate: null
        }

        const expectedChargeReferenceAndElement = {
          id: srocChargeReference.id,
          volume: 6.82,
          description: srocChargeReference.description,
          aggregate: 0.562114443,
          s127: 'true',
          chargeCategory: null,
          chargeElements: [{
            id: srocChargeElement.id,
            description: srocChargeElement.description,
            abstractionPeriodStartDay: srocChargeElement.abstractionPeriodStartDay,
            abstractionPeriodStartMonth: srocChargeElement.abstractionPeriodStartMonth,
            abstractionPeriodEndDay: srocChargeElement.abstractionPeriodEndDay,
            abstractionPeriodEndMonth: srocChargeElement.abstractionPeriodEndMonth,
            authorisedAnnualQuantity: srocChargeElement.authorisedAnnualQuantity,
            purpose: null
          }]
        }

        const results = await FetchChargeVersionsService.go(regionId, billingPeriod)

        expect(results).to.have.length(1)
        expect(results[0].id).to.equal(testRecords[0].id)
        expect(results[0].status).to.equal('current')
        expect(results[0].licence).to.equal(expectedLicence)
        expect(results[0].chargeReferences[0]).to.equal(expectedChargeReferenceAndElement)
      })

      it('returns charge versions with correct ordering based on licence reference', async () => {
        const results = await FetchChargeVersionsService.go(regionId, billingPeriod)

        expect(results).to.have.length(1)
      })
    })

    describe('and the scheme is PRE SROC', () => {
      beforeEach(async () => {
        const { id: licenceId, licenceRef } = licence

        await ChargeVersionHelper.add(
          { scheme: 'alcs', licenceId, licenceRef, regionCode: 5 }
        )
      })

      it('does not return the charge version', async () => {
        const results = await FetchChargeVersionsService.go(regionId, billingPeriod)

        expect(results).to.have.length(0)
      })
    })

    describe('and the start date', () => {
      describe('is before the billing period end', () => {
        let testRecordsInDate
        let chargeCategory
        let inDateChargeReference
        let inDateChargeElement

        beforeEach(async () => {
          const { id: licenceId, licenceRef } = licence

          const inDateChargeVersion = await ChargeVersionHelper.add(
            { startDate: new Date('2022-04-01'), licenceId, licenceRef, regionCode: 5 }
          )

          chargeCategory = ChargeCategoryHelper.add()

          inDateChargeReference = await ChargeReferenceHelper.add({
            chargeVersionId: inDateChargeVersion.id,
            billingChargeCategoryId: chargeCategory.id,
            adjustments: { s127: true, aggregate: 0.562114443 }
          })

          inDateChargeElement = await ChargeElementHelper.add({
            chargeReferenceId: inDateChargeReference.id
          })

          testRecordsInDate = [
            inDateChargeVersion,
            inDateChargeReference,
            inDateChargeElement
          ]
        })

        it('returns the charge versions that are applicable', async () => {
          const results = await FetchChargeVersionsService.go(regionId, billingPeriod)

          expect(results).to.have.length(1)
          expect(results[0].id).to.include(testRecordsInDate[0].id)
        })
      })

      describe('is after the billing period end', () => {
        let chargeCategory
        let notInDateChargeReference

        beforeEach(async () => {
          const { id: licenceId, licenceRef } = licence

          const notInDateChargeVersion = await ChargeVersionHelper.add(
            { startDate: new Date('2023-04-01'), licenceId, licenceRef, regionCode: 5 }
          )

          chargeCategory = ChargeCategoryHelper.add()

          notInDateChargeReference = await ChargeReferenceHelper.add({
            chargeVersionId: notInDateChargeVersion.id,
            billingChargeCategoryId: chargeCategory.id,
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

    describe('and the charge version has a status of current', () => {
      let testRecordsCurrent
      let chargeCategory
      let currentChargeReference
      let currentChargeElement

      beforeEach(async () => {
        const { id: licenceId, licenceRef } = licence

        const currentChargeVersion = await ChargeVersionHelper.add(
          { startDate: new Date('2022-04-01'), licenceId, licenceRef, regionCode: 5 }
        )

        chargeCategory = ChargeCategoryHelper.add()

        currentChargeReference = await ChargeReferenceHelper.add({
          chargeVersionId: currentChargeVersion.id,
          billingChargeCategoryId: chargeCategory.id,
          adjustments: { s127: true, aggregate: 0.562114443 }
        })

        currentChargeElement = await ChargeElementHelper.add({
          chargeReferenceId: currentChargeReference.id
        })

        testRecordsCurrent = [
          currentChargeVersion,
          currentChargeReference,
          currentChargeElement
        ]
      })

      it('returns the charge versions that are applicable', async () => {
        const results = await FetchChargeVersionsService.go(regionId, billingPeriod)

        expect(results).to.have.length(1)
        expect(results[0].id).to.include(testRecordsCurrent[0].id)
      })
    })

    describe('and the charge version does not have a status of current', () => {
      let chargeCategory
      let notCurrentChargeReference

      beforeEach(async () => {
        const { id: licenceId, licenceRef } = licence

        const notCurrentChargeVersion = await ChargeVersionHelper.add(
          { status: 'superseded', licenceId, licenceRef, regionCode: 5 }
        )

        chargeCategory = ChargeCategoryHelper.add()

        notCurrentChargeReference = await ChargeReferenceHelper.add({
          chargeVersionId: notCurrentChargeVersion.id,
          billingChargeCategoryId: chargeCategory.id,
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
      let chargeCategory
      let sameRegionChargeReference
      let sameRegionChargeElement

      beforeEach(async () => {
        const { id: licenceId, licenceRef } = licence

        const sameRegionChargeVersion = await ChargeVersionHelper.add(
          { startDate: new Date('2022-04-01'), licenceId, licenceRef, regionCode: 5 }
        )

        chargeCategory = ChargeCategoryHelper.add()

        sameRegionChargeReference = await ChargeReferenceHelper.add({
          chargeVersionId: sameRegionChargeVersion.id,
          billingChargeCategoryId: chargeCategory.id,
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

      describe('has the same region code', () => {
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

          chargeCategory = ChargeCategoryHelper.add()

          differentRegionChargeReference = await ChargeReferenceHelper.add({
            chargeVersionId: differentRegionChargeVersion.id,
            billingChargeCategoryId: chargeCategory.id,
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

    describe('when there are multiple charge elements associated with the charge reference,', () => {
      let secondSrocChargeElement
      let firstSrocChargeElement
      let firstSrocChargeReference
      let chargeCategory

      beforeEach(async () => {
        const { id: licenceId, licenceRef } = licence

        const srocChargeVersion = await ChargeVersionHelper.add(
          { startDate: new Date('2022-04-01'), licenceId, licenceRef, regionCode: 5 }
        )

        chargeCategory = ChargeCategoryHelper.add()

        firstSrocChargeReference = await ChargeReferenceHelper.add({
          chargeVersionId: srocChargeVersion.id,
          billingChargeCategoryId: chargeCategory.id,
          adjustments: { s127: true, aggregate: 0.562114443 }
        })

        firstSrocChargeElement = await ChargeElementHelper.add({
          chargeReferenceId: firstSrocChargeReference.id
        })

        secondSrocChargeElement = await ChargeElementHelper.add({
          chargeReferenceId: firstSrocChargeReference.id,
          authorisedAnnualQuantity: firstSrocChargeElement.authorisedAnnualQuantity + 10
        })
      })

      it('returns the charge elements with correct ordering based on authorised annual quantity', async () => {
        const results = await FetchChargeVersionsService.go(regionId, billingPeriod)

        expect(results[0].chargeReferences[0].chargeElements[0].authorisedAnnualQuantity).to.equal(secondSrocChargeElement.authorisedAnnualQuantity)
        expect(results[0].chargeReferences[0].chargeElements[1].authorisedAnnualQuantity).to.equal(firstSrocChargeElement.authorisedAnnualQuantity)
      })
    })
  })
})
