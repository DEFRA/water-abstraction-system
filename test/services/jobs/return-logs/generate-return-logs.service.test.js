'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, after } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { returnCycleDates } = require('../../../../app/lib/static-lookups.lib.js')
const { formatDateObjectToISO } = require('../../../../app/lib/dates.lib.js')
const FetchReturnCycleService = require('../../../../app/services/jobs/return-logs/fetch-return-cycle.service.js')
const FetchReturnRequirementsService = require('../../../../app/services/jobs/return-logs/fetch-return-requirements.service.js')
const GenerateReturnCycleService = require('../../../../app/services/jobs/return-logs/generate-return-cycle.service.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const PointHelper = require('../../../support/helpers/point.helper.js')
const PrimaryPurposeHelper = require('../../../support/helpers/primary-purpose.helper.js')
const PurposeHelper = require('../../../support/helpers/purpose.helper.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')
const ReturnRequirementHelper = require('../../../support/helpers/return-requirement.helper.js')
const ReturnRequirementPointHelper = require('../../../support/helpers/return-requirement-point.helper.js')
const ReturnRequirementPurposeHelper = require('../../../support/helpers/return-requirement-purpose.helper.js')
const ReturnVersionHelper = require('../../../support/helpers/return-version.helper.js')
const SecondaryPurposeHelper = require('../../../support/helpers/secondary-purpose.helper.js')

// Thing under test
const GenerateReturnLogsService = require('../../../../app/services/jobs/return-logs/generate-return-logs.service.js')

describe('Generate return logs service', () => {
  const today = new Date()
  const month = today.getMonth()
  const year = today.getFullYear()

  let allYearDueDate = formatDateObjectToISO(new Date(year, 3, 28))
  let allYearEndDate = formatDateObjectToISO(new Date(year, 2, 31))
  let allYearStartDate = formatDateObjectToISO(new Date(year, 3, 1))
  let expiredDate
  let lapsedDate = formatDateObjectToISO(new Date(year, 8, 30))
  let licence
  let point
  let point2
  let primaryPurpose
  let primaryPurpose2
  let purpose
  let purpose2
  let region
  let returnVersion
  let returnRequirement
  let returnRequirement2
  let returnRequirementPurpose
  let returnRequirementPurpose2
  let returnRequirements
  let revokedDate
  let secondaryPurpose
  let secondaryPurpose2
  let startDate = formatDateObjectToISO(new Date(year, 11, 1))
  let summer
  let summerDueDate = formatDateObjectToISO(new Date(year, 10, 28))
  let summerEndDate = formatDateObjectToISO(new Date(year, 9, 31))
  let summerStartDate = formatDateObjectToISO(new Date(year, 10, 1))

  if (month > returnCycleDates.allYear.endDate.month) {
    allYearDueDate = formatDateObjectToISO(new Date(year + 1, 3, 28))
    allYearEndDate = formatDateObjectToISO(new Date(year + 1, 2, 31))
  }

  if (month > returnCycleDates.summer.endDate.month) {
    summerDueDate = formatDateObjectToISO(new Date(year + 1, 10, 28))
    summerEndDate = formatDateObjectToISO(new Date(year + 1, 9, 31))
    lapsedDate = formatDateObjectToISO(new Date(year + 1, 8, 30))
  }

  if (month < returnCycleDates.summer.startDate.month) {
    summerStartDate = formatDateObjectToISO(new Date(year - 1, 10, 1))
    startDate = formatDateObjectToISO(new Date(year - 1, 11, 1))
  }

  if (month < returnCycleDates.allYear.startDate.month) {
    allYearStartDate = formatDateObjectToISO(new Date(year - 1, 3, 1))
  }

  const summerReturns = []
  const allYearReturns = []
  const allYearReturnCycleId = 'c095d75e-0e0d-4fe4-b048-150457f3871b'
  const summerReturnCycleId = 'd095d75e-0e0d-4fe4-b048-150457f3871f'
  const todayAsIso = formatDateObjectToISO(new Date())

  describe('when return cycle exists', () => {
    before(async () => {
      Sinon.stub(FetchReturnCycleService, 'go')
        .withArgs(todayAsIso, false).returns(allYearReturnCycleId)
        .withArgs(todayAsIso, true).returns(summerReturnCycleId)
    })

    describe('when summer is false', () => {
      before(async () => {
        summer = false
      })

      describe('has one return requirement and a licenceRef provided', () => {
        before(async () => {
          region = RegionHelper.select()
          licence = await LicenceHelper.add({ regionId: region.id })
          returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })

          returnRequirement = await ReturnRequirementHelper.add({ returnVersionId: returnVersion.id })
          point = await PointHelper.add()
          await ReturnRequirementPointHelper.add({ pointId: point.id, returnRequirementId: returnRequirement.id })
          primaryPurpose = PrimaryPurposeHelper.select()
          purpose = PurposeHelper.select()
          secondaryPurpose = SecondaryPurposeHelper.select()
          returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
            alias: null,
            primaryPurposeId: primaryPurpose.id,
            purposeId: purpose.id,
            returnRequirementId: returnRequirement.id,
            secondaryPurposeId: secondaryPurpose.id
          })
          allYearReturns.push(returnRequirement.legacyId.toString())

          returnRequirements = await FetchReturnRequirementsService.go(summer, licence.licenceRef)
        })

        it('should return one return log payload', async () => {
          const result = await GenerateReturnLogsService.go(returnRequirements)

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
              name: point.description,
              ngr1: point.ngr1,
              ngr2: point.ngr2,
              ngr3: point.ngr3,
              ngr4: point.ngr4
            }],
            purposes: [{
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
          expect(result[0].returnCycleId).to.equal(allYearReturnCycleId)
          expect(result[0].returnsFrequency).to.equal('day')
          expect(result[0].startDate).to.equal(allYearStartDate)
          expect(result[0].status).to.equal('due')
          expect(result[0].source).to.equal('WRLS')
        })
      })

      describe('has two return requirements and a licenceRef provided', () => {
        before(async () => {
          region = RegionHelper.select()
          licence = await LicenceHelper.add({ regionId: region.id })
          returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })

          returnRequirement = await ReturnRequirementHelper.add({ returnVersionId: returnVersion.id })
          point = await PointHelper.add()
          await ReturnRequirementPointHelper.add({ pointId: point.id, returnRequirementId: returnRequirement.id })
          primaryPurpose = PrimaryPurposeHelper.select()
          purpose = PurposeHelper.select()
          secondaryPurpose = SecondaryPurposeHelper.select()
          returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
            primaryPurposeId: primaryPurpose.id,
            purposeId: purpose.id,
            returnRequirementId: returnRequirement.id,
            secondaryPurposeId: secondaryPurpose.id
          })

          returnRequirement2 = await ReturnRequirementHelper.add({ returnVersionId: returnVersion.id })
          point2 = await PointHelper.add()
          await ReturnRequirementPointHelper.add({ pointId: point2.id, returnRequirementId: returnRequirement2.id })
          primaryPurpose2 = PrimaryPurposeHelper.select()
          purpose2 = PurposeHelper.select()
          secondaryPurpose2 = SecondaryPurposeHelper.select()
          returnRequirementPurpose2 = await ReturnRequirementPurposeHelper.add({
            primaryPurposeId: primaryPurpose2.id,
            purposeId: purpose2.id,
            returnRequirementId: returnRequirement2.id,
            secondaryPurposeId: secondaryPurpose2.id
          })
          allYearReturns.push(returnRequirement.legacyId.toString())
          allYearReturns.push(returnRequirement2.legacyId.toString())
        })

        it('should return two return log payloads', async () => {
          const returnRequirements = await FetchReturnRequirementsService.go(summer, licence.licenceRef)
          const result = await GenerateReturnLogsService.go(returnRequirements)

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
              name: point.description,
              ngr1: point.ngr1,
              ngr2: point.ngr2,
              ngr3: point.ngr3,
              ngr4: point.ngr4
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
          expect(result[0].returnCycleId).to.equal(allYearReturnCycleId)
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
              name: point2.description,
              ngr1: point2.ngr1,
              ngr2: point2.ngr2,
              ngr3: point2.ngr3,
              ngr4: point2.ngr4
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
          expect(result[1].returnCycleId).to.equal(allYearReturnCycleId)
          expect(result[1].returnsFrequency).to.equal('day')
          expect(result[1].startDate).to.equal(allYearStartDate)
          expect(result[1].status).to.equal('due')
          expect(result[1].source).to.equal('WRLS')
        })
      })

      describe('there is an expired date, one return requirement and a licenceRef provided', () => {
        before(async () => {
          expiredDate = new Date(year + 1, 1, 31).toISOString().split('T')[0]
          region = RegionHelper.select()
          licence = await LicenceHelper.add({ expiredDate, regionId: region.id })
          returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })

          returnRequirement = await ReturnRequirementHelper.add({ returnVersionId: returnVersion.id })
          point = await PointHelper.add()
          await ReturnRequirementPointHelper.add({ pointId: point.id, returnRequirementId: returnRequirement.id })
          primaryPurpose = PrimaryPurposeHelper.select()
          purpose = PurposeHelper.select()
          secondaryPurpose = SecondaryPurposeHelper.select()
          returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
            primaryPurposeId: primaryPurpose.id,
            purposeId: purpose.id,
            returnRequirementId: returnRequirement.id,
            secondaryPurposeId: secondaryPurpose.id
          })
          allYearReturns.push(returnRequirement.legacyId.toString())

          returnRequirements = await FetchReturnRequirementsService.go(summer, licence.licenceRef)
        })

        it('should return one return log payload', async () => {
          const result = await GenerateReturnLogsService.go(returnRequirements)

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
              name: point.description,
              ngr1: point.ngr1,
              ngr2: point.ngr2,
              ngr3: point.ngr3,
              ngr4: point.ngr4
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
          expect(result[0].returnCycleId).to.equal(allYearReturnCycleId)
          expect(result[0].returnsFrequency).to.equal('day')
          expect(result[0].startDate).to.equal(allYearStartDate)
          expect(result[0].status).to.equal('due')
          expect(result[0].source).to.equal('WRLS')
        })
      })

      describe('there is an expired date after the end of the cycle, one return requirement and a licenceRef provided', () => {
        before(async () => {
          expiredDate = new Date(year + 1, 3, 31).toISOString().split('T')[0]
          region = RegionHelper.select()
          licence = await LicenceHelper.add({ expiredDate, regionId: region.id })
          returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })

          returnRequirement = await ReturnRequirementHelper.add({ returnVersionId: returnVersion.id })
          point = await PointHelper.add()
          await ReturnRequirementPointHelper.add({ pointId: point.id, returnRequirementId: returnRequirement.id })
          primaryPurpose = PrimaryPurposeHelper.select()
          purpose = PurposeHelper.select()
          secondaryPurpose = SecondaryPurposeHelper.select()
          returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
            primaryPurposeId: primaryPurpose.id,
            purposeId: purpose.id,
            returnRequirementId: returnRequirement.id,
            secondaryPurposeId: secondaryPurpose.id
          })
          allYearReturns.push(returnRequirement.legacyId.toString())

          returnRequirements = await FetchReturnRequirementsService.go(summer, licence.licenceRef)
        })

        it('should return one return log payload', async () => {
          const result = await GenerateReturnLogsService.go(returnRequirements)

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
              name: point.description,
              ngr1: point.ngr1,
              ngr2: point.ngr2,
              ngr3: point.ngr3,
              ngr4: point.ngr4
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
          expect(result[0].returnCycleId).to.equal(allYearReturnCycleId)
          expect(result[0].returnsFrequency).to.equal('day')
          expect(result[0].startDate).to.equal(allYearStartDate)
          expect(result[0].status).to.equal('due')
          expect(result[0].source).to.equal('WRLS')
        })
      })

      describe('there is no licenceReference provided it should return all the return logs that are eligible', () => {
        it('should return five return log payloads', async () => {
          const returnRequirements = await FetchReturnRequirementsService.go(false)
          const results = await GenerateReturnLogsService.go(returnRequirements)

          const returnRequirementExternalId = results.map((returnLog) => {
            return returnLog.returnReference
          })

          expect(allYearReturns.every((result) => {
            return returnRequirementExternalId.includes(result)
          })).to.equal(true)
        })
      })
    })

    describe('when summer is true', () => {
      before(async () => {
        summer = true
      })

      describe('has one return requirement and a licenceRef provided', () => {
        before(async () => {
          region = RegionHelper.select()
          licence = await LicenceHelper.add({ regionId: region.id })
          returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })

          returnRequirement = await ReturnRequirementHelper.add({ summer, returnVersionId: returnVersion.id })
          point = await PointHelper.add()
          await ReturnRequirementPointHelper.add({ pointId: point.id, returnRequirementId: returnRequirement.id })
          primaryPurpose = PrimaryPurposeHelper.select()
          purpose = PurposeHelper.select()
          secondaryPurpose = SecondaryPurposeHelper.select()
          returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
            primaryPurposeId: primaryPurpose.id,
            purposeId: purpose.id,
            returnRequirementId: returnRequirement.id,
            secondaryPurposeId: secondaryPurpose.id
          })
          summerReturns.push(returnRequirement.legacyId.toString())

          returnRequirements = await FetchReturnRequirementsService.go(summer, licence.licenceRef)
        })

        it('should return one return log payload', async () => {
          const result = await GenerateReturnLogsService.go(returnRequirements)

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
              name: point.description,
              ngr1: point.ngr1,
              ngr2: point.ngr2,
              ngr3: point.ngr3,
              ngr4: point.ngr4
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
          expect(result[0].returnCycleId).to.equal(summerReturnCycleId)
          expect(result[0].returnsFrequency).to.equal('day')
          expect(result[0].startDate).to.equal(summerStartDate)
          expect(result[0].status).to.equal('due')
          expect(result[0].source).to.equal('WRLS')
        })
      })

      describe('has two return requirements and a licenceRef provided', () => {
        before(async () => {
          region = RegionHelper.select()
          licence = await LicenceHelper.add({ regionId: region.id })
          returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })

          returnRequirement = await ReturnRequirementHelper.add({ summer, returnVersionId: returnVersion.id })
          point = await PointHelper.add()
          await ReturnRequirementPointHelper.add({ pointId: point.id, returnRequirementId: returnRequirement.id })
          primaryPurpose = PrimaryPurposeHelper.select()
          purpose = PurposeHelper.select()
          secondaryPurpose = SecondaryPurposeHelper.select()
          returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
            primaryPurposeId: primaryPurpose.id,
            purposeId: purpose.id,
            returnRequirementId: returnRequirement.id,
            secondaryPurposeId: secondaryPurpose.id
          })

          returnRequirement2 = await ReturnRequirementHelper.add({ summer, returnVersionId: returnVersion.id })
          point2 = await PointHelper.add()
          await ReturnRequirementPointHelper.add({ pointId: point2.id, returnRequirementId: returnRequirement2.id })
          primaryPurpose2 = PrimaryPurposeHelper.select()
          purpose2 = PurposeHelper.select()
          secondaryPurpose2 = SecondaryPurposeHelper.select()
          returnRequirementPurpose2 = await ReturnRequirementPurposeHelper.add({
            primaryPurposeId: primaryPurpose2.id,
            purposeId: purpose2.id,
            returnRequirementId: returnRequirement2.id,
            secondaryPurposeId: secondaryPurpose2.id
          })
          summerReturns.push(returnRequirement.legacyId.toString())
          summerReturns.push(returnRequirement2.legacyId.toString())

          returnRequirements = await FetchReturnRequirementsService.go(summer, licence.licenceRef)
        })

        it('should return two return log payloads', async () => {
          const result = await GenerateReturnLogsService.go(returnRequirements)

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
              name: point.description,
              ngr1: point.ngr1,
              ngr2: point.ngr2,
              ngr3: point.ngr3,
              ngr4: point.ngr4
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
          expect(result[0].returnCycleId).to.equal(summerReturnCycleId)
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
              name: point2.description,
              ngr1: point2.ngr1,
              ngr2: point2.ngr2,
              ngr3: point2.ngr3,
              ngr4: point2.ngr4
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
          expect(result[1].returnCycleId).to.equal(summerReturnCycleId)
          expect(result[1].returnsFrequency).to.equal('day')
          expect(result[1].startDate).to.equal(summerStartDate)
          expect(result[1].status).to.equal('due')
          expect(result[1].source).to.equal('WRLS')
        })
      })

      describe('there is a lapsed date, one return requirement and a licenceRef provided', () => {
        before(async () => {
          region = RegionHelper.select()
          licence = await LicenceHelper.add({ lapsedDate, regionId: region.id })
          returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })

          returnRequirement = await ReturnRequirementHelper.add({ summer, returnVersionId: returnVersion.id })
          point = await PointHelper.add()
          await ReturnRequirementPointHelper.add({ pointId: point.id, returnRequirementId: returnRequirement.id })
          primaryPurpose = PrimaryPurposeHelper.select()
          purpose = PurposeHelper.select()
          secondaryPurpose = SecondaryPurposeHelper.select()
          returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
            primaryPurposeId: primaryPurpose.id,
            purposeId: purpose.id,
            returnRequirementId: returnRequirement.id,
            secondaryPurposeId: secondaryPurpose.id
          })
          summerReturns.push(returnRequirement.legacyId.toString())

          returnRequirements = await FetchReturnRequirementsService.go(summer, licence.licenceRef)
        })

        it('should return one return log payload', async () => {
          const result = await GenerateReturnLogsService.go(returnRequirements)

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
              name: point.description,
              ngr1: point.ngr1,
              ngr2: point.ngr2,
              ngr3: point.ngr3,
              ngr4: point.ngr4
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
          expect(result[0].returnCycleId).to.equal(summerReturnCycleId)
          expect(result[0].returnsFrequency).to.equal('day')
          expect(result[0].startDate).to.equal(summerStartDate)
          expect(result[0].status).to.equal('due')
          expect(result[0].source).to.equal('WRLS')
        })
      })

      describe('there is a revoked date that is after the cycle, one return requirement and a licenceRef provided', () => {
        before(async () => {
          revokedDate = new Date(year + 1, 10, 31).toISOString().split('T')[0]
          region = RegionHelper.select()
          licence = await LicenceHelper.add({ revokedDate, regionId: region.id })
          returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })

          returnRequirement = await ReturnRequirementHelper.add({ summer, returnVersionId: returnVersion.id })
          point = await PointHelper.add()
          await ReturnRequirementPointHelper.add({ pointId: point.id, returnRequirementId: returnRequirement.id })
          primaryPurpose = PrimaryPurposeHelper.select()
          purpose = PurposeHelper.select()
          secondaryPurpose = SecondaryPurposeHelper.select()
          returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
            primaryPurposeId: primaryPurpose.id,
            purposeId: purpose.id,
            returnRequirementId: returnRequirement.id,
            secondaryPurposeId: secondaryPurpose.id
          })
          summerReturns.push(returnRequirement.legacyId.toString())

          returnRequirements = await FetchReturnRequirementsService.go(summer, licence.licenceRef)
        })

        it('should return one return log payload', async () => {
          const result = await GenerateReturnLogsService.go(returnRequirements)

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
              name: point.description,
              ngr1: point.ngr1,
              ngr2: point.ngr2,
              ngr3: point.ngr3,
              ngr4: point.ngr4
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
          expect(result[0].returnCycleId).to.equal(summerReturnCycleId)
          expect(result[0].returnsFrequency).to.equal('day')
          expect(result[0].startDate).to.equal(summerStartDate)
          expect(result[0].status).to.equal('due')
          expect(result[0].source).to.equal('WRLS')
        })
      })

      describe('the return version start date is after the cycle start date, one return requirement and a licenceRef provided', () => {
        before(async () => {
          region = RegionHelper.select()
          licence = await LicenceHelper.add({ regionId: region.id })
          returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id, startDate })

          returnRequirement = await ReturnRequirementHelper.add({ summer, returnVersionId: returnVersion.id })
          point = await PointHelper.add()
          await ReturnRequirementPointHelper.add({ pointId: point.id, returnRequirementId: returnRequirement.id })
          primaryPurpose = PrimaryPurposeHelper.select()
          purpose = PurposeHelper.select()
          secondaryPurpose = SecondaryPurposeHelper.select()
          returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
            primaryPurposeId: primaryPurpose.id,
            purposeId: purpose.id,
            returnRequirementId: returnRequirement.id,
            secondaryPurposeId: secondaryPurpose.id
          })
          summerReturns.push(returnRequirement.legacyId.toString())

          returnRequirements = await FetchReturnRequirementsService.go(summer, licence.licenceRef)
        })

        it('should return one return log payload', async () => {
          const result = await GenerateReturnLogsService.go(returnRequirements)

          expect(result.length).to.equal(1)
          expect(result[0].dueDate).to.equal(summerDueDate)
          expect(result[0].endDate).to.equal(summerEndDate)
          expect(result[0].id).to.equal(`v1:${region.naldRegionId}:${licence.licenceRef}:${returnRequirement.legacyId}:${startDate}:${summerEndDate}`)
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
              name: point.description,
              ngr1: point.ngr1,
              ngr2: point.ngr2,
              ngr3: point.ngr3,
              ngr4: point.ngr4
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
          expect(result[0].returnCycleId).to.equal(summerReturnCycleId)
          expect(result[0].returnsFrequency).to.equal('day')
          expect(result[0].startDate).to.equal(startDate)
          expect(result[0].status).to.equal('due')
          expect(result[0].source).to.equal('WRLS')
        })
      })

      describe('there is no licenceReference is provided it should return all the return logs that are eligible', () => {
        it('should return five return log payloads', async () => {
          const returnRequirements = await FetchReturnRequirementsService.go(true)
          const results = await GenerateReturnLogsService.go(returnRequirements)

          const returnRequirementExternalId = results.map((returnLog) => {
            return returnLog.returnReference
          })

          expect(summerReturns.every((result) => {
            return returnRequirementExternalId.includes(result)
          })).to.equal(true)
        })
      })
    })

    after(() => {
      Sinon.restore()
    })
  })

  describe('when return cycle does not exist', () => {
    before(async () => {
      Sinon.stub(FetchReturnCycleService, 'go')
        .withArgs(todayAsIso, false).returns(undefined)
        .withArgs(todayAsIso, true).returns(undefined)
      Sinon.stub(GenerateReturnCycleService, 'go')
        .withArgs(false).returns(allYearReturnCycleId)
        .withArgs(true).returns(summerReturnCycleId)
    })

    describe('has one return requirement and a licenceRef provided', () => {
      before(async () => {
        region = RegionHelper.select()
        licence = await LicenceHelper.add({ regionId: region.id })
        returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })

        returnRequirement = await ReturnRequirementHelper.add({ summer, returnVersionId: returnVersion.id })
        point = await PointHelper.add()
        await ReturnRequirementPointHelper.add({ pointId: point.id, returnRequirementId: returnRequirement.id })
        primaryPurpose = PrimaryPurposeHelper.select()
        purpose = PurposeHelper.select()
        secondaryPurpose = SecondaryPurposeHelper.select()
        returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
          primaryPurposeId: primaryPurpose.id,
          purposeId: purpose.id,
          returnRequirementId: returnRequirement.id,
          secondaryPurposeId: secondaryPurpose.id
        })
        summerReturns.push(returnRequirement.legacyId.toString())

        returnRequirements = await FetchReturnRequirementsService.go(summer, licence.licenceRef)
      })

      it('should return one return log payload', async () => {
        const result = await GenerateReturnLogsService.go(returnRequirements)

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
            name: point.description,
            ngr1: point.ngr1,
            ngr2: point.ngr2,
            ngr3: point.ngr3,
            ngr4: point.ngr4
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
        expect(result[0].returnCycleId).to.equal(summerReturnCycleId)
        expect(result[0].returnsFrequency).to.equal('day')
        expect(result[0].startDate).to.equal(summerStartDate)
        expect(result[0].status).to.equal('due')
        expect(result[0].source).to.equal('WRLS')
      })
    })
  })
})
