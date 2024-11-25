'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { formatDateObjectToISO } = require('../../../../app/lib/dates.lib.js')
const { cycleDueDate, cycleEndDate, cycleStartDate } = require('../../../../app/lib/return-cycle-dates.lib.js')
const FetchReturnCycleService = require('../../../../app/services/jobs/return-logs/fetch-return-cycle.service.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const PrimaryPurposeHelper = require('../../../support/helpers/primary-purpose.helper.js')
const PurposeHelper = require('../../../support/helpers/purpose.helper.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')
const ReturnLogModel = require('../../../../app/models/return-log.model.js')
const ReturnRequirementHelper = require('../../../support/helpers/return-requirement.helper.js')
const ReturnRequirementPointHelper = require('../../../support/helpers/return-requirement-point.helper.js')
const ReturnRequirementPurposeHelper = require('../../../support/helpers/return-requirement-purpose.helper.js')
const ReturnCycleHelper = require('../../../support/helpers/return-cycle.helper.js')
const ReturnVersionHelper = require('../../../support/helpers/return-version.helper.js')
const SecondaryPurposeHelper = require('../../../support/helpers/secondary-purpose.helper.js')

// Things we need to stub
const GenerateReturnLogsService = require('../../../../app/services/jobs/return-logs/generate-return-logs.service.js')

// Thing under test
const ProcessReturnLogsService = require('../../../../app/services/jobs/return-logs/process-return-logs.service.js')

describe('Process return logs service', () => {
  const allYearDueDate = cycleDueDate(false)
  const allYearEndDate = cycleEndDate(false)
  const allYearEndDateAsISO = formatDateObjectToISO(allYearEndDate)
  const allYearStartDate = cycleStartDate(false)
  const allYearStartDateAsISO = formatDateObjectToISO(allYearStartDate)
  const summerDueDate = cycleDueDate(true)
  const summerEndDate = cycleEndDate(true)
  const summerEndDateAsISO = formatDateObjectToISO(summerEndDate)
  const summerStartDate = cycleStartDate(true)
  const summerStartDateAsISO = formatDateObjectToISO(summerStartDate)

  let allYearReturnCycle
  let cycle
  let licence
  let licence2
  let notifierStub
  let point
  let point2
  let primaryPurpose
  let purpose
  let region
  let returnVersion
  let returnVersion2
  let returnRequirement
  let returnRequirement2
  let secondaryPurpose
  let summerReturnCycle

  afterEach(() => {
    Sinon.restore()
  })

  describe('cycle is "all-year" and a licence reference is provided', () => {
    before(async () => {
      cycle = 'all-year'
      allYearReturnCycle = await ReturnCycleHelper.select(0, false)
      region = RegionHelper.select()
      licence = await LicenceHelper.add({ regionId: region.id })
      returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })
      returnRequirement = await ReturnRequirementHelper.add({
        regionId: region.naldRegionId,
        returnVersionId: returnVersion.id
      })
      await ReturnRequirementPointHelper.add({ returnRequirementId: returnRequirement.id })
      primaryPurpose = PrimaryPurposeHelper.select()
      purpose = PurposeHelper.select()
      secondaryPurpose = SecondaryPurposeHelper.select()
      await ReturnRequirementPurposeHelper.add({
        alias: null,
        primaryPurposeId: primaryPurpose.id,
        purposeId: purpose.id,
        returnRequirementId: returnRequirement.id,
        secondaryPurposeId: secondaryPurpose.id
      })

      // BaseRequest depends on the GlobalNotifier to have been set.
      // This happens in app/plugins/global-notifier.plugin.js when the app starts up and the plugin is registered.
      // As we're not creating an instance of Hapi server in this test we recreate the condition by setting
      // it directly with our own stub
      notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
      global.GlobalNotifier = notifierStub
    })

    it('can successfully save a return log in the database', async () => {
      await ProcessReturnLogsService.go(cycle, licence.licenceRef)

      const result = await ReturnLogModel.query().where('licenceRef', licence.licenceRef)

      expect(result.length).to.equal(1)
      expect(result[0].dueDate).to.equal(allYearDueDate)
      expect(result[0].endDate).to.equal(allYearEndDate)
      expect(result[0].id).to.equal(
        `v1:${region.naldRegionId}:${licence.licenceRef}:${returnRequirement.legacyId}:${allYearStartDateAsISO}:${allYearEndDateAsISO}`
      )
      expect(result[0].licenceRef).to.equal(licence.licenceRef)
      expect(result[0].returnsFrequency).to.equal('day')
      expect(result[0].startDate).to.equal(allYearStartDate)
      expect(result[0].status).to.equal('due')
      expect(result[0].source).to.equal('WRLS')
      expect(result[0].returnCycleId).to.equal(allYearReturnCycle.id)
    })
  })

  describe('cycle is "all-year" and a licence reference is not provided', () => {
    before(async () => {
      cycle = 'all-year'
      allYearReturnCycle = await ReturnCycleHelper.select(0, false)
      region = RegionHelper.select()
      licence = await LicenceHelper.add({ regionId: region.id })
      licence2 = await LicenceHelper.add({ regionId: region.id })
      returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })
      returnVersion2 = await ReturnVersionHelper.add({ licenceId: licence2.id })
      returnRequirement = await ReturnRequirementHelper.add({
        regionId: region.naldRegionId,
        returnVersionId: returnVersion.id
      })
      returnRequirement2 = await ReturnRequirementHelper.add({
        regionId: region.naldRegionId,
        returnVersionId: returnVersion2.id
      })
      point = await ReturnRequirementPointHelper.add({ returnRequirementId: returnRequirement.id })
      point2 = await ReturnRequirementPointHelper.add({ returnRequirementId: returnRequirement2.id })
      primaryPurpose = PrimaryPurposeHelper.select()
      purpose = PurposeHelper.select()
      secondaryPurpose = SecondaryPurposeHelper.select()
      await ReturnRequirementPurposeHelper.add({
        alias: null,
        primaryPurposeId: primaryPurpose.id,
        purposeId: purpose.id,
        returnRequirementId: returnRequirement.id,
        secondaryPurposeId: secondaryPurpose.id
      })

      // BaseRequest depends on the GlobalNotifier to have been set.
      // This happens in app/plugins/global-notifier.plugin.js when the app starts up and the plugin is registered.
      // As we're not creating an instance of Hapi server in this test we recreate the condition by setting
      // it directly with our own stub
      notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
      global.GlobalNotifier = notifierStub
      Sinon.stub(GenerateReturnLogsService, 'go')
        .onFirstCall()
        .resolves({
          createdAt: new Date(),
          updatedAt: new Date(),
          dueDate: allYearDueDate,
          endDate: allYearEndDate,
          id: `v1:${region.naldRegionId}:${licence.licenceRef}:${returnRequirement.legacyId}:${allYearStartDateAsISO}:${allYearEndDateAsISO}`,
          licenceRef: licence.licenceRef,
          metadata: {
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
            points: [
              {
                name: point.description,
                ngr1: point.ngr1,
                ngr2: point.ngr2,
                ngr3: point.ngr3,
                ngr4: point.ngr4
              }
            ],
            purposes: [
              {
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
              }
            ],
            version: 1
          },
          returnCycleId: allYearReturnCycle.id,
          returnsFrequency: 'day',
          returnReference: returnRequirement.legacyId.toString(),
          startDate: allYearStartDate,
          status: 'due',
          source: 'WRLS'
        })
        .onSecondCall()
        .resolves({
          createdAt: new Date(),
          updatedAt: new Date(),
          dueDate: allYearDueDate,
          endDate: allYearEndDate,
          id: `v1:${region.naldRegionId}:${licence2.licenceRef}:${returnRequirement2.legacyId}:${allYearStartDateAsISO}:${allYearEndDateAsISO}`,
          licenceRef: licence2.licenceRef,
          metadata: {
            description: 'BOREHOLE AT AVALON',
            isCurrent: true,
            isFinal: false,
            isSummer: false,
            isTwoPartTariff: false,
            isUpload: false,
            nald: {
              regionCode: region.naldRegionId,
              areaCode: licence2.regions.historicalAreaCode,
              formatId: returnRequirement2.legacyId,
              periodStartDay: returnRequirement2.abstractionPeriodStartDay.toString(),
              periodStartMonth: returnRequirement2.abstractionPeriodStartMonth.toString(),
              periodEndDay: returnRequirement2.abstractionPeriodEndDay.toString(),
              periodEndMonth: returnRequirement2.abstractionPeriodEndMonth.toString()
            },
            points: [
              {
                name: point2.description,
                ngr1: point2.ngr1,
                ngr2: point2.ngr2,
                ngr3: point2.ngr3,
                ngr4: point2.ngr4
              }
            ],
            purposes: [
              {
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
              }
            ],
            version: 1
          },
          returnCycleId: allYearReturnCycle.id,
          returnsFrequency: 'day',
          returnReference: returnRequirement2.legacyId.toString(),
          startDate: allYearStartDate,
          status: 'due',
          source: 'WRLS'
        })
    })

    it('can successfully save a return log in the database', async () => {
      await ProcessReturnLogsService.go(cycle)
      const results = await ReturnLogModel.query().where('returnCycleId', allYearReturnCycle.id)

      const ids = results.map((result) => {
        return result.id
      })

      expect(ids).includes(
        `v1:${region.naldRegionId}:${licence.licenceRef}:${returnRequirement.legacyId}:${allYearStartDateAsISO}:${allYearEndDateAsISO}`
      )
      expect(ids).includes(
        `v1:${region.naldRegionId}:${licence2.licenceRef}:${returnRequirement2.legacyId}:${allYearStartDateAsISO}:${allYearEndDateAsISO}`
      )
    })
  })

  describe('cycle is "all-year" and a licence reference is provided but there is no exisiting return cycle', () => {
    before(async () => {
      cycle = 'all-year'
      allYearReturnCycle = await ReturnCycleHelper.select(0, false)
      region = RegionHelper.select()
      licence = await LicenceHelper.add({ regionId: region.id })
      returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })
      returnRequirement = await ReturnRequirementHelper.add({ returnVersionId: returnVersion.id })
      await ReturnRequirementPointHelper.add({ returnRequirementId: returnRequirement.id })
      primaryPurpose = PrimaryPurposeHelper.select()
      purpose = PurposeHelper.select()
      secondaryPurpose = SecondaryPurposeHelper.select()
      await ReturnRequirementPurposeHelper.add({
        alias: null,
        primaryPurposeId: primaryPurpose.id,
        purposeId: purpose.id,
        returnRequirementId: returnRequirement.id,
        secondaryPurposeId: secondaryPurpose.id
      })

      // BaseRequest depends on the GlobalNotifier to have been set.
      // This happens in app/plugins/global-notifier.plugin.js when the app starts up and the plugin is registered.
      // As we're not creating an instance of Hapi server in this test we recreate the condition by setting
      // it directly with our own stub
      notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
      Sinon.stub(FetchReturnCycleService, 'go').resolves(undefined)
      global.GlobalNotifier = notifierStub
    })

    it('can successfully create a return cycle and can successfully save a return log in the database', async () => {
      await ProcessReturnLogsService.go(cycle, licence.licenceRef)

      const result = await ReturnLogModel.query().where('licenceRef', licence.licenceRef)

      expect(result.length).to.equal(1)
      expect(result[0].dueDate).to.equal(allYearDueDate)
      expect(result[0].endDate).to.equal(allYearEndDate)
      expect(result[0].id).to.equal(
        `v1:${region.naldRegionId}:${licence.licenceRef}:${returnRequirement.legacyId}:${allYearStartDateAsISO}:${allYearEndDateAsISO}`
      )
      expect(result[0].licenceRef).to.equal(licence.licenceRef)
      expect(result[0].returnsFrequency).to.equal('day')
      expect(result[0].startDate).to.equal(allYearStartDate)
      expect(result[0].status).to.equal('due')
      expect(result[0].source).to.equal('WRLS')
      expect(result[0].returnCycleId).to.equal(allYearReturnCycle.id)
    })
  })

  describe('cycle is "all-year" and a licence reference is provided but there is no matching return requirements', () => {
    before(async () => {
      cycle = 'all-year'
      Sinon.stub(GenerateReturnLogsService, 'go').resolves([])
    })

    it('will not save anything in the database', async () => {
      await ProcessReturnLogsService.go(cycle, 'testReference')

      const result = await ReturnLogModel.query().where('licenceRef', 'testReference')

      expect(result.length).to.equal(0)
    })
  })

  describe('cycle is "summer" and a licence reference is provided', () => {
    before(async () => {
      cycle = 'summer'
      summerReturnCycle = await ReturnCycleHelper.select(0, true)
      region = RegionHelper.select()
      licence = await LicenceHelper.add({ regionId: region.id })
      returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })
      returnRequirement = await ReturnRequirementHelper.add({
        regionId: region.naldRegionId,
        returnVersionId: returnVersion.id,
        summer: true
      })
      await ReturnRequirementPointHelper.add({ returnRequirementId: returnRequirement.id })
      primaryPurpose = PrimaryPurposeHelper.select()
      purpose = PurposeHelper.select()
      secondaryPurpose = SecondaryPurposeHelper.select()
      await ReturnRequirementPurposeHelper.add({
        alias: null,
        primaryPurposeId: primaryPurpose.id,
        purposeId: purpose.id,
        returnRequirementId: returnRequirement.id,
        secondaryPurposeId: secondaryPurpose.id
      })

      // BaseRequest depends on the GlobalNotifier to have been set.
      // This happens in app/plugins/global-notifier.plugin.js when the app starts up and the plugin is registered.
      // As we're not creating an instance of Hapi server in this test we recreate the condition by setting
      // it directly with our own stub
      notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
      global.GlobalNotifier = notifierStub
    })

    it('can successfully save a return log in the database', async () => {
      await ProcessReturnLogsService.go(cycle, licence.licenceRef)

      const result = await ReturnLogModel.query().where('licenceRef', licence.licenceRef)

      expect(result.length).to.equal(1)
      expect(result[0].dueDate).to.equal(summerDueDate)
      expect(result[0].endDate).to.equal(summerEndDate)
      expect(result[0].id).to.equal(
        `v1:${region.naldRegionId}:${licence.licenceRef}:${returnRequirement.legacyId}:${summerStartDateAsISO}:${summerEndDateAsISO}`
      )
      expect(result[0].licenceRef).to.equal(licence.licenceRef)
      expect(result[0].returnsFrequency).to.equal('day')
      expect(result[0].startDate).to.equal(summerStartDate)
      expect(result[0].status).to.equal('due')
      expect(result[0].source).to.equal('WRLS')
      expect(result[0].returnCycleId).to.equal(summerReturnCycle.id)
    })
  })

  describe('cycle is "summer" and a licence reference is not provided', () => {
    before(async () => {
      cycle = 'summer'
      summerReturnCycle = await ReturnCycleHelper.select(0, true)
      region = RegionHelper.select()
      licence = await LicenceHelper.add({ regionId: region.id })
      licence2 = await LicenceHelper.add({ regionId: region.id })
      returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })
      returnVersion2 = await ReturnVersionHelper.add({ licenceId: licence2.id })
      returnRequirement = await ReturnRequirementHelper.add({
        regionId: region.naldRegionId,
        returnVersionId: returnVersion.id,
        summer: true
      })
      returnRequirement2 = await ReturnRequirementHelper.add({
        regionId: region.naldRegionId,
        returnVersionId: returnVersion2.id,
        summer: true
      })
      point = await ReturnRequirementPointHelper.add({ returnRequirementId: returnRequirement.id })
      point2 = await ReturnRequirementPointHelper.add({ returnRequirementId: returnRequirement2.id })
      primaryPurpose = PrimaryPurposeHelper.select()
      purpose = PurposeHelper.select()
      secondaryPurpose = SecondaryPurposeHelper.select()
      await ReturnRequirementPurposeHelper.add({
        alias: null,
        primaryPurposeId: primaryPurpose.id,
        purposeId: purpose.id,
        returnRequirementId: returnRequirement.id,
        secondaryPurposeId: secondaryPurpose.id
      })

      // BaseRequest depends on the GlobalNotifier to have been set.
      // This happens in app/plugins/global-notifier.plugin.js when the app starts up and the plugin is registered.
      // As we're not creating an instance of Hapi server in this test we recreate the condition by setting
      // it directly with our own stub
      notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
      global.GlobalNotifier = notifierStub
      Sinon.stub(GenerateReturnLogsService, 'go')
        .onFirstCall()
        .resolves({
          createdAt: new Date(),
          updatedAt: new Date(),
          dueDate: allYearDueDate,
          endDate: allYearEndDate,
          id: `v1:${region.naldRegionId}:${licence.licenceRef}:${returnRequirement.legacyId}:${summerStartDateAsISO}:${summerEndDateAsISO}`,
          licenceRef: licence.licenceRef,
          metadata: {
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
            points: [
              {
                name: point.description,
                ngr1: point.ngr1,
                ngr2: point.ngr2,
                ngr3: point.ngr3,
                ngr4: point.ngr4
              }
            ],
            purposes: [
              {
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
              }
            ],
            version: 1
          },
          returnCycleId: summerReturnCycle.id,
          returnsFrequency: 'day',
          returnReference: returnRequirement.legacyId.toString(),
          startDate: allYearStartDate,
          status: 'due',
          source: 'WRLS'
        })
        .onSecondCall()
        .resolves({
          createdAt: new Date(),
          updatedAt: new Date(),
          dueDate: allYearDueDate,
          endDate: allYearEndDate,
          id: `v1:${region.naldRegionId}:${licence2.licenceRef}:${returnRequirement2.legacyId}:${summerStartDateAsISO}:${summerEndDateAsISO}`,
          licenceRef: licence2.licenceRef,
          metadata: {
            description: 'BOREHOLE AT AVALON',
            isCurrent: true,
            isFinal: false,
            isSummer: true,
            isTwoPartTariff: false,
            isUpload: false,
            nald: {
              regionCode: region.naldRegionId,
              areaCode: licence2.regions.historicalAreaCode,
              formatId: returnRequirement2.legacyId,
              periodStartDay: returnRequirement2.abstractionPeriodStartDay.toString(),
              periodStartMonth: returnRequirement2.abstractionPeriodStartMonth.toString(),
              periodEndDay: returnRequirement2.abstractionPeriodEndDay.toString(),
              periodEndMonth: returnRequirement2.abstractionPeriodEndMonth.toString()
            },
            points: [
              {
                name: point2.description,
                ngr1: point2.ngr1,
                ngr2: point2.ngr2,
                ngr3: point2.ngr3,
                ngr4: point2.ngr4
              }
            ],
            purposes: [
              {
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
              }
            ],
            version: 1
          },
          returnCycleId: summerReturnCycle.id,
          returnsFrequency: 'day',
          returnReference: returnRequirement2.legacyId.toString(),
          startDate: allYearStartDate,
          status: 'due',
          source: 'WRLS'
        })
    })

    it('can successfully save a return log in the database', async () => {
      await ProcessReturnLogsService.go(cycle)
      const results = await ReturnLogModel.query().where('returnCycleId', summerReturnCycle.id)

      const ids = results.map((result) => {
        return result.id
      })

      expect(ids).includes(
        `v1:${region.naldRegionId}:${licence.licenceRef}:${returnRequirement.legacyId}:${summerStartDateAsISO}:${summerEndDateAsISO}`
      )
      expect(ids).includes(
        `v1:${region.naldRegionId}:${licence.licenceRef}:${returnRequirement.legacyId}:${summerStartDateAsISO}:${summerEndDateAsISO}`
      )
    })
  })

  describe('cycle is "summer" and a licence reference is provided but there is no exisiting return cycle', () => {
    before(async () => {
      cycle = 'summer'
      summerReturnCycle = await ReturnCycleHelper.select(0, true)
      region = RegionHelper.select()
      licence = await LicenceHelper.add({ regionId: region.id })
      returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })
      returnRequirement = await ReturnRequirementHelper.add({ summer: true, returnVersionId: returnVersion.id })
      await ReturnRequirementPointHelper.add({ returnRequirementId: returnRequirement.id })
      primaryPurpose = PrimaryPurposeHelper.select()
      purpose = PurposeHelper.select()
      secondaryPurpose = SecondaryPurposeHelper.select()
      await ReturnRequirementPurposeHelper.add({
        alias: null,
        primaryPurposeId: primaryPurpose.id,
        purposeId: purpose.id,
        returnRequirementId: returnRequirement.id,
        secondaryPurposeId: secondaryPurpose.id
      })

      // BaseRequest depends on the GlobalNotifier to have been set.
      // This happens in app/plugins/global-notifier.plugin.js when the app starts up and the plugin is registered.
      // As we're not creating an instance of Hapi server in this test we recreate the condition by setting
      // it directly with our own stub
      notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
      Sinon.stub(FetchReturnCycleService, 'go').resolves(undefined)
      global.GlobalNotifier = notifierStub
    })

    it('can successfully create a return cycle and can successfully save a return log in the database', async () => {
      await ProcessReturnLogsService.go(cycle, licence.licenceRef)

      const result = await ReturnLogModel.query().where('licenceRef', licence.licenceRef)

      expect(result.length).to.equal(1)
      expect(result[0].dueDate).to.equal(summerDueDate)
      expect(result[0].endDate).to.equal(summerEndDate)
      expect(result[0].id).to.equal(
        `v1:${region.naldRegionId}:${licence.licenceRef}:${returnRequirement.legacyId}:${summerStartDateAsISO}:${summerEndDateAsISO}`
      )
      expect(result[0].licenceRef).to.equal(licence.licenceRef)
      expect(result[0].returnsFrequency).to.equal('day')
      expect(result[0].startDate).to.equal(summerStartDate)
      expect(result[0].status).to.equal('due')
      expect(result[0].source).to.equal('WRLS')
      expect(result[0].returnCycleId).to.equal(summerReturnCycle.id)
    })
  })

  describe('cycle is "summer" and a licence reference is provided but there is no matching return requirements', () => {
    before(async () => {
      cycle = 'summer'
      Sinon.stub(GenerateReturnLogsService, 'go').resolves([])
    })

    it('will not save anything in the database', async () => {
      await ProcessReturnLogsService.go(cycle, 'testReference')

      const result = await ReturnLogModel.query().where('licenceRef', 'testReference')

      expect(result.length).to.equal(0)
    })
  })
})
