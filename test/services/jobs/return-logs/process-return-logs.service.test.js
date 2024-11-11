'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const GenerateReturnLogsService = require('../../../../app/services/jobs/return-logs/generate-return-logs.service.js')
const PrimaryPurposeHelper = require('../../../support/helpers/primary-purpose.helper.js')
const PurposeHelper = require('../../../support/helpers/purpose.helper.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')
const ReturnLogModel = require('../../../../app/models/return-log.model.js')
const ReturnRequirementHelper = require('../../../support/helpers/return-requirement.helper.js')
const ReturnRequirementPointHelper = require('../../../support/helpers/return-requirement-point.helper.js')
const ReturnRequirementPurposeHelper = require('../../../support/helpers/return-requirement-purpose.helper.js')
const ReturnVersionHelper = require('../../../support/helpers/return-version.helper.js')
const SecondaryPurposeHelper = require('../../../support/helpers/secondary-purpose.helper.js')

// Thing under test
const ProcessReturnLogsService = require('../../../../app/services/jobs/return-logs/process-return-logs.service.js')

describe('Process return logs service', () => {
  const allYearDueDate = new Date(new Date().getFullYear() + 1, 3, 28).toISOString().split('T')[0]
  const allYearEndDate = new Date(new Date().getFullYear() + 1, 2, 31).toISOString().split('T')[0]
  const allYearStartDate = new Date(new Date().getFullYear(), 3, 1).toISOString().split('T')[0]

  let cycle

  afterEach(() => {
    Sinon.restore()
  })

  describe('cycle is "all-year', () => {
    before(() => {
      cycle = 'all-year'
    })

    describe('and a licence reference is provided', () => {
      const allYearReturnCycleId = 'c095d75e-0e0d-4fe4-b048-150457f3871b'

      let licence
      let notifierStub
      let point
      let primaryPurpose
      let purpose
      let region
      let returnVersion
      let returnRequirement
      let secondaryPurpose

      before(async () => {
        region = RegionHelper.select()
        licence = await LicenceHelper.add({ regionId: region.id })
        returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })
        returnRequirement = await ReturnRequirementHelper.add({ returnVersionId: returnVersion.id })
        point = await ReturnRequirementPointHelper.add({ returnRequirementId: returnRequirement.id })
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
        Sinon.stub(GenerateReturnLogsService, 'go').resolves([
          {
            createdAt: new Date(),
            updatedAt: new Date(),
            dueDate: allYearDueDate,
            endDate: allYearEndDate,
            id: `v1:${region.naldRegionId}:${licence.licenceRef}:${returnRequirement.legacyId}:${allYearStartDate}:${allYearEndDate}`,
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
            returnCycleId: allYearReturnCycleId,
            returnsFrequency: 'day',
            returnReference: returnRequirement.legacyId.toString(),
            startDate: allYearStartDate,
            status: 'due',
            source: 'WRLS'
          }
        ])
        global.GlobalNotifier = notifierStub
      })

      it('can successfully save a return log in the database', async () => {
        await ProcessReturnLogsService.go(cycle, licence.licenceRef)

        const result = await ReturnLogModel.query().where('licenceRef', licence.licenceRef)

        expect(result.length).to.equal(1)
        expect(result[0].dueDate).to.equal(new Date(allYearDueDate))
        expect(result[0].endDate).to.equal(new Date(allYearEndDate))
        expect(result[0].id).to.equal(
          `v1:${region.naldRegionId}:${licence.licenceRef}:${returnRequirement.legacyId}:${allYearStartDate}:${allYearEndDate}`
        )
        expect(result[0].licenceRef).to.equal(licence.licenceRef)
        expect(result[0].returnsFrequency).to.equal('day')
        expect(result[0].startDate).to.equal(new Date(allYearStartDate))
        expect(result[0].status).to.equal('due')
        expect(result[0].source).to.equal('WRLS')
        expect(result[0].returnCycleId).to.equal(allYearReturnCycleId)
      })
    })

    describe('and a licence reference is provided but there is no matching return requirements', () => {
      before(async () => {
        Sinon.stub(GenerateReturnLogsService, 'go').resolves([])
      })

      it('will not save anything in the database', async () => {
        await ProcessReturnLogsService.go(cycle, 'testReference')

        const result = await ReturnLogModel.query().where('licenceRef', 'testReference')

        expect(result.length).to.equal(0)
      })
    })

    describe('when it throws an error', () => {
      before(async () => {
        Sinon.stub(GenerateReturnLogsService, 'go').resolves([])
      })

      it('will catch it and log it to the console', async () => {
        await ProcessReturnLogsService.go('all-year', 'testReference')

        const result = await ReturnLogModel.query().where('licenceRef', 'testReference')

        expect(result.length).to.equal(0)
      })
    })
  })
})
