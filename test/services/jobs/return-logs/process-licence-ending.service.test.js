'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, after } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const {
  cycleEndDateByDate,
  cycleEndDateAsISO,
  cycleStartDateByDate,
  cycleStartDateAsISO,
  formatDateObjectToISO
} = require('../../../../app/lib/dates.lib.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const FetchReturnCycleService = require('../../../../app/services/jobs/return-logs/fetch-return-cycle.service.js')
const GenerateReturnLogsService = require('../../../../app/services/jobs/return-logs/generate-return-logs.service.js')
const PrimaryPurposeHelper = require('../../../support/helpers/primary-purpose.helper.js')
const PurposeHelper = require('../../../support/helpers/purpose.helper.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')
const ReturnLogHelper = require('../../../support/helpers/return-log.helper.js')
const ReturnLogModel = require('../../../../app/models/return-log.model.js')
const ReturnRequirementHelper = require('../../../support/helpers/return-requirement.helper.js')
const ReturnRequirementPointHelper = require('../../../support/helpers/return-requirement-point.helper.js')
const ReturnRequirementPurposeHelper = require('../../../support/helpers/return-requirement-purpose.helper.js')
const ReturnVersionHelper = require('../../../support/helpers/return-version.helper.js')
const SecondaryPurposeHelper = require('../../../support/helpers/secondary-purpose.helper.js')


// Thing under test
const ProcessLicenceEndingService = require('../../../../app/services/jobs/return-logs/process-licence-ending.service.js')

describe.only('Process licence ending service', () => {
  const allYearDueDate = new Date(new Date().getFullYear() + 1, 3, 28).toISOString().split('T')[0]
  const allYearEndDate = new Date(new Date().getFullYear() + 1, 2, 31).toISOString().split('T')[0]
  const allYearStartDate = new Date(new Date().getFullYear(), 3, 1).toISOString().split('T')[0]

  describe('when a valid licence reference and endDate is provided', () => {
    const today = new Date()
    const lastYear = new Date()
    const twoYearsAgo = new Date()

    lastYear.setFullYear(today.getFullYear() - 1)
    twoYearsAgo.setFullYear(today.getFullYear() - 2)

    let endDate
    let notifierStub
    let summer
    let lastYearsCycleStartDate
    let twoYearsAgoCycleStartDate
    let lastYearsCycleEndDate
    let twoYearsAgoCycleEndDate
    let licence
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
      global.GlobalNotifier = notifierStub
    })

    describe('and summer is true', () => {
      before(async () => {
        summer = true
        lastYearsCycleStartDate = formatDateObjectToISO(new Date(cycleStartDateByDate(lastYear, summer)))
        twoYearsAgoCycleStartDate = formatDateObjectToISO(new Date(cycleStartDateByDate(twoYearsAgo, summer)))
        lastYearsCycleEndDate = formatDateObjectToISO(new Date(cycleEndDateByDate(lastYear, summer)))
        twoYearsAgoCycleEndDate = formatDateObjectToISO(new Date(cycleEndDateByDate(twoYearsAgo, summer)))

        await ReturnLogHelper.add({
          endDate: cycleEndDateAsISO(summer),
          licenceRef: licence.licenceRef,
          startDate: cycleStartDateAsISO(summer)
        })
        await ReturnLogHelper.add({
          endDate: lastYearsCycleEndDate,
          licenceRef: licence.licenceRef,
          startDate: lastYearsCycleStartDate
        })
        await ReturnLogHelper.add({
          endDate: twoYearsAgoCycleEndDate,
          licenceRef: licence.licenceRef,
          startDate: twoYearsAgoCycleStartDate
        })
      })

      it('voids the return logs from the given end date and reissues them', async () => {
        endDate = new Date().setTime(lastYear.getTime() + (30 * 24 * 60 * 60 * 1000))
        await ProcessLicenceEndingService.go(licence.licenceRef, endDate)

        const result = await ReturnLogModel.query().where('licenceRef', licence.licenceRef)
        console.log(result)

        expect(result.length).to.equal(4)
        expect(result[0].dueDate).to.equal(new Date(allYearDueDate))
        expect(result[0].endDate).to.equal(new Date(allYearEndDate))
        expect(result[0].id).to.equal(`v1:${region.naldRegionId}:${licence.licenceRef}:${returnRequirement.legacyId}:${allYearStartDate}:${allYearEndDate}`)
        expect(result[0].licenceRef).to.equal(licence.licenceRef)
        expect(result[0].returnsFrequency).to.equal('day')
        expect(result[0].startDate).to.equal(new Date(allYearStartDate))
        expect(result[0].status).to.equal('due')
        expect(result[0].source).to.equal('WRLS')
      })
    })
  })
})
