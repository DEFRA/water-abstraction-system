'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, after } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const FetchReturnCycleService = require('../../../../app/services/jobs/return-logs/fetch-return-cycle.service.js')
const GenerateReturnCycleService = require('../../../../app/services/jobs/return-logs/generate-return-cycle.service.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')
const ReturnLogModel = require('../../../../app/models/return-log.model.js')
const ReturnRequirementHelper = require('../../../support/helpers/return-requirement.helper.js')
const ReturnRequirementPointHelper = require('../../../support/helpers/return-requirement-point.helper.js')
const ReturnRequirementPurposeHelper = require('../../../support/helpers/return-requirement-purpose.helper.js')
const ReturnVersionHelper = require('../../../support/helpers/return-version.helper.js')

// Thing under test
const ProcessReturnLogsService = require('../../../../app/services/jobs/return-logs/process-return-logs.service.js')

describe('Process return logs service', () => {
  const allYearDueDate = new Date(new Date().getFullYear() + 1, 3, 28).toISOString().split('T')[0]
  const summerDueDate = new Date(new Date().getFullYear() + 1, 10, 28).toISOString().split('T')[0]
  const allYearEndDate = new Date(new Date().getFullYear() + 1, 2, 31).toISOString().split('T')[0]
  const summerEndDate = new Date(new Date().getFullYear() + 1, 9, 31).toISOString().split('T')[0]
  const allYearStartDate = new Date(new Date().getFullYear(), 3, 1).toISOString().split('T')[0]
  const summerStartDate = new Date(new Date().getFullYear(), 10, 1).toISOString().split('T')[0]

  describe('cycle is "all-year" and a licence reference is provided and there is already a return cycle', () => {
    let licence
    let region
    let returnVersion
    let returnRequirement
    let notifierStub

    before(async () => {
      Sinon.reset()
      region = RegionHelper.select()
      licence = await LicenceHelper.add({ regionId: region.id })
      returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })
      returnRequirement = await ReturnRequirementHelper.add({ returnVersionId: returnVersion.id })
      await ReturnRequirementPointHelper.add({ returnRequirementId: returnRequirement.id })
      await ReturnRequirementPurposeHelper.add({ returnRequirementId: returnRequirement.id })

      // BaseRequest depends on the GlobalNotifier to have been set.
      // This happens in app/plugins/global-notifier.plugin.js when the app starts up and the plugin is registered.
      // As we're not creating an instance of Hapi server in this test we recreate the condition by setting
      // it directly with our own stub
      notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
      Sinon.stub(FetchReturnCycleService, 'go').resolves('c095d75e-0e0d-4fe4-b048-150457f3871b')
      Sinon.stub(GenerateReturnCycleService, 'go').resolves('g095d75e-0e0d-4fe4-b048-150457f3871g')
      global.GlobalNotifier = notifierStub
    })

    it('can successfully save a return log in the database', async () => {
      await ProcessReturnLogsService.go('all-year', licence.licenceRef)

      const result = await ReturnLogModel.query().where('licenceRef', licence.licenceRef)

      expect(result.length).to.equal(1)
      expect(result[0].dueDate).to.equal(new Date(allYearDueDate))
      expect(result[0].endDate).to.equal(new Date(allYearEndDate))
      expect(result[0].id).to.equal(`v1:${region.naldRegionId}:${licence.licenceRef}:${returnRequirement.legacyId}:${allYearStartDate}:${allYearEndDate}`)
      expect(result[0].licenceRef).to.equal(licence.licenceRef)
      expect(result[0].returnsFrequency).to.equal('day')
      expect(result[0].startDate).to.equal(new Date(allYearStartDate))
      expect(result[0].status).to.equal('due')
      expect(result[0].source).to.equal('WRLS')
      expect(result[0].returnCycleId).to.equal('c095d75e-0e0d-4fe4-b048-150457f3871b')
    })

    after(() => {
      Sinon.restore()
    })
  })

  describe('cycle is "summer" and a licence reference is provided and there is no return cycle', () => {
    let licence
    let region
    let returnVersion
    let returnRequirement
    let notifierStub

    before(async () => {
      Sinon.reset()
      region = RegionHelper.select()
      licence = await LicenceHelper.add({ regionId: region.id })
      returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })
      returnRequirement = await ReturnRequirementHelper.add({ summer: true, returnVersionId: returnVersion.id })
      await ReturnRequirementPointHelper.add({ returnRequirementId: returnRequirement.id })
      await ReturnRequirementPurposeHelper.add({ returnRequirementId: returnRequirement.id })

      // BaseRequest depends on the GlobalNotifier to have been set.
      // This happens in app/plugins/global-notifier.plugin.js when the app starts up and the plugin is registered.
      // As we're not creating an instance of Hapi server in this test we recreate the condition by setting
      // it directly with our own stub
      notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
      Sinon.stub(FetchReturnCycleService, 'go').resolves(undefined)
      Sinon.stub(GenerateReturnCycleService, 'go').resolves('f095d75e-0e0d-4fe4-b048-150457f3871f')
      global.GlobalNotifier = notifierStub
    })

    it('can successfully save a return log in the database', async () => {
      await ProcessReturnLogsService.go('summer', licence.licenceRef)

      const result = await ReturnLogModel.query().where('licenceRef', licence.licenceRef)

      expect(result.length).to.equal(1)
      expect(result[0].dueDate).to.equal(new Date(summerDueDate))
      expect(result[0].endDate).to.equal(new Date(summerEndDate))
      expect(result[0].id).to.equal(`v1:${region.naldRegionId}:${licence.licenceRef}:${returnRequirement.legacyId}:${summerStartDate}:${summerEndDate}`)
      expect(result[0].licenceRef).to.equal(licence.licenceRef)
      expect(result[0].returnsFrequency).to.equal('day')
      expect(result[0].startDate).to.equal(new Date(summerStartDate))
      expect(result[0].status).to.equal('due')
      expect(result[0].source).to.equal('WRLS')
      expect(result[0].returnCycleId).to.equal('f095d75e-0e0d-4fe4-b048-150457f3871f')
    })

    after(() => {
      Sinon.restore()
    })
  })

  describe('cycle is "all-year" and a licence reference is provided but there is no matching return requirements', () => {
    before(async () => {
      Sinon.reset()
      Sinon.stub(FetchReturnCycleService, 'go').resolves(undefined)
      Sinon.stub(GenerateReturnCycleService, 'go').resolves('f095d75e-0e0d-4fe4-b048-150457f3871f')
    })

    it('will not save anything in the database', async () => {
      await ProcessReturnLogsService.go('all-year', 'testReference')

      const result = await ReturnLogModel.query().where('licenceRef', 'testReference')

      expect(result.length).to.equal(0)
    })

    after(() => {
      Sinon.restore()
    })
  })

  describe('when it throws an error', () => {
    before(async () => {
      Sinon.reset()
      Sinon.stub(FetchReturnCycleService, 'go').resolves(undefined)
      Sinon.stub(GenerateReturnCycleService, 'go').resolves('f095d75e-0e0d-4fe4-b048-150457f3871f')
    })

    it('will catch it and log it to the console', async () => {
      await ProcessReturnLogsService.go('all-year', 'testReference')

      const result = await ReturnLogModel.query().where('licenceRef', 'testReference')

      expect(result.length).to.equal(0)
    })

    after(() => {
      Sinon.restore()
    })
  })
})
