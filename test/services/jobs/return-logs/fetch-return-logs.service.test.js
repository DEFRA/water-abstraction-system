'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const PrimaryPurposeHelper = require('../../../support/helpers/primary-purpose.helper.js')
const PurposeHelper = require('../../../support/helpers/purpose.helper.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')
const ReturnRequirementHelper = require('../../../support/helpers/return-requirement.helper.js')
const ReturnRequirementPointHelper = require('../../../support/helpers/return-requirement-point.helper.js')
const ReturnRequirementPurposeHelper = require('../../../support/helpers/return-requirement-purpose.helper.js')
const ReturnVersionHelper = require('../../../support/helpers/return-version.helper.js')
const SecondaryPurposeHelper = require('../../../support/helpers/secondary-purpose.helper.js')

// Thing under test
const FetchReturnLogsService = require('../../../../app/services/jobs/return-logs/fetch-return-logs.service.js')

describe('Fetch return logs service', () => {
  const allYearDueDate = new Date(new Date().getFullYear() + 1, 3, 28).toISOString().split('T')[0]
  const summerDueDate = new Date(new Date().getFullYear() + 1, 10, 28).toISOString().split('T')[0]
  const allYearEndDate = new Date(new Date().getFullYear() + 1, 2, 31).toISOString().split('T')[0]
  const summerEndDate = new Date(new Date().getFullYear() + 1, 9, 31).toISOString().split('T')[0]
  const allYearStartDate = new Date(new Date().getFullYear(), 3, 1).toISOString().split('T')[0]
  const summerStartDate = new Date(new Date().getFullYear(), 10, 1).toISOString().split('T')[0]

  describe('When isSummer is false, one return requirement and a licenceRef provided', () => {
    const primaryPurpose = PrimaryPurposeHelper.select()
    const purpose = PurposeHelper.select()
    const secondaryPurpose = SecondaryPurposeHelper.select()

    let licence
    let region
    let returnVersion
    let returnRequirement
    let returnRequirementPoint
    let returnRequirementPurpose

    before(async () => {
      region = RegionHelper.select()
      licence = await LicenceHelper.add({ regionId: region.id })
      returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })
      returnRequirement = await ReturnRequirementHelper.add({ returnVersionId: returnVersion.id })
      returnRequirementPoint = await ReturnRequirementPointHelper.add({ returnRequirementId: returnRequirement.id })
      returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
        primaryPurposeId: primaryPurpose.id,
        purposeId: purpose.id,
        returnRequirementId: returnRequirement.id,
        secondaryPurposeId: secondaryPurpose.id
      })
    })

    it('should return one return log payload', async () => {
      const result = await FetchReturnLogsService.go(false, licence.licenceRef)

      expect(result.length).to.equal(1)
      expect(result[0].dueDate).to.equal(allYearDueDate)
      expect(result[0].endDate).to.equal(allYearEndDate)
      expect(result[0].id).to.equal(`v1:${region.naldRegionId}:${licence.licenceRef}:${returnRequirement.legacyId}:${allYearStartDate}:${allYearEndDate}`)
      expect(result[0].licenceRef).to.equal(licence.licenceRef)
      expect(result[0].metadata).to.equal({
        description: 'BOREHOLE AT AVALON',
        isCurrent: true,
        isFinal: false,
        isSummer: false,
        isTwoPartTariff: false,
        isUpload: false,
        nald: {
          regionCode: region.naldRegionId,
          areaCode: licence.regions.historicalAreaCode,
          formatId: returnRequirement.legacyId,
          periodStartDay: returnRequirement.abstractionPeriodStartDay.toString(),
          periodStartMonth: returnRequirement.abstractionPeriodStartMonth.toString(),
          periodEndDay: returnRequirement.abstractionPeriodEndDay.toString(),
          periodEndMonth: returnRequirement.abstractionPeriodEndMonth.toString()
        },
        points: [{
          name: returnRequirementPoint.description,
          ngr1: returnRequirementPoint.ngr1,
          ngr2: returnRequirementPoint.ngr2,
          ngr3: returnRequirementPoint.ngr3,
          ngr4: returnRequirementPoint.ngr4
        }],
        purposes: [{
          alias: returnRequirementPurpose.alias,
          primary: {
            code: primaryPurpose.legacyId,
            description: primaryPurpose.description
          },
          secondary: {
            code: secondaryPurpose.legacyId,
            description: secondaryPurpose.description
          },
          tertiary: {
            code: purpose.legacyId,
            description: purpose.description
          }
        }],
        version: 1
      })
      expect(result[0].returnsFrequency).to.equal('day')
      expect(result[0].startDate).to.equal(allYearStartDate)
      expect(result[0].status).to.equal('due')
      expect(result[0].source).to.equal('WRLS')
    })
  })

  describe('when isSummer is true, one return requirement and a licenceRef provided', () => {
    const primaryPurpose = PrimaryPurposeHelper.select()
    const purpose = PurposeHelper.select()
    const secondaryPurpose = SecondaryPurposeHelper.select()

    let licence
    let region
    let returnVersion
    let returnRequirement
    let returnRequirementPoint
    let returnRequirementPurpose

    before(async () => {
      region = RegionHelper.select()
      licence = await LicenceHelper.add({ regionId: region.id })
      returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })
      returnRequirement = await ReturnRequirementHelper.add({ summer: true, returnVersionId: returnVersion.id })
      returnRequirementPoint = await ReturnRequirementPointHelper.add({ returnRequirementId: returnRequirement.id })
      returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
        primaryPurposeId: primaryPurpose.id,
        purposeId: purpose.id,
        returnRequirementId: returnRequirement.id,
        secondaryPurposeId: secondaryPurpose.id
      })
    })

    it('should return one return log payload', async () => {
      const result = await FetchReturnLogsService.go(true, licence.licenceRef)

      expect(result.length).to.equal(1)
      expect(result[0].dueDate).to.equal(summerDueDate)
      expect(result[0].endDate).to.equal(summerEndDate)
      expect(result[0].id).to.equal(`v1:${region.naldRegionId}:${licence.licenceRef}:${returnRequirement.legacyId}:${summerStartDate}:${summerEndDate}`)
      expect(result[0].licenceRef).to.equal(licence.licenceRef)
      expect(result[0].metadata).to.equal({
        description: 'BOREHOLE AT AVALON',
        isCurrent: true,
        isFinal: false,
        isSummer: true,
        isTwoPartTariff: false,
        isUpload: false,
        nald: {
          regionCode: region.naldRegionId,
          areaCode: licence.regions.historicalAreaCode,
          formatId: returnRequirement.legacyId,
          periodStartDay: returnRequirement.abstractionPeriodStartDay.toString(),
          periodStartMonth: returnRequirement.abstractionPeriodStartMonth.toString(),
          periodEndDay: returnRequirement.abstractionPeriodEndDay.toString(),
          periodEndMonth: returnRequirement.abstractionPeriodEndMonth.toString()
        },
        points: [{
          name: returnRequirementPoint.description,
          ngr1: returnRequirementPoint.ngr1,
          ngr2: returnRequirementPoint.ngr2,
          ngr3: returnRequirementPoint.ngr3,
          ngr4: returnRequirementPoint.ngr4
        }],
        purposes: [{
          alias: returnRequirementPurpose.alias,
          primary: {
            code: primaryPurpose.legacyId,
            description: primaryPurpose.description
          },
          secondary: {
            code: secondaryPurpose.legacyId,
            description: secondaryPurpose.description
          },
          tertiary: {
            code: purpose.legacyId,
            description: purpose.description
          }
        }],
        version: 1
      })
      expect(result[0].returnsFrequency).to.equal('day')
      expect(result[0].startDate).to.equal(summerStartDate)
      expect(result[0].status).to.equal('due')
      expect(result[0].source).to.equal('WRLS')
    })
  })

  describe('when isSummer is false, two return requirements and a licenceRef provided', () => {
    const primaryPurpose = PrimaryPurposeHelper.select()
    const primaryPurpose2 = PrimaryPurposeHelper.select()
    const purpose = PurposeHelper.select()
    const purpose2 = PurposeHelper.select()
    const secondaryPurpose = SecondaryPurposeHelper.select()
    const secondaryPurpose2 = SecondaryPurposeHelper.select()

    let licence
    let region
    let returnVersion
    let returnRequirement
    let returnRequirement2
    let returnRequirementPoint
    let returnRequirementPurpose
    let returnRequirementPoint2
    let returnRequirementPurpose2

    before(async () => {
      region = RegionHelper.select()
      licence = await LicenceHelper.add({ regionId: region.id })
      returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })
      returnRequirement = await ReturnRequirementHelper.add({ returnVersionId: returnVersion.id })
      returnRequirement2 = await ReturnRequirementHelper.add({ returnVersionId: returnVersion.id })
      returnRequirementPoint = await ReturnRequirementPointHelper.add({ returnRequirementId: returnRequirement.id })
      returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
        primaryPurposeId: primaryPurpose.id,
        purposeId: purpose.id,
        returnRequirementId: returnRequirement.id,
        secondaryPurposeId: secondaryPurpose.id
      })
      returnRequirementPoint2 = await ReturnRequirementPointHelper.add({ returnRequirementId: returnRequirement2.id })
      returnRequirementPurpose2 = await ReturnRequirementPurposeHelper.add({
        primaryPurposeId: primaryPurpose2.id,
        purposeId: purpose2.id,
        returnRequirementId: returnRequirement2.id,
        secondaryPurposeId: secondaryPurpose2.id
      })
    })

    it('should return two return log payloads', async () => {
      const result = await FetchReturnLogsService.go(false, licence.licenceRef)

      expect(result.length).to.equal(2)
      expect(result[0].dueDate).to.equal(allYearDueDate)
      expect(result[0].endDate).to.equal(allYearEndDate)
      expect(result[0].id).to.equal(`v1:${region.naldRegionId}:${licence.licenceRef}:${returnRequirement.legacyId}:${allYearStartDate}:${allYearEndDate}`)
      expect(result[0].licenceRef).to.equal(licence.licenceRef)
      expect(result[0].metadata).to.equal({
        description: 'BOREHOLE AT AVALON',
        isCurrent: true,
        isFinal: false,
        isSummer: false,
        isTwoPartTariff: false,
        isUpload: false,
        nald: {
          regionCode: region.naldRegionId,
          areaCode: licence.regions.historicalAreaCode,
          formatId: returnRequirement.legacyId,
          periodStartDay: returnRequirement.abstractionPeriodStartDay.toString(),
          periodStartMonth: returnRequirement.abstractionPeriodStartMonth.toString(),
          periodEndDay: returnRequirement.abstractionPeriodEndDay.toString(),
          periodEndMonth: returnRequirement.abstractionPeriodEndMonth.toString()
        },
        points: [{
          name: returnRequirementPoint.description,
          ngr1: returnRequirementPoint.ngr1,
          ngr2: returnRequirementPoint.ngr2,
          ngr3: returnRequirementPoint.ngr3,
          ngr4: returnRequirementPoint.ngr4
        }],
        purposes: [{
          alias: returnRequirementPurpose.alias,
          primary: {
            code: primaryPurpose.legacyId,
            description: primaryPurpose.description
          },
          secondary: {
            code: secondaryPurpose.legacyId,
            description: secondaryPurpose.description
          },
          tertiary: {
            code: purpose.legacyId,
            description: purpose.description
          }
        }],
        version: 1
      })
      expect(result[0].returnsFrequency).to.equal('day')
      expect(result[0].startDate).to.equal(allYearStartDate)
      expect(result[0].status).to.equal('due')
      expect(result[0].source).to.equal('WRLS')
      expect(result[1].dueDate).to.equal(allYearDueDate)
      expect(result[1].endDate).to.equal(allYearEndDate)
      expect(result[1].id).to.equal(`v1:${region.naldRegionId}:${licence.licenceRef}:${returnRequirement2.legacyId}:${allYearStartDate}:${allYearEndDate}`)
      expect(result[1].licenceRef).to.equal(licence.licenceRef)
      expect(result[1].metadata).to.equal({
        description: 'BOREHOLE AT AVALON',
        isCurrent: true,
        isFinal: false,
        isSummer: false,
        isTwoPartTariff: false,
        isUpload: false,
        nald: {
          regionCode: region.naldRegionId,
          areaCode: licence.regions.historicalAreaCode,
          formatId: returnRequirement2.legacyId,
          periodStartDay: returnRequirement2.abstractionPeriodStartDay.toString(),
          periodStartMonth: returnRequirement2.abstractionPeriodStartMonth.toString(),
          periodEndDay: returnRequirement2.abstractionPeriodEndDay.toString(),
          periodEndMonth: returnRequirement2.abstractionPeriodEndMonth.toString()
        },
        points: [{
          name: returnRequirementPoint2.description,
          ngr1: returnRequirementPoint2.ngr1,
          ngr2: returnRequirementPoint2.ngr2,
          ngr3: returnRequirementPoint2.ngr3,
          ngr4: returnRequirementPoint2.ngr4
        }],
        purposes: [{
          alias: returnRequirementPurpose2.alias,
          primary: {
            code: primaryPurpose2.legacyId,
            description: primaryPurpose2.description
          },
          secondary: {
            code: secondaryPurpose2.legacyId,
            description: secondaryPurpose2.description
          },
          tertiary: {
            code: purpose2.legacyId,
            description: purpose2.description
          }
        }],
        version: 1
      })
      expect(result[1].returnsFrequency).to.equal('day')
      expect(result[1].startDate).to.equal(allYearStartDate)
      expect(result[1].status).to.equal('due')
      expect(result[1].source).to.equal('WRLS')
    })
  })

  describe('when isSummer is true, two return requirements and a licenceRef provided', () => {
    const primaryPurpose = PrimaryPurposeHelper.select()
    const primaryPurpose2 = PrimaryPurposeHelper.select()
    const purpose = PurposeHelper.select()
    const purpose2 = PurposeHelper.select()
    const secondaryPurpose = SecondaryPurposeHelper.select()
    const secondaryPurpose2 = SecondaryPurposeHelper.select()

    let licence
    let region
    let returnVersion
    let returnRequirement
    let returnRequirement2
    let returnRequirementPoint
    let returnRequirementPurpose
    let returnRequirementPoint2
    let returnRequirementPurpose2

    before(async () => {
      region = RegionHelper.select()
      licence = await LicenceHelper.add({ regionId: region.id })
      returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })
      returnRequirement = await ReturnRequirementHelper.add({ summer: true, returnVersionId: returnVersion.id })
      returnRequirement2 = await ReturnRequirementHelper.add({ summer: true, returnVersionId: returnVersion.id })
      returnRequirementPoint = await ReturnRequirementPointHelper.add({ returnRequirementId: returnRequirement.id })
      returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
        primaryPurposeId: primaryPurpose.id,
        purposeId: purpose.id,
        returnRequirementId: returnRequirement.id,
        secondaryPurposeId: secondaryPurpose.id
      })
      returnRequirementPoint2 = await ReturnRequirementPointHelper.add({ returnRequirementId: returnRequirement2.id })
      returnRequirementPurpose2 = await ReturnRequirementPurposeHelper.add({
        primaryPurposeId: primaryPurpose2.id,
        purposeId: purpose2.id,
        returnRequirementId: returnRequirement2.id,
        secondaryPurposeId: secondaryPurpose2.id
      })
    })

    it('should return two return log payloads', async () => {
      const result = await FetchReturnLogsService.go(true, licence.licenceRef)

      expect(result.length).to.equal(2)
      expect(result[0].dueDate).to.equal(summerDueDate)
      expect(result[0].endDate).to.equal(summerEndDate)
      expect(result[0].id).to.equal(`v1:${region.naldRegionId}:${licence.licenceRef}:${returnRequirement.legacyId}:${summerStartDate}:${summerEndDate}`)
      expect(result[0].licenceRef).to.equal(licence.licenceRef)
      expect(result[0].metadata).to.equal({
        description: 'BOREHOLE AT AVALON',
        isCurrent: true,
        isFinal: false,
        isSummer: true,
        isTwoPartTariff: false,
        isUpload: false,
        nald: {
          regionCode: region.naldRegionId,
          areaCode: licence.regions.historicalAreaCode,
          formatId: returnRequirement.legacyId,
          periodStartDay: returnRequirement.abstractionPeriodStartDay.toString(),
          periodStartMonth: returnRequirement.abstractionPeriodStartMonth.toString(),
          periodEndDay: returnRequirement.abstractionPeriodEndDay.toString(),
          periodEndMonth: returnRequirement.abstractionPeriodEndMonth.toString()
        },
        points: [{
          name: returnRequirementPoint.description,
          ngr1: returnRequirementPoint.ngr1,
          ngr2: returnRequirementPoint.ngr2,
          ngr3: returnRequirementPoint.ngr3,
          ngr4: returnRequirementPoint.ngr4
        }],
        purposes: [{
          alias: returnRequirementPurpose.alias,
          primary: {
            code: primaryPurpose.legacyId,
            description: primaryPurpose.description
          },
          secondary: {
            code: secondaryPurpose.legacyId,
            description: secondaryPurpose.description
          },
          tertiary: {
            code: purpose.legacyId,
            description: purpose.description
          }
        }],
        version: 1
      })
      expect(result[0].returnsFrequency).to.equal('day')
      expect(result[0].startDate).to.equal(summerStartDate)
      expect(result[0].status).to.equal('due')
      expect(result[0].source).to.equal('WRLS')
      expect(result[1].dueDate).to.equal(summerDueDate)
      expect(result[1].endDate).to.equal(summerEndDate)
      expect(result[1].id).to.equal(`v1:${region.naldRegionId}:${licence.licenceRef}:${returnRequirement2.legacyId}:${summerStartDate}:${summerEndDate}`)
      expect(result[1].licenceRef).to.equal(licence.licenceRef)
      expect(result[1].metadata).to.equal({
        description: 'BOREHOLE AT AVALON',
        isCurrent: true,
        isFinal: false,
        isSummer: true,
        isTwoPartTariff: false,
        isUpload: false,
        nald: {
          regionCode: region.naldRegionId,
          areaCode: licence.regions.historicalAreaCode,
          formatId: returnRequirement2.legacyId,
          periodStartDay: returnRequirement2.abstractionPeriodStartDay.toString(),
          periodStartMonth: returnRequirement2.abstractionPeriodStartMonth.toString(),
          periodEndDay: returnRequirement2.abstractionPeriodEndDay.toString(),
          periodEndMonth: returnRequirement2.abstractionPeriodEndMonth.toString()
        },
        points: [{
          name: returnRequirementPoint2.description,
          ngr1: returnRequirementPoint2.ngr1,
          ngr2: returnRequirementPoint2.ngr2,
          ngr3: returnRequirementPoint2.ngr3,
          ngr4: returnRequirementPoint2.ngr4
        }],
        purposes: [{
          alias: returnRequirementPurpose2.alias,
          primary: {
            code: primaryPurpose2.legacyId,
            description: primaryPurpose2.description
          },
          secondary: {
            code: secondaryPurpose2.legacyId,
            description: secondaryPurpose2.description
          },
          tertiary: {
            code: purpose2.legacyId,
            description: purpose2.description
          }
        }],
        version: 1
      })
      expect(result[1].returnsFrequency).to.equal('day')
      expect(result[1].startDate).to.equal(summerStartDate)
      expect(result[1].status).to.equal('due')
      expect(result[1].source).to.equal('WRLS')
    })
  })

  describe('when isSummer is false, there is an expired date, one return requirement and a licenceRef provided', () => {
    const expiredDate = new Date(new Date().getFullYear() + 1, 1, 31).toISOString().split('T')[0]
    const primaryPurpose = PrimaryPurposeHelper.select()
    const purpose = PurposeHelper.select()
    const secondaryPurpose = SecondaryPurposeHelper.select()

    let licence
    let region
    let returnVersion
    let returnRequirement
    let returnRequirementPoint
    let returnRequirementPurpose

    before(async () => {
      region = RegionHelper.select()
      licence = await LicenceHelper.add({ expiredDate, regionId: region.id })
      returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })
      returnRequirement = await ReturnRequirementHelper.add({ returnVersionId: returnVersion.id })
      returnRequirementPoint = await ReturnRequirementPointHelper.add({ returnRequirementId: returnRequirement.id })
      returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
        primaryPurposeId: primaryPurpose.id,
        purposeId: purpose.id,
        returnRequirementId: returnRequirement.id,
        secondaryPurposeId: secondaryPurpose.id
      })
    })

    it('should return one return log payload', async () => {
      const result = await FetchReturnLogsService.go(false, licence.licenceRef)

      expect(result.length).to.equal(1)
      expect(result[0].dueDate).to.equal(allYearDueDate)
      expect(result[0].endDate).to.equal(expiredDate)
      expect(result[0].id).to.equal(`v1:${region.naldRegionId}:${licence.licenceRef}:${returnRequirement.legacyId}:${allYearStartDate}:${expiredDate}`)
      expect(result[0].licenceRef).to.equal(licence.licenceRef)
      expect(result[0].metadata).to.equal({
        description: 'BOREHOLE AT AVALON',
        isCurrent: true,
        isFinal: true,
        isSummer: false,
        isTwoPartTariff: false,
        isUpload: false,
        nald: {
          regionCode: region.naldRegionId,
          areaCode: licence.regions.historicalAreaCode,
          formatId: returnRequirement.legacyId,
          periodStartDay: returnRequirement.abstractionPeriodStartDay.toString(),
          periodStartMonth: returnRequirement.abstractionPeriodStartMonth.toString(),
          periodEndDay: returnRequirement.abstractionPeriodEndDay.toString(),
          periodEndMonth: returnRequirement.abstractionPeriodEndMonth.toString()
        },
        points: [{
          name: returnRequirementPoint.description,
          ngr1: returnRequirementPoint.ngr1,
          ngr2: returnRequirementPoint.ngr2,
          ngr3: returnRequirementPoint.ngr3,
          ngr4: returnRequirementPoint.ngr4
        }],
        purposes: [{
          alias: returnRequirementPurpose.alias,
          primary: {
            code: primaryPurpose.legacyId,
            description: primaryPurpose.description
          },
          secondary: {
            code: secondaryPurpose.legacyId,
            description: secondaryPurpose.description
          },
          tertiary: {
            code: purpose.legacyId,
            description: purpose.description
          }
        }],
        version: 1
      })
      expect(result[0].returnsFrequency).to.equal('day')
      expect(result[0].startDate).to.equal(allYearStartDate)
      expect(result[0].status).to.equal('due')
      expect(result[0].source).to.equal('WRLS')
    })
  })

  describe('when isSummer is false, there is an expired date after the end of the cycle, one return requirement and a licenceRef provided', () => {
    const expiredDate = new Date(new Date().getFullYear() + 1, 3, 31).toISOString().split('T')[0]
    const primaryPurpose = PrimaryPurposeHelper.select()
    const purpose = PurposeHelper.select()
    const secondaryPurpose = SecondaryPurposeHelper.select()

    let licence
    let region
    let returnVersion
    let returnRequirement
    let returnRequirementPoint
    let returnRequirementPurpose

    before(async () => {
      region = RegionHelper.select()
      licence = await LicenceHelper.add({ expiredDate, regionId: region.id })
      returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })
      returnRequirement = await ReturnRequirementHelper.add({ returnVersionId: returnVersion.id })
      returnRequirementPoint = await ReturnRequirementPointHelper.add({ returnRequirementId: returnRequirement.id })
      returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
        primaryPurposeId: primaryPurpose.id,
        purposeId: purpose.id,
        returnRequirementId: returnRequirement.id,
        secondaryPurposeId: secondaryPurpose.id
      })
    })

    it('should return one return log payload', async () => {
      const result = await FetchReturnLogsService.go(false, licence.licenceRef)

      expect(result.length).to.equal(1)
      expect(result[0].dueDate).to.equal(allYearDueDate)
      expect(result[0].endDate).to.equal(allYearEndDate)
      expect(result[0].id).to.equal(`v1:${region.naldRegionId}:${licence.licenceRef}:${returnRequirement.legacyId}:${allYearStartDate}:${allYearEndDate}`)
      expect(result[0].licenceRef).to.equal(licence.licenceRef)
      expect(result[0].metadata).to.equal({
        description: 'BOREHOLE AT AVALON',
        isCurrent: true,
        isFinal: false,
        isSummer: false,
        isTwoPartTariff: false,
        isUpload: false,
        nald: {
          regionCode: region.naldRegionId,
          areaCode: licence.regions.historicalAreaCode,
          formatId: returnRequirement.legacyId,
          periodStartDay: returnRequirement.abstractionPeriodStartDay.toString(),
          periodStartMonth: returnRequirement.abstractionPeriodStartMonth.toString(),
          periodEndDay: returnRequirement.abstractionPeriodEndDay.toString(),
          periodEndMonth: returnRequirement.abstractionPeriodEndMonth.toString()
        },
        points: [{
          name: returnRequirementPoint.description,
          ngr1: returnRequirementPoint.ngr1,
          ngr2: returnRequirementPoint.ngr2,
          ngr3: returnRequirementPoint.ngr3,
          ngr4: returnRequirementPoint.ngr4
        }],
        purposes: [{
          alias: returnRequirementPurpose.alias,
          primary: {
            code: primaryPurpose.legacyId,
            description: primaryPurpose.description
          },
          secondary: {
            code: secondaryPurpose.legacyId,
            description: secondaryPurpose.description
          },
          tertiary: {
            code: purpose.legacyId,
            description: purpose.description
          }
        }],
        version: 1
      })
      expect(result[0].returnsFrequency).to.equal('day')
      expect(result[0].startDate).to.equal(allYearStartDate)
      expect(result[0].status).to.equal('due')
      expect(result[0].source).to.equal('WRLS')
    })
  })

  describe('when isSummer is true, there is a lapsed date, one return requirement and a licenceRef provided', () => {
    const lapsedDate = new Date(new Date().getFullYear() + 1, 8, 31).toISOString().split('T')[0]
    const primaryPurpose = PrimaryPurposeHelper.select()
    const purpose = PurposeHelper.select()
    const secondaryPurpose = SecondaryPurposeHelper.select()

    let licence
    let region
    let returnVersion
    let returnRequirement
    let returnRequirementPoint
    let returnRequirementPurpose

    before(async () => {
      region = RegionHelper.select()
      licence = await LicenceHelper.add({ lapsedDate, regionId: region.id })
      returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })
      returnRequirement = await ReturnRequirementHelper.add({ summer: true, returnVersionId: returnVersion.id })
      returnRequirementPoint = await ReturnRequirementPointHelper.add({ returnRequirementId: returnRequirement.id })
      returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
        primaryPurposeId: primaryPurpose.id,
        purposeId: purpose.id,
        returnRequirementId: returnRequirement.id,
        secondaryPurposeId: secondaryPurpose.id
      })
    })

    it('should return one return log payload', async () => {
      const result = await FetchReturnLogsService.go(true, licence.licenceRef)

      expect(result.length).to.equal(1)
      expect(result[0].dueDate).to.equal(summerDueDate)
      expect(result[0].endDate).to.equal(lapsedDate)
      expect(result[0].id).to.equal(`v1:${region.naldRegionId}:${licence.licenceRef}:${returnRequirement.legacyId}:${summerStartDate}:${lapsedDate}`)
      expect(result[0].licenceRef).to.equal(licence.licenceRef)
      expect(result[0].metadata).to.equal({
        description: 'BOREHOLE AT AVALON',
        isCurrent: true,
        isFinal: true,
        isSummer: true,
        isTwoPartTariff: false,
        isUpload: false,
        nald: {
          regionCode: region.naldRegionId,
          areaCode: licence.regions.historicalAreaCode,
          formatId: returnRequirement.legacyId,
          periodStartDay: returnRequirement.abstractionPeriodStartDay.toString(),
          periodStartMonth: returnRequirement.abstractionPeriodStartMonth.toString(),
          periodEndDay: returnRequirement.abstractionPeriodEndDay.toString(),
          periodEndMonth: returnRequirement.abstractionPeriodEndMonth.toString()
        },
        points: [{
          name: returnRequirementPoint.description,
          ngr1: returnRequirementPoint.ngr1,
          ngr2: returnRequirementPoint.ngr2,
          ngr3: returnRequirementPoint.ngr3,
          ngr4: returnRequirementPoint.ngr4
        }],
        purposes: [{
          alias: returnRequirementPurpose.alias,
          primary: {
            code: primaryPurpose.legacyId,
            description: primaryPurpose.description
          },
          secondary: {
            code: secondaryPurpose.legacyId,
            description: secondaryPurpose.description
          },
          tertiary: {
            code: purpose.legacyId,
            description: purpose.description
          }
        }],
        version: 1
      })
      expect(result[0].returnsFrequency).to.equal('day')
      expect(result[0].startDate).to.equal(summerStartDate)
      expect(result[0].status).to.equal('due')
      expect(result[0].source).to.equal('WRLS')
    })
  })

  describe('when isSummer is true, there is a revoked date that is after the cycle, one return requirement and a licenceRef provided', () => {
    const revokedDate = new Date(new Date().getFullYear() + 1, 10, 31).toISOString().split('T')[0]
    const primaryPurpose = PrimaryPurposeHelper.select()
    const purpose = PurposeHelper.select()
    const secondaryPurpose = SecondaryPurposeHelper.select()

    let licence
    let region
    let returnVersion
    let returnRequirement
    let returnRequirementPoint
    let returnRequirementPurpose

    before(async () => {
      region = RegionHelper.select()
      licence = await LicenceHelper.add({ revokedDate, regionId: region.id })
      returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })
      returnRequirement = await ReturnRequirementHelper.add({ summer: true, returnVersionId: returnVersion.id })
      returnRequirementPoint = await ReturnRequirementPointHelper.add({ returnRequirementId: returnRequirement.id })
      returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
        primaryPurposeId: primaryPurpose.id,
        purposeId: purpose.id,
        returnRequirementId: returnRequirement.id,
        secondaryPurposeId: secondaryPurpose.id
      })
    })

    it('should return one return log payload', async () => {
      const result = await FetchReturnLogsService.go(true, licence.licenceRef)

      expect(result.length).to.equal(1)
      expect(result[0].dueDate).to.equal(summerDueDate)
      expect(result[0].endDate).to.equal(summerEndDate)
      expect(result[0].id).to.equal(`v1:${region.naldRegionId}:${licence.licenceRef}:${returnRequirement.legacyId}:${summerStartDate}:${summerEndDate}`)
      expect(result[0].licenceRef).to.equal(licence.licenceRef)
      expect(result[0].metadata).to.equal({
        description: 'BOREHOLE AT AVALON',
        isCurrent: true,
        isFinal: false,
        isSummer: true,
        isTwoPartTariff: false,
        isUpload: false,
        nald: {
          regionCode: region.naldRegionId,
          areaCode: licence.regions.historicalAreaCode,
          formatId: returnRequirement.legacyId,
          periodStartDay: returnRequirement.abstractionPeriodStartDay.toString(),
          periodStartMonth: returnRequirement.abstractionPeriodStartMonth.toString(),
          periodEndDay: returnRequirement.abstractionPeriodEndDay.toString(),
          periodEndMonth: returnRequirement.abstractionPeriodEndMonth.toString()
        },
        points: [{
          name: returnRequirementPoint.description,
          ngr1: returnRequirementPoint.ngr1,
          ngr2: returnRequirementPoint.ngr2,
          ngr3: returnRequirementPoint.ngr3,
          ngr4: returnRequirementPoint.ngr4
        }],
        purposes: [{
          alias: returnRequirementPurpose.alias,
          primary: {
            code: primaryPurpose.legacyId,
            description: primaryPurpose.description
          },
          secondary: {
            code: secondaryPurpose.legacyId,
            description: secondaryPurpose.description
          },
          tertiary: {
            code: purpose.legacyId,
            description: purpose.description
          }
        }],
        version: 1
      })
      expect(result[0].returnsFrequency).to.equal('day')
      expect(result[0].startDate).to.equal(summerStartDate)
      expect(result[0].status).to.equal('due')
      expect(result[0].source).to.equal('WRLS')
    })
  })

  describe('when isSummer is false, and no licenceReference is provided it should return all the return logs that are eligible', () => {
    it('should return three return log payloads', async () => {
      const result = await FetchReturnLogsService.go(false)

      expect(result.length).to.equal(5)
    })
  })

  describe('when isSummer is true, and no licenceReference is provided it should return all the return logs that are eligible', () => {
    it('should return three return log payloads', async () => {
      const result = await FetchReturnLogsService.go(true)

      expect(result.length).to.equal(5)
    })
  })
})