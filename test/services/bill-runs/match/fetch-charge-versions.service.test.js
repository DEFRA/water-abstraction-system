'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const CRMContactsSeeder = require('../../../support/seeders/crm-contacts.seeder.js')
const ChangeReasonHelper = require('../../../support/helpers/change-reason.helper.js')
const ChargeCategoryHelper = require('../../../support/helpers/charge-category.helper.js')
const ChargeElementHelper = require('../../../support/helpers/charge-element.helper.js')
const ChargeReferenceHelper = require('../../../support/helpers/charge-reference.helper.js')
const ChargeVersionHelper = require('../../../support/helpers/charge-version.helper.js')
const EmptyLicenceSeeder = require('../../../support/seeders/empty-licence.seeder.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const LicenceSupplementaryYearHelper = require('../../../support/helpers/licence-supplementary-year.helper.js')
const PurposeHelper = require('../../../support/helpers/purpose.helper.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')
const WorkflowHelper = require('../../../support/helpers/workflow.helper.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const FetchChargeVersionsService = require('../../../../app/services/bill-runs/match/fetch-charge-versions.service.js')

const CHANGE_NEW_AGREEMENT_INDEX = 2
const PURPOSE_SPRAY_IRRIGATION_INDEX = 41

// NOTE: These are declared outside the describe to make them accessible to our `_cleanUp()` function
let billRun
let chargeElement1
let chargeElement2
let chargeReference
let chargeVersion
let licence
let licenceSeedData
let licenceHolderDetails
let licenceSupplementaryYear
let otherChargeVersion
let otherChargeReference
let otherLicence
let supplementary

describe('Bill Runs - Match - Fetch Charge Versions service', () => {
  const billingPeriod = {
    startDate: new Date('2023-04-01'),
    endDate: new Date('2024-03-31')
  }
  const region = RegionHelper.select(RegionHelper.BILL_RUN_REGION_INDEX)

  let changeReason
  let chargeCategory
  let purpose

  before(async () => {
    purpose = PurposeHelper.select(PURPOSE_SPRAY_IRRIGATION_INDEX)
    chargeCategory = ChargeCategoryHelper.select()
    changeReason = ChangeReasonHelper.select(CHANGE_NEW_AGREEMENT_INDEX)
  })

  afterEach(async () => {
    if (billRun) await billRun.$query().delete()
    if (chargeElement1) await chargeElement1.$query().delete()
    if (chargeElement2) await chargeElement2.$query().delete()
    if (chargeReference) await chargeReference.$query().delete()
    if (chargeVersion) await chargeVersion.$query().delete()
    if (licence) await licence.$query().delete()
    if (licenceSeedData) await licenceSeedData.clean()
    if (licenceSupplementaryYear) await licenceSupplementaryYear.$query().delete()
    if (otherChargeReference) await otherChargeReference.$query().delete()
    if (otherChargeVersion) await otherChargeVersion.$query().delete()
    if (otherLicence) await otherLicence.clean()

    if (licenceHolderDetails) {
      await licenceHolderDetails.clean()
    }
  })

  describe('when there are no applicable charge versions', () => {
    describe('because their scheme is "presroc"', () => {
      beforeEach(async () => {
        billRun = await BillRunHelper.add({ batchType: 'two_part_tariff', regionId: region.id, scheme: 'sroc' })

        licence = await LicenceHelper.add({ regionId: region.id })

        chargeVersion = await ChargeVersionHelper.add({
          licenceId: licence.id,
          licenceRef: licence.licenceRef,
          scheme: 'alcs'
        })

        chargeReference = await ChargeReferenceHelper.add({
          adjustments: { s127: true },
          chargeVersionId: chargeVersion.id,
          chargeCategory: chargeCategory.id
        })
      })

      it('returns no records', async () => {
        const results = await FetchChargeVersionsService.go(billRun, billingPeriod)

        expect(results).to.be.empty()
      })
    })

    describe('because the start date is after the billing period ends', () => {
      beforeEach(async () => {
        billRun = await BillRunHelper.add({ batchType: 'two_part_tariff', regionId: region.id, scheme: 'sroc' })

        licence = await LicenceHelper.add({ regionId: region.id })

        chargeVersion = await ChargeVersionHelper.add({
          licenceId: licence.id,
          licenceRef: licence.licenceRef,
          startDate: new Date('2024-04-01')
        })

        chargeReference = await ChargeReferenceHelper.add({
          adjustments: { s127: true },
          chargeVersionId: chargeVersion.id,
          chargeCategory: chargeCategory.id
        })
      })

      it('returns no records', async () => {
        const results = await FetchChargeVersionsService.go(billRun, billingPeriod)

        expect(results).to.be.empty()
      })
    })

    describe('because the end date is before the billing period starts', () => {
      beforeEach(async () => {
        billRun = await BillRunHelper.add({ batchType: 'two_part_tariff', regionId: region.id, scheme: 'sroc' })

        licence = await LicenceHelper.add({ regionId: region.id })

        chargeVersion = await ChargeVersionHelper.add({
          endDate: new Date('2023-03-31'),
          licenceId: licence.id,
          licenceRef: licence.licenceRef
        })

        chargeReference = await ChargeReferenceHelper.add({
          adjustments: { s127: true },
          chargeVersionId: chargeVersion.id,
          chargeCategory: chargeCategory.id
        })
      })

      it('returns no records', async () => {
        const results = await FetchChargeVersionsService.go(billRun, billingPeriod)

        expect(results).to.be.empty()
      })
    })

    describe('because the status is not "current"', () => {
      beforeEach(async () => {
        billRun = await BillRunHelper.add({ batchType: 'two_part_tariff', regionId: region.id, scheme: 'sroc' })

        licence = await LicenceHelper.add({ regionId: region.id })

        chargeVersion = await ChargeVersionHelper.add({
          licenceId: licence.id,
          licenceRef: licence.licenceRef,
          status: 'superseded'
        })

        chargeReference = await ChargeReferenceHelper.add({
          adjustments: { s127: true },
          chargeVersionId: chargeVersion.id,
          chargeCategory: chargeCategory.id
        })
      })

      it('returns no records', async () => {
        const results = await FetchChargeVersionsService.go(billRun, billingPeriod)

        expect(results).to.be.empty()
      })
    })

    describe('because the region is different', () => {
      beforeEach(async () => {
        billRun = await BillRunHelper.add({ batchType: 'two_part_tariff', regionId: region.id, scheme: 'sroc' })

        licence = await LicenceHelper.add({ regionId: generateUUID() })

        chargeVersion = await ChargeVersionHelper.add({ licenceId: licence.id, licenceRef: licence.licenceRef })

        chargeReference = await ChargeReferenceHelper.add({
          adjustments: { s127: true },
          chargeVersionId: chargeVersion.id,
          chargeCategory: chargeCategory.id
        })
      })

      it('returns no records', async () => {
        const results = await FetchChargeVersionsService.go(billRun, billingPeriod)

        expect(results).to.be.empty()
      })
    })

    describe('because the licence is linked to a workflow', () => {
      beforeEach(async () => {
        billRun = await BillRunHelper.add({ batchType: 'two_part_tariff', regionId: region.id, scheme: 'sroc' })

        licence = await LicenceHelper.add({ regionId: region.id })

        chargeVersion = await ChargeVersionHelper.add({ licenceId: licence.id, licenceRef: licence.licenceRef })

        chargeReference = await ChargeReferenceHelper.add({
          adjustments: { s127: true },
          chargeVersionId: chargeVersion.id,
          chargeCategory: chargeCategory.id
        })

        await WorkflowHelper.add({ licenceId: licence.id })
      })

      it('returns no records', async () => {
        const results = await FetchChargeVersionsService.go(billRun, billingPeriod)

        expect(results).to.be.empty()
      })
    })

    describe('because the licence ended (expired, lapsed or revoked) before the billing period', () => {
      beforeEach(async () => {
        billRun = await BillRunHelper.add({ batchType: 'two_part_tariff', regionId: region.id, scheme: 'sroc' })

        // NOTE: To make things spicy (!) we have the licence expire _after_ the billing period starts but revoked
        // before it. Where the licence has dates in more than one of these fields, it is considered ended on the
        // earliest of them (we have found real examples that confirm this is possible)
        licence = await LicenceHelper.add({
          expiredDate: new Date('2019-05-01'),
          regionId: region.id,
          revokedDate: new Date('2022-06-01')
        })

        chargeVersion = await ChargeVersionHelper.add({ licenceId: licence.id, licenceRef: licence.licenceRef })

        chargeReference = await ChargeReferenceHelper.add({
          adjustments: { s127: true },
          chargeVersionId: chargeVersion.id,
          chargeCategory: chargeCategory.id
        })
      })

      it('returns no records', async () => {
        const results = await FetchChargeVersionsService.go(billRun, billingPeriod)

        expect(results).to.be.empty()
      })
    })

    describe('because the licence ended (expired, lapsed or revoked) before the charge version starts', () => {
      beforeEach(async () => {
        billRun = await BillRunHelper.add({ batchType: 'two_part_tariff', regionId: region.id, scheme: 'sroc' })

        licence = await LicenceHelper.add({ revokedDate: new Date('2023-06-01'), regionId: region.id })

        chargeVersion = await ChargeVersionHelper.add({
          licenceId: licence.id,
          licenceRef: licence.licenceRef,
          startDate: new Date('2023-07-01')
        })

        chargeReference = await ChargeReferenceHelper.add({
          adjustments: { s127: true },
          chargeVersionId: chargeVersion.id,
          chargeCategory: chargeCategory.id
        })
      })

      it('returns no records', async () => {
        const results = await FetchChargeVersionsService.go(billRun, billingPeriod)

        expect(results).to.be.empty()
      })
    })

    describe('because the bill run to be created is "two-part tariff supplementary"', () => {
      beforeEach(async () => {
        billRun = await BillRunHelper.add({ batchType: 'two_part_supplementary', regionId: region.id, scheme: 'sroc' })

        licence = await LicenceHelper.add({ regionId: region.id })

        chargeVersion = await ChargeVersionHelper.add({ licenceId: licence.id, licenceRef: licence.licenceRef })

        chargeReference = await ChargeReferenceHelper.add({
          adjustments: { s127: true },
          chargeVersionId: chargeVersion.id,
          chargeCategory: chargeCategory.id
        })
      })

      describe('and the licence has not been flagged for supplementary', () => {
        it('returns no records', async () => {
          const results = await FetchChargeVersionsService.go(billRun, billingPeriod)

          expect(results).to.be.empty()
        })
      })

      describe('and the licence has been flagged for supplementary but a different year', () => {
        beforeEach(async () => {
          licenceSupplementaryYear = await LicenceSupplementaryYearHelper.add({
            billRunId: billRun.id,
            licenceId: licence.id,
            financialYearEnd: billingPeriod.endDate.getFullYear() - 1
          })
        })

        it('returns no records', async () => {
          const results = await FetchChargeVersionsService.go(billRun, billingPeriod)

          expect(results).to.be.empty()
        })
      })

      describe('and the licence has been flagged for supplementary but is assigned to a different bill run', () => {
        beforeEach(async () => {
          licenceSupplementaryYear = await LicenceSupplementaryYearHelper.add({
            billRunId: '210d0685-5d61-44d3-9206-46ec037d8b73',
            licenceId: licence.id,
            financialYearEnd: billingPeriod.endDate.getFullYear()
          })
        })

        it('returns no records', async () => {
          const results = await FetchChargeVersionsService.go(billRun, billingPeriod)

          expect(results).to.be.empty()
        })
      })
    })
  })

  describe('when there are applicable charge versions', () => {
    beforeEach(async () => {
      licenceSeedData = await EmptyLicenceSeeder.seed('01/128', region.id)

      // NOTE: The first part of the setup creates a charge version we will test exactly matches what we expect. The
      // second part is to create another charge version with a different licence ref so we can test the order of the
      // results
      chargeVersion = await ChargeVersionHelper.add({
        changeReasonId: changeReason.id,
        licenceId: licenceSeedData.licence.id,
        licenceRef: licenceSeedData.licence.licenceRef
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

      licenceHolderDetails = await CRMContactsSeeder.licenceHolder(licenceSeedData, 'Licence Holder Ltd')

      // Second charge version to test ordering
      otherLicence = await EmptyLicenceSeeder.seed('01/130', region.id)
      otherChargeVersion = await ChargeVersionHelper.add({
        changeReasonId: changeReason.id,
        licenceId: otherLicence.licence.id,
        licenceRef: otherLicence.licence.licenceRef
      })
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

    describe('and the bill run to be created is "two-part tariff annual"', () => {
      beforeEach(async () => {
        billRun = await BillRunHelper.add({ batchType: 'two_part_tariff', regionId: region.id, scheme: 'sroc' })
      })

      it('returns the charge version with related licence, charge references and charge elements', async () => {
        const results = await FetchChargeVersionsService.go(billRun, billingPeriod)

        expect(results).to.have.length(2)
        expect(results[0]).to.equal({
          id: chargeVersion.id,
          startDate: new Date('2022-04-01'),
          endDate: null,
          status: 'current',
          licence: {
            id: licenceSeedData.licence.id,
            licenceRef: licenceSeedData.licence.licenceRef,
            startDate: new Date('2022-01-01'),
            expiredDate: null,
            lapsedDate: null,
            revokedDate: null,
            licenceVersions: [
              {
                id: licenceHolderDetails.licenceVersion.id,
                issueDate: licenceHolderDetails.licenceVersion.issueDate,
                licenceId: licenceHolderDetails.licenceVersion.licenceId,
                startDate: licenceHolderDetails.licenceVersion.startDate,
                status: licenceHolderDetails.licenceVersion.status,
                company: {
                  id: licenceHolderDetails.company.id,
                  name: licenceHolderDetails.company.name,
                  type: licenceHolderDetails.company.type
                }
              }
            ]
          },
          chargeReferences: [
            {
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
                shortDescription: chargeCategory.shortDescription,
                subsistenceCharge: chargeCategory.subsistenceCharge
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
            }
          ],
          changeReason: {
            description: changeReason.description
          }
        })
      })

      it('returns the charge versions ordered by licence reference', async () => {
        const results = await FetchChargeVersionsService.go(billRun, billingPeriod)

        expect(results[0].licence.licenceRef).to.equal(licenceSeedData.licence.licenceRef)
        expect(results[1].licence.licenceRef).to.equal(otherLicence.licence.licenceRef)
      })

      it('returns the charge elements within each charge version ordered by authorised annual quantity', async () => {
        const results = await FetchChargeVersionsService.go(billRun, billingPeriod)

        expect(results[0].chargeReferences[0].chargeElements[0].id).to.equal(chargeElement2.id)
        expect(results[0].chargeReferences[0].chargeElements[1].id).to.equal(chargeElement1.id)
      })
    })

    describe('and the bill run to be created is "two-part tariff supplementary"', () => {
      beforeEach(async () => {
        billRun = await BillRunHelper.add({
          batchType: 'two_part_supplementary',
          regionId: region.id,
          scheme: 'sroc'
        })

        licenceSupplementaryYear = await LicenceSupplementaryYearHelper.add({
          billRunId: billRun.id,
          licenceId: licenceSeedData.licence.id,
          financialYearEnd: billingPeriod.endDate.getFullYear()
        })
      })

      describe('and the first licence has been flagged for supplementary', () => {
        it('returns only its charge versions', async () => {
          const results = await FetchChargeVersionsService.go(billRun, billingPeriod, supplementary)

          expect(results).to.have.length(1)
          expect(results[0].licence.licenceRef).to.equal(licenceSeedData.licence.licenceRef)
        })
      })
    })
  })
})
