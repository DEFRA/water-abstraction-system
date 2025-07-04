'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const PointHelper = require('../../support/helpers/point.helper.js')
const PrimaryPurposeHelper = require('../../support/helpers/primary-purpose.helper.js')
const PurposeHelper = require('../../support/helpers/purpose.helper.js')
const RegionHelper = require('../../support/helpers/region.helper.js')
const ReturnRequirementHelper = require('../../support/helpers/return-requirement.helper.js')
const ReturnRequirementModel = require('../../../app/models/return-requirement.model.js')
const ReturnRequirementPointHelper = require('../../support/helpers/return-requirement-point.helper.js')
const ReturnRequirementPurposeHelper = require('../../support/helpers/return-requirement-purpose.helper.js')
const ReturnVersionHelper = require('../../support/helpers/return-version.helper.js')
const SecondaryPurposeHelper = require('../../support/helpers/secondary-purpose.helper.js')

// Thing under test
const FetchLicenceReturnRequirementsService = require('../../../app/services/return-logs/fetch-licence-return-requirements.service.js')

// NOTE: These have been declared outside the top level describe() by exception. We want to assert the result in detail
// but it leads to a big block of object-code we then go on to duplicate a number of times in these tests. We've moved
// that code to a helper function at the bottom but in order for it to be able to access the variables they need to be
// declared here.
let licence
let point
let primaryPurpose
let previousReturnRequirementPurpose
let previousReturnRequirement
let previousReturnVersion
let purpose
let region
let returnRequirement
let returnRequirementPurpose
let returnVersion
let secondaryPurpose

describe('Return Logs - Fetch Licence Return Requirements service', () => {
  const changeDate = new Date('2024-12-04')
  const dayAfterChangeDate = new Date('2024-12-05')

  describe('when the given licence exists', () => {
    before(async () => {
      region = RegionHelper.select()
    })

    describe('and does not end before the "change date"', () => {
      before(async () => {
        licence = await LicenceHelper.add({ regionId: region.id })
      })

      describe('and it has a return version that has no end date, or ends on or after the change date', () => {
        before(async () => {
          returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })
        })

        describe('and the return version has a return requirement', () => {
          before(async () => {
            returnRequirement = await ReturnRequirementHelper.add({
              regionId: region.naldRegionId,
              returnVersionId: returnVersion.id,
              summer: true
            })

            primaryPurpose = PrimaryPurposeHelper.select()
            purpose = PurposeHelper.select()
            secondaryPurpose = SecondaryPurposeHelper.select()

            returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
              alias: 'Summer purpose alias for testing',
              returnRequirementId: returnRequirement.id,
              primaryPurposeId: primaryPurpose.id,
              purposeId: purpose.id,
              secondaryPurposeId: secondaryPurpose.id
            })

            point = await PointHelper.add({
              description: 'Summer cycle - live licence - live return version - summer return requirement'
            })
            await ReturnRequirementPointHelper.add({
              returnRequirementId: returnRequirement.id,
              pointId: point.id
            })
          })

          it('returns the return requirement and all related data needed to generate a return log', async () => {
            const results = await FetchLicenceReturnRequirementsService.go(licence.id, changeDate)

            const expectedResult = _expectedResult()

            expect(results).to.include(expectedResult)
          })
        })
      })

      describe('and it has two return versions that have no end date, or ends on or after the change date', () => {
        before(async () => {
          returnVersion = await ReturnVersionHelper.add({ startDate: dayAfterChangeDate, licenceId: licence.id })
          previousReturnVersion = await ReturnVersionHelper.add({ endDate: changeDate, licenceId: licence.id })
        })

        describe('and the return version has a return requirement', () => {
          before(async () => {
            returnRequirement = await ReturnRequirementHelper.add({
              regionId: region.naldRegionId,
              returnVersionId: returnVersion.id,
              summer: true
            })
            previousReturnRequirement = await ReturnRequirementHelper.add({
              regionId: region.naldRegionId,
              returnVersionId: previousReturnVersion.id,
              summer: true
            })

            primaryPurpose = PrimaryPurposeHelper.select()
            purpose = PurposeHelper.select()
            secondaryPurpose = SecondaryPurposeHelper.select()

            returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
              alias: 'Summer purpose alias for testing',
              returnRequirementId: returnRequirement.id,
              primaryPurposeId: primaryPurpose.id,
              purposeId: purpose.id,
              secondaryPurposeId: secondaryPurpose.id
            })
            previousReturnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
              alias: 'Summer purpose alias for testing',
              returnRequirementId: previousReturnRequirement.id,
              primaryPurposeId: primaryPurpose.id,
              purposeId: purpose.id,
              secondaryPurposeId: secondaryPurpose.id
            })

            point = await PointHelper.add({
              description: 'Summer cycle - live licence - live return version - summer return requirement'
            })
            await ReturnRequirementPointHelper.add({
              returnRequirementId: returnRequirement.id,
              pointId: point.id
            })
            await ReturnRequirementPointHelper.add({
              returnRequirementId: previousReturnRequirement.id,
              pointId: point.id
            })
          })

          it('returns the return requirement and all related data needed to generate a return log', async () => {
            const results = await FetchLicenceReturnRequirementsService.go(licence.id, changeDate)

            const returnVersionExpectedResult = _expectedResult()
            const previousReturnVersionExpectedResult = _expectedResult(
              previousReturnRequirementPurpose,
              previousReturnRequirement,
              previousReturnVersion
            )

            expect(results).to.includes([returnVersionExpectedResult, previousReturnVersionExpectedResult])
          })
        })
      })

      describe('and it has a return version that ends before the change date', () => {
        before(async () => {
          returnVersion = await ReturnVersionHelper.add({ endDate: new Date('2022-04-30'), licenceId: licence.id })
        })

        describe('and the return version has a return requirement', () => {
          before(async () => {
            returnRequirement = await ReturnRequirementHelper.add({
              regionId: region.naldRegionId,
              returnVersionId: returnVersion.id,
              summer: false
            })

            primaryPurpose = PrimaryPurposeHelper.select()
            purpose = PurposeHelper.select()
            secondaryPurpose = SecondaryPurposeHelper.select()

            returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
              alias: 'Summer purpose alias for testing',
              returnRequirementId: returnRequirement.id,
              primaryPurposeId: primaryPurpose.id,
              purposeId: purpose.id,
              secondaryPurposeId: secondaryPurpose.id
            })

            point = await PointHelper.add({
              description: 'Summer cycle - live licence - live return version - summer return requirement'
            })
            await ReturnRequirementPointHelper.add({
              returnRequirementId: returnRequirement.id,
              pointId: point.id
            })
          })

          it('does not return that return requirement', async () => {
            const results = await FetchLicenceReturnRequirementsService.go(licence.id, changeDate)

            const resultIds = _resultIds(results)

            expect(resultIds).not.to.include(returnRequirement.id)
          })
        })
      })
    })

    describe('and it ends before the "change date"', () => {
      before(async () => {
        licence = await LicenceHelper.add({ expiredDate: new Date('2022-05-31'), regionId: region.id })
      })

      describe('and it has a return version that has no end date, or ends on or after the change date', () => {
        before(async () => {
          returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })
        })

        describe('and the return version has a return requirement', () => {
          before(async () => {
            returnRequirement = await ReturnRequirementHelper.add({
              regionId: region.naldRegionId,
              returnVersionId: returnVersion.id,
              summer: true
            })

            primaryPurpose = PrimaryPurposeHelper.select()
            purpose = PurposeHelper.select()
            secondaryPurpose = SecondaryPurposeHelper.select()

            returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
              alias: 'Summer purpose alias for testing',
              returnRequirementId: returnRequirement.id,
              primaryPurposeId: primaryPurpose.id,
              purposeId: purpose.id,
              secondaryPurposeId: secondaryPurpose.id
            })

            point = await PointHelper.add({
              description: 'Summer cycle - live licence - live return version - summer return requirement'
            })
            await ReturnRequirementPointHelper.add({
              returnRequirementId: returnRequirement.id,
              pointId: point.id
            })
          })

          it('does not return that return requirement', async () => {
            const results = await FetchLicenceReturnRequirementsService.go(licence.id, changeDate)

            const resultIds = _resultIds(results)

            expect(resultIds).not.to.include(returnRequirement.id)
          })
        })
      })
    })
  })

  describe('when the given licence does not exist', () => {
    it('returns no results', async () => {
      const results = await FetchLicenceReturnRequirementsService.go(
        '9f4a4982-c9dc-4930-bff8-1aa6d2f7e0ae',
        changeDate,
        false
      )

      expect(results).to.be.empty()
    })
  })
})

