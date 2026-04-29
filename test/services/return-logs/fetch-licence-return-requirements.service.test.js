'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const PointHelper = require('../../support/helpers/point.helper.js')
const PrimaryPurposeHelper = require('../../support/helpers/primary-purpose.helper.js')
const PurposeHelper = require('../../support/helpers/purpose.helper.js')
const RegionHelper = require('../../support/helpers/region.helper.js')
const ReturnRequirementHelper = require('../../support/helpers/return-requirement.helper.js')
const ReturnRequirementPointHelper = require('../../support/helpers/return-requirement-point.helper.js')
const ReturnRequirementPurposeHelper = require('../../support/helpers/return-requirement-purpose.helper.js')
const ReturnVersionHelper = require('../../support/helpers/return-version.helper.js')
const SecondaryPurposeHelper = require('../../support/helpers/secondary-purpose.helper.js')
const { today } = require('../../../app/lib/general.lib.js')
const { tomorrow, yesterday } = require('../../support/general.js')

// Thing under test
const FetchLicenceReturnRequirementsService = require('../../../app/services/return-logs/fetch-licence-return-requirements.service.js')

// NOTE: These have been declared outside the top level describe() by exception. We want to assert the result in detail
// but it leads to a big block of object-code we then go on to duplicate a number of times in these tests. We've moved
// that code to a helper function at the bottom but in order for it to be able to access the variables they need to be
// declared here.
let licence
let point
let primaryPurpose
let purpose
let region
let returnVersions
let secondaryPurpose

describe('Return Logs - Fetch Licence Return Requirements service', () => {
  let changeDate

  beforeEach(async () => {
    region = RegionHelper.select()
    primaryPurpose = PrimaryPurposeHelper.select()
    purpose = PurposeHelper.select()
    secondaryPurpose = SecondaryPurposeHelper.select()

    point = await PointHelper.add()
  })

  afterEach(async () => {
    for (const returnVersion of returnVersions) {
      await point.$query().delete()

      await returnVersion.returnRequirements[0].returnRequirementPoints[0].$query().delete()
      await returnVersion.returnRequirements[0].returnRequirementPurposes[0].$query().delete()
      await returnVersion.returnRequirements[0].$query().delete()

      await returnVersion.$query().delete()
    }
  })

  describe('when the licence ends before the "change date"', () => {
    beforeEach(async () => {
      changeDate = today()
      licence = await LicenceHelper.add({ expiredDate: yesterday(), regionId: region.id })

      await _seedReturnVersions()
    })

    it('returns no return requirements', async () => {
      const results = await FetchLicenceReturnRequirementsService.go(licence.id, changeDate)

      expect(results).to.be.empty()
    })
  })

  describe('when the licence ends after the "change date"', () => {
    describe('and the change date is equal to when one of the return versions ends', () => {
      beforeEach(async () => {
        changeDate = new Date('2023-03-31')
        licence = await LicenceHelper.add({ expiredDate: tomorrow(), regionId: region.id })

        await _seedReturnVersions()
      })

      it('only returns requirements linked to "current" return versions that end on or after the change date', async () => {
        const results = await FetchLicenceReturnRequirementsService.go(licence.id, changeDate)

        expect(results).to.equal([
          _transformReturnVersionToResult(returnVersions[3]),
          _transformReturnVersionToResult(returnVersions[4])
        ])
      })
    })

    describe('and the change date is before one of the return versions ends', () => {
      beforeEach(async () => {
        changeDate = new Date('2022-03-30')
        licence = await LicenceHelper.add({ expiredDate: tomorrow(), regionId: region.id })

        await _seedReturnVersions()
      })

      it('only returns requirements linked to "current" return versions that end after the change date', async () => {
        const results = await FetchLicenceReturnRequirementsService.go(licence.id, changeDate)

        expect(results).to.equal([
          _transformReturnVersionToResult(returnVersions[1]),
          _transformReturnVersionToResult(returnVersions[3]),
          _transformReturnVersionToResult(returnVersions[4])
        ])
      })
    })

    describe('and the change date is after all the return versions end', () => {
      beforeEach(async () => {
        changeDate = today()
        licence = await LicenceHelper.add({ expiredDate: tomorrow(), regionId: region.id })

        await _seedReturnVersions()
      })

      it('only returns requirements linked to latest "current" return version that has no end date', async () => {
        const results = await FetchLicenceReturnRequirementsService.go(licence.id, changeDate)

        expect(results).to.equal([_transformReturnVersionToResult(returnVersions[4])])
      })
    })
  })

  describe('when the licence does not have an end date', () => {
    describe('and the change date is equal to when one of the return versions ends', () => {
      beforeEach(async () => {
        changeDate = new Date('2023-03-31')
        licence = await LicenceHelper.add({ regionId: region.id })

        await _seedReturnVersions()
      })

      it('only returns requirements linked to "current" return versions that end on or after the change date', async () => {
        const results = await FetchLicenceReturnRequirementsService.go(licence.id, changeDate)

        expect(results).to.equal([
          _transformReturnVersionToResult(returnVersions[3]),
          _transformReturnVersionToResult(returnVersions[4])
        ])
      })
    })

    describe('and the change date is before one of the return versions ends', () => {
      beforeEach(async () => {
        changeDate = new Date('2022-03-30')
        licence = await LicenceHelper.add({ regionId: region.id })

        await _seedReturnVersions()
      })

      it('only returns requirements linked to "current" return versions that end after the change date', async () => {
        const results = await FetchLicenceReturnRequirementsService.go(licence.id, changeDate)

        expect(results).to.equal([
          _transformReturnVersionToResult(returnVersions[1]),
          _transformReturnVersionToResult(returnVersions[3]),
          _transformReturnVersionToResult(returnVersions[4])
        ])
      })
    })

    describe('and the change date is after all the return versions end', () => {
      beforeEach(async () => {
        changeDate = today()
        licence = await LicenceHelper.add({ regionId: region.id })

        await _seedReturnVersions()
      })

      it('only returns requirements linked to latest "current" return version that has no end date', async () => {
        const results = await FetchLicenceReturnRequirementsService.go(licence.id, changeDate)

        expect(results).to.equal([_transformReturnVersionToResult(returnVersions[4])])
      })
    })
  })
})

