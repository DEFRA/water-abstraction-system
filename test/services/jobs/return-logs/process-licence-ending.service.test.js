'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, before } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { formatDateObjectToISO } = require('../../../../app/lib/dates.lib.js')
const {
  cycleEndDateByDate,
  cycleEndDateAsISO,
  cycleStartDateByDate,
  cycleStartDateAsISO
} = require('../../../../app/lib/return-cycle-dates.lib.js')
const { returnCycleDates } = require('../../../../app/lib/static-lookups.lib.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const LicenceModel = require('../../../../app/models/licence.model.js')
const FetchReturnCycleService = require('../../../../app/services/jobs/return-logs/fetch-return-cycle.service.js')
const GenerateReturnLogsService = require('../../../../app/services/jobs/return-logs/generate-return-logs.service.js')
const PrimaryPurposeHelper = require('../../../support/helpers/primary-purpose.helper.js')
const PurposeHelper = require('../../../support/helpers/purpose.helper.js')
const ReturnCycleHelper = require('../../../support/helpers/return-cycle.helper.js')
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

describe('Process licence ending service', () => {
  const today = new Date()
  const month = today.getMonth()
  const year = today.getFullYear()

  let clock
  let endDate
  let lastYearsCycleStartDate
  let lastYearsCycleEndDate
  let licence
  let notifierStub
  let primaryPurpose
  let previousCycle
  let purpose
  let region
  let returnCycle
  let returnVersion
  let returnRequirement
  let secondaryPurpose
  let summer
  let testDate
  let twoCyclesAgo
  let twoYearsAgoCycleEndDate
  let twoYearsAgoCycleStartDate

  afterEach(() => {
    clock.restore()
  })

  describe('when summer is true and the licence has an endDate that ends in the current cycle', () => {
    before(async () => {
      summer = true
      testDate = new Date(`${year - 1}-12-01`)
      previousCycle = new Date(`${year - 2}-12-01`)
      twoCyclesAgo = new Date(`${year - 3}-12-01`)

      clock = Sinon.useFakeTimers(testDate)
      endDate = testDate.toISOString().split('T')[0]

      region = RegionHelper.select()
      licence = await LicenceHelper.add({ expiredDate: endDate, regionId: region.id })
      returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })
      returnRequirement = await ReturnRequirementHelper.add({ summer, returnVersionId: returnVersion.id })
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

      returnCycle = await ReturnCycleHelper.selectByDate(testDate, summer)
      previousCycle = await ReturnCycleHelper.selectByDate(previousCycle, summer)
      twoCyclesAgo = await ReturnCycleHelper.selectByDate(twoCyclesAgo, summer)

      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(returnCycle.endDate),
        licenceRef: licence.licenceRef,
        returnCycleId: returnCycle.id,
        startDate: formatDateObjectToISO(returnCycle.startDate)
      })
      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(previousCycle.endDate),
        licenceRef: licence.licenceRef,
        returnCycleId: previousCycle.id,
        startDate: formatDateObjectToISO(previousCycle.startDate)
      })
      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(twoCyclesAgo.endDate),
        licenceRef: licence.licenceRef,
        returnCycleId: twoCyclesAgo.id,
        startDate: formatDateObjectToISO(twoCyclesAgo.startDate)
      })

      // BaseRequest depends on the GlobalNotifier to have been set.
      // This happens in app/plugins/global-notifier.plugin.js when the app starts up and the plugin is registered.
      // As we're not creating an instance of Hapi server in this test we recreate the condition by setting
      // it directly with our own stub
      notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
      global.GlobalNotifier = notifierStub
    })

    it('voids the return logs from the given end date and reissues them', async () => {
      await ProcessLicenceEndingService.go(licence.licenceRef, endDate)

      const result = await ReturnLogModel.query().where('licenceRef', licence.licenceRef).orderBy('endDate', 'ASC')
      const areDatesSequential = await ReturnLogHelper.hasContinousReturnLogs(licence.licenceRef)

      expect(areDatesSequential).to.equal(true)
      expect(result.length).to.equal(4)
      expect(result[0].status).to.equal('due')
      expect(result[1].status).to.equal('due')
      expect(result[2].status).to.equal('due')
      expect(result[2].endDate).to.equal(new Date(endDate))
      expect(result[3].status).to.equal('void')
    })
  })

  describe('when a licence has an endDate that ends in the next cycle', () => {
    before(async () => {
      if (month > returnCycleDates.summer.endDate.month) {
        endDate = new Date(year + 1, 10, 29).toISOString().split('T')[0]
      } else {
        endDate = new Date(year, 10, 29).toISOString().split('T')[0]
      }

      region = RegionHelper.select()
      licence = await LicenceHelper.add({ expiredDate: endDate, regionId: region.id })
      returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })
      returnRequirement = await ReturnRequirementHelper.add({ summer, returnVersionId: returnVersion.id })
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

      // BaseRequest depends on the GlobalNotifier to have been set.
      // This happens in app/plugins/global-notifier.plugin.js when the app starts up and the plugin is registered.
      // As we're not creating an instance of Hapi server in this test we recreate the condition by setting
      // it directly with our own stub
      notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
      global.GlobalNotifier = notifierStub
    })

    it('does nothing', async () => {
      await ProcessLicenceEndingService.go(licence.licenceRef, endDate)

      const result = await ReturnLogModel.query().where('licenceRef', licence.licenceRef).orderBy('endDate', 'ASC')

      expect(result.length).to.equal(0)
    })
  })

  // describe('and summer is false', () => {
  //   before(() => {
  //     summer = false
  //   })

  //   describe('when a valid licence reference and endDate for one year ago is provided', () => {
  //     before(async () => {
  //       if (month > returnCycleDates.allYear.endDate.month) {
  //         endDate = new Date(year, 3, 29).toISOString().split('T')[0]
  //       } else {
  //         endDate = new Date(year - 1, 3, 29).toISOString().split('T')[0]
  //       }

  //       region = RegionHelper.select()
  //       licence = await LicenceHelper.add({ expiredDate: endDate, regionId: region.id })
  //       returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })
  //       returnRequirement = await ReturnRequirementHelper.add({ summer, returnVersionId: returnVersion.id })
  //       await ReturnRequirementPointHelper.add({ returnRequirementId: returnRequirement.id })
  //       primaryPurpose = PrimaryPurposeHelper.select()
  //       purpose = PurposeHelper.select()
  //       secondaryPurpose = SecondaryPurposeHelper.select()
  //       await ReturnRequirementPurposeHelper.add({
  //         alias: null,
  //         primaryPurposeId: primaryPurpose.id,
  //         purposeId: purpose.id,
  //         returnRequirementId: returnRequirement.id,
  //         secondaryPurposeId: secondaryPurpose.id
  //       })

  //       lastYearsCycleStartDate = formatDateObjectToISO(new Date(cycleStartDateByDate(lastYear, summer)))
  //       twoYearsAgoCycleStartDate = formatDateObjectToISO(new Date(cycleStartDateByDate(twoYearsAgo, summer)))
  //       lastYearsCycleEndDate = formatDateObjectToISO(new Date(cycleEndDateByDate(lastYear, summer)))
  //       twoYearsAgoCycleEndDate = formatDateObjectToISO(new Date(cycleEndDateByDate(twoYearsAgo, summer)))

  //       await ReturnLogHelper.add({
  //         endDate: cycleEndDateAsISO(summer),
  //         licenceRef: licence.licenceRef,
  //         startDate: cycleStartDateAsISO(summer)
  //       })
  //       await ReturnLogHelper.add({
  //         endDate: lastYearsCycleEndDate,
  //         licenceRef: licence.licenceRef,
  //         startDate: lastYearsCycleStartDate
  //       })
  //       await ReturnLogHelper.add({
  //         endDate: twoYearsAgoCycleEndDate,
  //         licenceRef: licence.licenceRef,
  //         startDate: twoYearsAgoCycleStartDate
  //       })

  //       // BaseRequest depends on the GlobalNotifier to have been set.
  //       // This happens in app/plugins/global-notifier.plugin.js when the app starts up and the plugin is registered.
  //       // As we're not creating an instance of Hapi server in this test we recreate the condition by setting
  //       // it directly with our own stub
  //       notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
  //       global.GlobalNotifier = notifierStub
  //     })

  //     it('voids the return logs from the given end date and reissues them', async () => {
  //       await ProcessLicenceEndingService.go(licence.licenceRef, endDate)

  //       const result = await ReturnLogModel.query().where('licenceRef', licence.licenceRef)
  //       const areDatesSequential = await ReturnLogHelper.hasContinousReturnLogs(licence.licenceRef)

  //       expect(areDatesSequential).to.equal(true)
  //       expect(result.length).to.equal(4)
  //       expect(result[0].status).to.equal('due')
  //       expect(result[1].status).to.equal('due')
  //       expect(result[2].status).to.equal('void')
  //       expect(result[3].status).to.equal('due')
  //       expect(result[3].endDate).to.equal(new Date(endDate))
  //     })
  //   })
  // })
})