function _expectedResult(
  _returnRequirementPurpose = returnRequirementPurpose,
  _returnRequirement = returnRequirement,
  _returnVersion = returnVersion
) {
  return ReturnRequirementModel.fromJson({
    abstractionPeriodEndDay: _returnRequirement.abstractionPeriodEndDay,
    abstractionPeriodEndMonth: _returnRequirement.abstractionPeriodEndMonth,
    abstractionPeriodStartDay: _returnRequirement.abstractionPeriodStartDay,
    abstractionPeriodStartMonth: _returnRequirement.abstractionPeriodStartMonth,
    externalId: _returnRequirement.externalId,
    id: _returnRequirement.id,
    reference: _returnRequirement.reference,
    reportingFrequency: _returnRequirement.reportingFrequency,
    returnVersionId: _returnRequirement.returnVersionId,
    siteDescription: _returnRequirement.siteDescription,
    summer: _returnRequirement.summer,
    twoPartTariff: _returnRequirement.twoPartTariff,
    returnVersion: {
      endDate: _returnVersion.endDate,
      id: _returnVersion.id,
      reason: _returnVersion.reason,
      startDate: _returnVersion.startDate,
      licence: {
        expiredDate: licence.expiredDate,
        id: licence.id,
        lapsedDate: licence.lapsedDate,
        licenceRef: licence.licenceRef,
        revokedDate: licence.revokedDate,
        areacode: 'SAAR',
        region: {
          id: region.id,
          naldRegionId: region.naldRegionId
        }
      },
      quarterlyReturns: _returnVersion.quarterlyReturns,
      multipleUpload: returnVersion.multipleUpload
    },
    points: [
      {
        description: point.description,
        ngr1: point.ngr1,
        ngr2: point.ngr2,
        ngr3: point.ngr3,
        ngr4: point.ngr4
      }
    ],
    returnRequirementPurposes: [
      {
        alias: _returnRequirementPurpose.alias,
        id: _returnRequirementPurpose.id,
        primaryPurpose: {
          description: primaryPurpose.description,
          id: primaryPurpose.id,
          legacyId: primaryPurpose.legacyId
        },
        purpose: {
          description: purpose.description,
          id: purpose.id,
          legacyId: purpose.legacyId
        },
        secondaryPurpose: {
          description: secondaryPurpose.description,
          id: secondaryPurpose.id,
          legacyId: secondaryPurpose.legacyId
        }
      }
    ]
  })
}

function _resultIds(results) {
  return results.map((result) => {
    return result.id
  })
}
