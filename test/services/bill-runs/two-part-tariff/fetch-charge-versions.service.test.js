'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ChangeReasonHelper = require('../../../support/helpers/change-reason.helper.js')
const ChargeCategoryHelper = require('../../../support/helpers/charge-category.helper.js')
const ChargeElementHelper = require('../../../support/helpers/charge-element.helper.js')
const ChargeReferenceHelper = require('../../../support/helpers/charge-reference.helper.js')
const ChargeVersionHelper = require('../../../support/helpers/charge-version.helper.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const LicenceHolderSeeder = require('../../../support/seeders/licence-holder.seeder.js')
const PurposeHelper = require('../../../support/helpers/purpose.helper.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')
const WorkflowHelper = require('../../../support/helpers/workflow.helper.js')

// Thing under test
const FetchChargeVersionsService = require('../../../../app/services/bill-runs/two-part-tariff/fetch-charge-versions.service.js')

const CHANGE_NEW_AGREEMENT_INDEX = 2
const PURPOSE_SPRAY_IRRIGATION_INDEX = 41
const REGION_NORTH_EAST_INDEX = 2
const REGION_NORTH_WEST_INDEX = 3

describe('Fetch Charge Versions service', () => {
  const billingPeriod = {
    startDate: new Date('2023-04-01'),
    endDate: new Date('2024-03-31')
  }

  let changeReason
  let chargeCategory
  let chargeElement1
  let chargeElement2
  let chargeReference
  let chargeVersion
  let licence
  let licenceHolderDetails
  let otherChargeVersion
  let otherChargeReference
  let otherLicence
  let region
  let purpose

  before(async () => {
    purpose = PurposeHelper.select(PURPOSE_SPRAY_IRRIGATION_INDEX)
    chargeCategory = await ChargeCategoryHelper.add()
    changeReason = ChangeReasonHelper.select(CHANGE_NEW_AGREEMENT_INDEX)
  })

  describe('when there are no applicable charge versions', () => {
    before(() => {
      region = RegionHelper.select(REGION_NORTH_WEST_INDEX)
    })

    describe('because the scheme is "presroc"', () => {
      beforeEach(async () => {
        licence = await LicenceHelper.add({ regionId: region.id })

        chargeVersion = await ChargeVersionHelper.add(
          { licenceId: licence.id, licenceRef: licence.licenceRef, scheme: 'alcs' }
        )

        chargeReference = await ChargeReferenceHelper.add(
          { adjustments: { s127: true }, chargeVersionId: chargeVersion.id, chargeCategory: chargeCategory.id }
        )
      })

      it('returns no records', async () => {
        const results = await FetchChargeVersionsService.go(region.id, billingPeriod)

        expect(results).to.be.empty()
      })
    })

    describe('because the start date is after the billing period ends', () => {
      beforeEach(async () => {
        licence = await LicenceHelper.add({ regionId: region.id })

        chargeVersion = await ChargeVersionHelper.add(
          { licenceId: licence.id, licenceRef: licence.licenceRef, startDate: new Date('2024-04-01') }
        )

        chargeReference = await ChargeReferenceHelper.add(
          { adjustments: { s127: true }, chargeVersionId: chargeVersion.id, chargeCategory: chargeCategory.id }
        )
      })

      it('returns no records', async () => {
        const results = await FetchChargeVersionsService.go(region.id, billingPeriod)

        expect(results).to.be.empty()
      })
    })

    describe('because the end date is before the billing period starts', () => {
      beforeEach(async () => {
        licence = await LicenceHelper.add({ regionId: region.id })

        chargeVersion = await ChargeVersionHelper.add(
          { endDate: new Date('2023-03-31'), licenceId: licence.id, licenceRef: licence.licenceRef }
        )

        chargeReference = await ChargeReferenceHelper.add(
          { adjustments: { s127: true }, chargeVersionId: chargeVersion.id, chargeCategory: chargeCategory.id }
        )
      })

      it('returns no records', async () => {
        const results = await FetchChargeVersionsService.go(region.id, billingPeriod)

        expect(results).to.be.empty()
      })
    })

    describe('because the status is not "current"', () => {
      beforeEach(async () => {
        licence = await LicenceHelper.add({ regionId: region.id })

        chargeVersion = await ChargeVersionHelper.add(
          { licenceId: licence.id, licenceRef: licence.licenceRef, status: 'superseded' }
        )

        chargeReference = await ChargeReferenceHelper.add(
          { adjustments: { s127: true }, chargeVersionId: chargeVersion.id, chargeCategory: chargeCategory.id }
        )
      })

      it('returns no records', async () => {
        const results = await FetchChargeVersionsService.go(region.id, billingPeriod)

        expect(results).to.be.empty()
      })
    })

    describe('because the region is different', () => {
      beforeEach(async () => {
        licence = await LicenceHelper.add({ regionId: generateUUID() })

        chargeVersion = await ChargeVersionHelper.add({ licenceId: licence.id, licenceRef: licence.licenceRef })

        chargeReference = await ChargeReferenceHelper.add(
          { adjustments: { s127: true }, chargeVersionId: chargeVersion.id, chargeCategory: chargeCategory.id }
        )
      })

      it('returns no records', async () => {
        const results = await FetchChargeVersionsService.go(region.id, billingPeriod)

        expect(results).to.be.empty()
      })
    })

    describe('because the licence is linked to a workflow', () => {
      beforeEach(async () => {
        licence = await LicenceHelper.add({ regionId: region.id })

        chargeVersion = await ChargeVersionHelper.add(
          { licenceId: licence.id, licenceRef: licence.licenceRef }
        )

        chargeReference = await ChargeReferenceHelper.add(
          { adjustments: { s127: true }, chargeVersionId: chargeVersion.id, chargeCategory: chargeCategory.id }
        )

        await WorkflowHelper.add({ licenceId: licence.id })
      })

      it('returns no records', async () => {
        const results = await FetchChargeVersionsService.go(region.id, billingPeriod)

        expect(results).to.be.empty()
      })
    })

    describe('because the licence ended (expired, lapsed or revoked) before the billing period', () => {
      beforeEach(async () => {
        // NOTE: To make things spicy (!) we have the licence expire _after_ the billing period starts but revoked
        // before it. Where the licence has dates in more than one of these fields, it is considered ended on the
        // earliest of them (we have found real examples that confirm this is possible)
        licence = await LicenceHelper.add(
          { expiredDate: new Date('2019-05-01'), regionId: region.id, revokedDate: new Date('2022-06-01') }
        )

        chargeVersion = await ChargeVersionHelper.add(
          { licenceId: licence.id, licenceRef: licence.licenceRef }
        )

        chargeReference = await ChargeReferenceHelper.add(
          { adjustments: { s127: true }, chargeVersionId: chargeVersion.id, chargeCategory: chargeCategory.id }
        )
      })

      it('returns no records', async () => {
        const results = await FetchChargeVersionsService.go(region.id, billingPeriod)

        expect(results).to.be.empty()
      })
    })
  })

  describe('when there are applicable charge versions', () => {
    before(async () => {
      region = RegionHelper.select(REGION_NORTH_EAST_INDEX)

      licence = await LicenceHelper.add({ licenceRef: '01/128', regionId: region.id })

      // NOTE: The first part of the setup creates a charge version we will test exactly matches what we expect. The
      // second part is to create another charge version with a different licence ref so we can test the order of the
      // results
      chargeVersion = await ChargeVersionHelper.add({
        changeReasonId: changeReason.id, licenceId: licence.id, licenceRef: licence.licenceRef
      })

      chargeReference = await ChargeReferenceHelper.add({
        chargeVersionId: chargeVersion.id,
        chargeCategoryId: chargeCategory.id,
        adjustments: { s127: true, aggregate: 0.562114443 }
      })

      chargeElement1 = await ChargeElementHelper.add({
        chargeReferenceId: chargeReference.id,
        authorisedAnnualQuantity: 100,
        purposeId: purpose.id
      })

      chargeElement2 = await ChargeElementHelper.add({
        chargeReferenceId: chargeReference.id,
        authorisedAnnualQuantity: 200,
        purposeId: purpose.id
      })

      // Create a licence holder for the licence with the default name 'Licence Holder Ltd'
      licenceHolderDetails = await LicenceHolderSeeder.seed(licence.licenceRef)

      // Second charge version to test ordering
      otherLicence = await LicenceHelper.add({ licenceRef: '01/130', regionId: region.id })
      otherChargeVersion = await ChargeVersionHelper.add(
        { changeReasonId: changeReason.id, licenceId: otherLicence.id, licenceRef: otherLicence.licenceRef }
      )
      otherChargeReference = await ChargeReferenceHelper.add({
        chargeVersionId: otherChargeVersion.id,
        chargeCategoryId: chargeCategory.id,
        adjustments: { s127: true }
      })

      await ChargeElementHelper.add({
        chargeReferenceId: otherChargeReference.id,
        authorisedAnnualQuantity: 100,
        purposeId: purpose.id
      })
    })

    it('returns the charge version with related licence, charge references and charge elements', async () => {
      const results = await FetchChargeVersionsService.go(region.id, billingPeriod)

      expect(results).to.have.length(2)
      expect(results[0]).to.equal({
        id: chargeVersion.id,
        startDate: new Date('2022-04-01'),
        endDate: null,
        status: 'current',
        licence: {
          id: licence.id,
          licenceRef: licence.licenceRef,
          startDate: new Date('2022-01-01'),
          expiredDate: null,
          lapsedDate: null,
          revokedDate: null,
          licenceDocument: {
            id: licenceHolderDetails.licenceDocumentId,
            licenceDocumentRoles: [
              {
                company: {
                  id: licenceHolderDetails.companyId,
                  name: 'Licence Holder Ltd',
                  type: 'organisation'
                },
                contact: null,
                id: licenceHolderDetails.licenceDocumentRoleId
              }
            ]
          }
        },
        chargeReferences: [{
          id: chargeReference.id,
          volume: 6.819,
          description: 'Mineral washing',
          aggregate: 0.562114443,
          s126: null,
          s127: 'true',
          s130: null,
          winter: null,
          charge: null,
          chargeCategory: {
            reference: chargeCategory.reference,
            shortDescription: 'Low loss, non-tidal, restricted water, up to and including 5,000 ML/yr, Tier 1 model',
            subsistenceCharge: 12000
          },
          chargeElements: [
            {
              id: chargeElement2.id,
              description: 'Trickle Irrigation - Direct',
              abstractionPeriodStartDay: 1,
              abstractionPeriodStartMonth: 4,
              abstractionPeriodEndDay: 31,
              abstractionPeriodEndMonth: 3,
              authorisedAnnualQuantity: 200,
              purpose: {
                id: purpose.id,
                legacyId: purpose.legacyId,
                description: purpose.description
              }
            },
            {
              id: chargeElement1.id,
              description: 'Trickle Irrigation - Direct',
              abstractionPeriodStartDay: 1,
              abstractionPeriodStartMonth: 4,
              abstractionPeriodEndDay: 31,
              abstractionPeriodEndMonth: 3,
              authorisedAnnualQuantity: 100,
              purpose: {
                id: purpose.id,
                legacyId: purpose.legacyId,
                description: purpose.description
              }
            }
          ]
        }],
        changeReason: {
          description: changeReason.description
        }
      })
    })

    it('returns the charge versions ordered by licence reference', async () => {
      const results = await FetchChargeVersionsService.go(region.id, billingPeriod)

      expect(results[0].licence.licenceRef).to.equal(licence.licenceRef)
      expect(results[1].licence.licenceRef).to.equal(otherLicence.licenceRef)
    })

    it('returns the charge elements within each charge version ordered by authorised annual quantity', async () => {
      const results = await FetchChargeVersionsService.go(region.id, billingPeriod)

      expect(results[0].chargeReferences[0].chargeElements[0].id).to.equal(chargeElement2.id)
      expect(results[0].chargeReferences[0].chargeElements[1].id).to.equal(chargeElement1.id)
    })
  })
})
