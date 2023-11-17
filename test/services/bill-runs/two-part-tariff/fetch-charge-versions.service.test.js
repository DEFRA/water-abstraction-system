'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ChargeCategoryHelper = require('../../../support/helpers/water/charge-category.helper.js')
const ChargeElementHelper = require('../../../support/helpers/water/charge-element.helper.js')
const ChargeReferenceHelper = require('../../../support/helpers/water/charge-reference.helper.js')
const ChargeVersionHelper = require('../../../support/helpers/water/charge-version.helper.js')
const WorkflowHelper = require('../../../support/helpers/water/workflow.helper.js')
const DatabaseHelper = require('../../../support/helpers/database.helper.js')
const LicenceHelper = require('../../../support/helpers/water/licence.helper.js')
const RegionHelper = require('../../../support/helpers/water/region.helper.js')

// Thing under test
const FetchChargeVersionsService = require('../../../../app/services/bill-runs/two-part-tariff/fetch-charge-versions.service')

describe('Fetch Charge Versions service', () => {
  describe('when there are charge versions', () => {
    const regionCode = 5
    let region
    let regionId
    let licence
    let testRecords
    let billingPeriod

    beforeEach(async () => {
      await DatabaseHelper.clean()

      region = await RegionHelper.add({ naldRegionId: 5 })
      regionId = region.regionId

      billingPeriod = {
        startDate: new Date('2022-04-01'),
        endDate: new Date('2023-03-31')
      }

      licence = await LicenceHelper.add({
        regionId
      })
    })

    describe('and the scheme is SROC', () => {
      let chargeCategory
      let srocChargeReference
      let srocChargeElement

      beforeEach(async () => {
        const { licenceId, licenceRef } = licence

        const srocChargeVersion = await ChargeVersionHelper.add(
          { startDate: new Date('2022-04-01'), licenceId, licenceRef, regionCode: 5 }
        )

        chargeCategory = ChargeCategoryHelper.add()

        srocChargeReference = await ChargeReferenceHelper.add({
          chargeVersionId: srocChargeVersion.chargeVersionId,
          billingChargeCategoryId: chargeCategory.billingChargeCategoryId,
          adjustments: { s127: true, aggregate: 0.562114443 }
        })

        srocChargeElement = await ChargeElementHelper.add({
          chargeElementId: srocChargeReference.chargeElementId
        })

        testRecords = [
          srocChargeVersion,
          srocChargeReference,
          srocChargeElement
        ]
      })

      it('includes the related charge references and charge elements', async () => {
        const expectedLicence = {
          licenceId: licence.licenceId,
          licenceRef: licence.licenceRef,
          startDate: licence.startDate,
          expiredDate: null,
          lapsedDate: null,
          revokedDate: null
        }

        const expectedChargeReferenceAndElement = {
          chargeElementId: srocChargeReference.chargeElementId,
          description: srocChargeReference.description,
          aggregate: 0.562114443,
          s127: 'true',
          chargeCategory: null,
          chargeElements: [{
            chargePurposeId: srocChargeElement.chargePurposeId,
            description: srocChargeElement.description,
            abstractionPeriodStartDay: srocChargeElement.abstractionPeriodStartDay,
            abstractionPeriodStartMonth: srocChargeElement.abstractionPeriodStartMonth,
            abstractionPeriodEndDay: srocChargeElement.abstractionPeriodEndDay,
            abstractionPeriodEndMonth: srocChargeElement.abstractionPeriodEndMonth,
            authorisedAnnualQuantity: srocChargeElement.authorisedAnnualQuantity,
            purpose: null
          }]
        }

        const result = await FetchChargeVersionsService.go(regionCode, billingPeriod)

        expect(result).to.have.length(1)
        expect(result[0].chargeVersionId).to.include(testRecords[0].chargeVersionId)
        expect(result[0].status).to.equal('current')
        expect(result[0].licence).to.equal(expectedLicence)
        expect(result[0].chargeReferences[0]).to.equal(expectedChargeReferenceAndElement)
      })

      it('returns charge versions with correct ordering based on licence reference', async () => {
        const result = await FetchChargeVersionsService.go(regionCode, billingPeriod)

        expect(result).to.have.length(1)
      })
    })

    describe('and the scheme is PRE SROC', () => {
      beforeEach(async () => {
        const { licenceId, licenceRef } = licence

        await ChargeVersionHelper.add(
          { scheme: 'alcs', licenceId, licenceRef, regionCode: 5 }
        )
      })

      it('doesnt return the charge version', async () => {
        const result = await FetchChargeVersionsService.go(regionCode, billingPeriod)

        expect(result).to.have.length(0)
      })
    })

    describe('and the start date', () => {
      describe('is before the billing period end', () => {
        let testRecordsInDate
        let chargeCategory
        let inDateChargeReference
        let inDateChargeElement

        beforeEach(async () => {
          const { licenceId, licenceRef } = licence

          const inDateChargeVersion = await ChargeVersionHelper.add(
            { startDate: new Date('2022-04-01'), licenceId, licenceRef, regionCode: 5 }
          )

          chargeCategory = ChargeCategoryHelper.add()

          inDateChargeReference = await ChargeReferenceHelper.add({
            chargeVersionId: inDateChargeVersion.chargeVersionId,
            billingChargeCategoryId: chargeCategory.billingChargeCategoryId,
            adjustments: { s127: true, aggregate: 0.562114443 }
          })

          inDateChargeElement = await ChargeElementHelper.add({
            chargeElementId: inDateChargeReference.chargeElementId
          })

          testRecordsInDate = [
            inDateChargeVersion,
            inDateChargeReference,
            inDateChargeElement
          ]
        })

        it('returns the charge versions that are applicable', async () => {
          const result = await FetchChargeVersionsService.go(regionCode, billingPeriod)

          expect(result).to.have.length(1)
          expect(result[0].chargeVersionId).to.include(testRecordsInDate[0].chargeVersionId)
        })
      })

      describe('is after the billing period end', () => {
        let chargeCategory
        let notInDateChargeReference

        beforeEach(async () => {
          const { licenceId, licenceRef } = licence

          const notInDateChargeVersion = await ChargeVersionHelper.add(
            { startDate: new Date('2023-04-01'), licenceId, licenceRef, regionCode: 5 }
          )

          chargeCategory = ChargeCategoryHelper.add()

          notInDateChargeReference = await ChargeReferenceHelper.add({
            chargeVersionId: notInDateChargeVersion.chargeVersionId,
            billingChargeCategoryId: chargeCategory.billingChargeCategoryId,
            adjustments: { s127: true, aggregate: 0.562114443 }
          })

          await ChargeElementHelper.add({
            chargeElementId: notInDateChargeReference.chargeElementId
          })
        })

        it('returns the charge versions that are applicable', async () => {
          const result = await FetchChargeVersionsService.go(regionCode, billingPeriod)

          expect(result).to.have.length(0)
          expect(result).to.equal([])
        })
      })
    })

    describe('and the charge version has a status of current', () => {
      let testRecordsCurrent
      let chargeCategory
      let currentChargeReference
      let currentChargeElement

      beforeEach(async () => {
        const { licenceId, licenceRef } = licence

        const currentChargeVersion = await ChargeVersionHelper.add(
          { startDate: new Date('2022-04-01'), licenceId, licenceRef, regionCode: 5 }
        )

        chargeCategory = ChargeCategoryHelper.add()

        currentChargeReference = await ChargeReferenceHelper.add({
          chargeVersionId: currentChargeVersion.chargeVersionId,
          billingChargeCategoryId: chargeCategory.billingChargeCategoryId,
          adjustments: { s127: true, aggregate: 0.562114443 }
        })

        currentChargeElement = await ChargeElementHelper.add({
          chargeElementId: currentChargeReference.chargeElementId
        })

        testRecordsCurrent = [
          currentChargeVersion,
          currentChargeReference,
          currentChargeElement
        ]
      })

      it('returns the charge versions that are applicable', async () => {
        const result = await FetchChargeVersionsService.go(regionCode, billingPeriod)

        expect(result).to.have.length(1)
        expect(result[0].chargeVersionId).to.include(testRecordsCurrent[0].chargeVersionId)
      })
    })

    describe('and the charge version doesnt have a status of current', () => {
      let chargeCategory
      let notCurrentChargeReference

      beforeEach(async () => {
        const { licenceId, licenceRef } = licence

        const notCurrentChargeVersion = await ChargeVersionHelper.add(
          { status: 'superseded', licenceId, licenceRef, regionCode: 5 }
        )

        chargeCategory = ChargeCategoryHelper.add()

        notCurrentChargeReference = await ChargeReferenceHelper.add({
          chargeVersionId: notCurrentChargeVersion.chargeVersionId,
          billingChargeCategoryId: chargeCategory.billingChargeCategoryId,
          adjustments: { s127: true, aggregate: 0.562114443 }
        })

        await ChargeElementHelper.add({
          chargeElementId: notCurrentChargeReference.chargeElementId
        })
      })

      it('returns the charge versions that are applicable', async () => {
        const result = await FetchChargeVersionsService.go(regionCode, billingPeriod)

        expect(result).to.have.length(0)
      })
    })

    describe('and the licence associated with it', () => {
      let testRecordsSameRegion
      let chargeCategory
      let sameRegionChargeReference
      let sameRegionChargeElement

      beforeEach(async () => {
        const { licenceId, licenceRef } = licence

        const sameRegionChargeVersion = await ChargeVersionHelper.add(
          { startDate: new Date('2022-04-01'), licenceId, licenceRef, regionCode: 5 }
        )

        chargeCategory = ChargeCategoryHelper.add()

        sameRegionChargeReference = await ChargeReferenceHelper.add({
          chargeVersionId: sameRegionChargeVersion.chargeVersionId,
          billingChargeCategoryId: chargeCategory.billingChargeCategoryId,
          adjustments: { s127: true, aggregate: 0.562114443 }
        })

        sameRegionChargeElement = await ChargeElementHelper.add({
          chargeElementId: sameRegionChargeReference.chargeElementId
        })

        testRecordsSameRegion = [
          sameRegionChargeVersion,
          sameRegionChargeReference,
          sameRegionChargeElement
        ]
      })

      describe('is in workflow', () => {
        beforeEach(async () => {
          await WorkflowHelper.add({ licenceId: licence.licenceId })
        })

        it('does not return the related charge versions', async () => {
          const result = await FetchChargeVersionsService.go(regionCode, billingPeriod)

          expect(result).to.equal([])
        })
      })

      describe('has a soft-deleted workflow record', () => {
        beforeEach(async () => {
          await WorkflowHelper.add({ licenceId: licence.licenceId, dateDeleted: new Date('2022-04-01') })
        })

        it('returns the charge versions that are applicable', async () => {
          const result = await FetchChargeVersionsService.go(regionCode, billingPeriod)

          expect(result).to.have.length(1)
          expect(result[0].chargeVersionId).to.include(testRecordsSameRegion[0].chargeVersionId)
        })
      })

      describe('has the same region code', () => {
        it('returns the charge versions that are applicable', async () => {
          const result = await FetchChargeVersionsService.go(regionCode, billingPeriod)

          expect(result).to.have.length(1)
          expect(result[0].chargeVersionId).to.include(testRecordsSameRegion[0].chargeVersionId)
        })
      })

      describe('doesnt have the same region code', () => {
        let differentRegionChargeReference

        beforeEach(async () => {
          const { licenceId, licenceRef } = licence

          const differentRegionChargeVersion = await ChargeVersionHelper.add(
            { startDate: new Date('2022-04-01'), licenceId, licenceRef, regionCode: 4 }
          )

          chargeCategory = ChargeCategoryHelper.add()

          differentRegionChargeReference = await ChargeReferenceHelper.add({
            chargeVersionId: differentRegionChargeVersion.chargeVersionId,
            billingChargeCategoryId: chargeCategory.billingChargeCategoryId,
            adjustments: { s127: true, aggregate: 0.562114443 }
          })

          await ChargeElementHelper.add({
            chargeElementId: differentRegionChargeReference.chargeElementId
          })
        })

        it('returns the charge versions that are applicable', async () => {
          const result = await FetchChargeVersionsService.go(regionCode, billingPeriod)

          expect(result).to.have.length(1)
          expect(result[0].chargeVersionId).to.include(testRecordsSameRegion[0].chargeVersionId)
        })
      })
    })

    describe('when there are multiple charge elements associated with the charge reference,', () => {
      let secondSrocChargeElement
      let firstSrocChargeElement
      let firstSrocChargeReference
      let chargeCategory

      beforeEach(async () => {
        const { licenceId, licenceRef } = licence

        const srocChargeVersion = await ChargeVersionHelper.add(
          { startDate: new Date('2022-04-01'), licenceId, licenceRef, regionCode: 5 }
        )

        chargeCategory = ChargeCategoryHelper.add()

        firstSrocChargeReference = await ChargeReferenceHelper.add({
          chargeVersionId: srocChargeVersion.chargeVersionId,
          billingChargeCategoryId: chargeCategory.billingChargeCategoryId,
          adjustments: { s127: true, aggregate: 0.562114443 }
        })

        firstSrocChargeElement = await ChargeElementHelper.add({
          chargeElementId: firstSrocChargeReference.chargeElementId
        })

        secondSrocChargeElement = await ChargeElementHelper.add({
          chargeElementId: firstSrocChargeReference.chargeElementId,
          authorisedAnnualQuantity: firstSrocChargeElement.authorisedAnnualQuantity + 10
        })
      })

      it('returns the charge elements with correct ordering based on authorised annual quantity', async () => {
        const result = await FetchChargeVersionsService.go(regionCode, billingPeriod)

        expect(result[0].chargeReferences[0].chargeElements[0].authorisedAnnualQuantity).to.equal(secondSrocChargeElement.authorisedAnnualQuantity)
        expect(result[0].chargeReferences[0].chargeElements[1].authorisedAnnualQuantity).to.equal(firstSrocChargeElement.authorisedAnnualQuantity)
      })
    })
  })
})