async function _seedReturnVersions() {
  returnVersions = [
    await ReturnVersionHelper.add({
      endDate: new Date('2021-03-31'),
      licenceId: licence.id,
      reason: 'new-licence',
      startDate: new Date('2020-04-01'),
      status: 'current',
      version: 1
    }),
    await ReturnVersionHelper.add({
      endDate: new Date('2022-03-31'),
      licenceId: licence.id,
      reason: 'returns-exception',
      startDate: new Date('2021-04-01'),
      status: 'current',
      version: 1
    }),
    await ReturnVersionHelper.add({
      endDate: new Date('2023-03-31'),
      licenceId: licence.id,
      reason: 'minor-change',
      startDate: new Date('2022-04-01'),
      status: 'superseded',
      version: 2
    }),
    await ReturnVersionHelper.add({
      endDate: new Date('2023-03-31'),
      licenceId: licence.id,
      reason: 'error-correction',
      startDate: new Date('2022-04-01'),
      status: 'current',
      version: 3
    }),
    await ReturnVersionHelper.add({
      endDate: null,
      licenceId: licence.id,
      reason: 'major-change',
      startDate: new Date('2024-04-01'),
      status: 'current',
      version: 4
    })
  ]

  for (const returnVersion of returnVersions) {
    await _seedReturnVersionChildData(returnVersion)
  }
}

async function _seedReturnVersionChildData(returnVersion) {
  const returnRequirement = await ReturnRequirementHelper.add({ returnVersionId: returnVersion.id })

  returnRequirement.returnRequirementPurposes = [
    await ReturnRequirementPurposeHelper.add({
      returnRequirementId: returnRequirement.id,
      primaryPurposeId: primaryPurpose.id,
      purposeId: purpose.id,
      secondaryPurposeId: secondaryPurpose.id
    })
  ]

  returnRequirement.returnRequirementPoints = [
    await ReturnRequirementPointHelper.add({
      returnRequirementId: returnRequirement.id,
      pointId: point.id
    })
  ]

  returnVersion.returnRequirements = [returnRequirement]
}

function _transformReturnVersionToResult(returnVersion) {
  const { returnRequirements } = returnVersion
  const { returnRequirementPurposes } = returnRequirements[0]

  return {
    abstractionPeriodEndDay: returnRequirements[0].abstractionPeriodEndDay,
    abstractionPeriodEndMonth: returnRequirements[0].abstractionPeriodEndMonth,
    abstractionPeriodStartDay: returnRequirements[0].abstractionPeriodStartDay,
    abstractionPeriodStartMonth: returnRequirements[0].abstractionPeriodStartMonth,
    externalId: returnRequirements[0].externalId,
    id: returnRequirements[0].id,
    reference: returnRequirements[0].reference,
    reportingFrequency: returnRequirements[0].reportingFrequency,
    returnVersionId: returnRequirements[0].returnVersionId,
    siteDescription: returnRequirements[0].siteDescription,
    summer: returnRequirements[0].summer,
    twoPartTariff: returnRequirements[0].twoPartTariff,
    returnVersion: {
      endDate: returnVersion.endDate,
      id: returnVersion.id,
      reason: returnVersion.reason,
      startDate: returnVersion.startDate,
      quarterlyReturns: returnVersion.quarterlyReturns,
      multipleUpload: returnVersion.multipleUpload,
      licence: {
        expiredDate: licence.expiredDate,
        id: licence.id,
        lapsedDate: licence.lapsedDate,
        licenceRef: licence.licenceRef,
        revokedDate: licence.revokedDate,
        areacode: 'SAAR',
        region: { id: region.id, naldRegionId: region.naldRegionId }
      }
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
        alias: returnRequirementPurposes[0].alias,
        id: returnRequirementPurposes[0].id,
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
  }
}
