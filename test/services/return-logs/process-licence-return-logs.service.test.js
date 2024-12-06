'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { formatDateObjectToISO } = require('../../../app/lib/dates.lib.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const PrimaryPurposeHelper = require('../../support/helpers/primary-purpose.helper.js')
const PurposeHelper = require('../../support/helpers/purpose.helper.js')
const ReturnCycleHelper = require('../../support/helpers/return-cycle.helper.js')
const RegionHelper = require('../../support/helpers/region.helper.js')
const ReturnLogHelper = require('../../support/helpers/return-log.helper.js')
const ReturnLogModel = require('../../../app/models/return-log.model.js')
const ReturnRequirementHelper = require('../../support/helpers/return-requirement.helper.js')
const ReturnRequirementPointHelper = require('../../support/helpers/return-requirement-point.helper.js')
const ReturnRequirementPurposeHelper = require('../../support/helpers/return-requirement-purpose.helper.js')
const ReturnVersionHelper = require('../../support/helpers/return-version.helper.js')
const SecondaryPurposeHelper = require('../../support/helpers/secondary-purpose.helper.js')

// Thing under test
const ProcessLicenceReturnLogsService = require('../../../app/services/return-logs/process-licence-return-logs.service.js')

describe('Process licence return logs service', () => {
  let endDate
  let licence
  let notifierStub
  let primaryPurpose
  let previousCycle
  let purpose
  let region
  let returnCycle
  let returnVersion
  let returnRequirement
  let returnRequirement2
  let secondaryPurpose
  let summer
  let testDate
  let twoCyclesAgo

  describe('when summer is true and the licence has an endDate that ends in the current cycle', () => {
    before(async () => {
      summer = true
      returnCycle = await ReturnCycleHelper.select(0, summer)
      previousCycle = await ReturnCycleHelper.select(1, summer)
      twoCyclesAgo = await ReturnCycleHelper.select(2, summer)

      const returnCycleEndDate = new Date(returnCycle.endDate)

      testDate = new Date(`${returnCycleEndDate.getFullYear()}-${returnCycleEndDate.getMonth()}-25`)
      endDate = testDate.toISOString().split('T')[0]

      region = RegionHelper.select()
      licence = await LicenceHelper.add({ expiredDate: endDate, regionId: region.id })
      returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })
      returnRequirement = await ReturnRequirementHelper.add({
        regionId: region.naldRegionId,
        returnVersionId: returnVersion.id,
        summer
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

      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(returnCycle.endDate),
        licenceRef: licence.licenceRef,
        returnCycleId: returnCycle.id,
        returnReference: returnRequirement.legacyId,
        startDate: formatDateObjectToISO(returnCycle.startDate)
      })
      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(previousCycle.endDate),
        licenceRef: licence.licenceRef,
        returnCycleId: previousCycle.id,
        returnReference: returnRequirement.legacyId,
        startDate: formatDateObjectToISO(previousCycle.startDate)
      })
      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(twoCyclesAgo.endDate),
        licenceRef: licence.licenceRef,
        returnCycleId: twoCyclesAgo.id,
        returnReference: returnRequirement.legacyId,
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
      await ProcessLicenceReturnLogsService.go(licence.licenceRef, testDate)

      const result = await ReturnLogModel.query().where('licenceRef', licence.licenceRef).orderBy('endDate', 'ASC')
      const areDatesSequential = await ReturnLogHelper.hasContinuousReturnLogs(licence.licenceRef)

      expect(areDatesSequential).to.equal(true)
      expect(result.length).to.equal(4)
      expect(result[0].status).to.equal('due')
      expect(result[1].status).to.equal('due')
      expect(result[2].status).to.equal('due')
      expect(result[2].endDate).to.equal(new Date(endDate))
      expect(result[3].status).to.equal('void')
    })
  })

  describe('when summer is true and the licence has no end date', () => {
    before(async () => {
      summer = true
      returnCycle = await ReturnCycleHelper.select(0, summer)
      previousCycle = await ReturnCycleHelper.select(1, summer)
      twoCyclesAgo = await ReturnCycleHelper.select(2, summer)

      const returnCycleEndDate = new Date(returnCycle.endDate)

      testDate = new Date(`${returnCycleEndDate.getFullYear()}-${returnCycleEndDate.getMonth()}-25`)
      endDate = testDate.toISOString().split('T')[0]

      region = RegionHelper.select()
      licence = await LicenceHelper.add({ expiredDate: endDate, regionId: region.id })
      returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })
      returnRequirement = await ReturnRequirementHelper.add({
        regionId: region.naldRegionId,
        returnVersionId: returnVersion.id,
        summer
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

    it('creates the return logs for the current cycle', async () => {
      await ProcessLicenceReturnLogsService.go(licence.licenceRef)

      const result = await ReturnLogModel.query().where('licenceRef', licence.licenceRef).orderBy('endDate', 'ASC')

      expect(result.length).to.equal(1)
      expect(result[0].status).to.equal('due')
    })
  })

  describe('when summer is true and a licence has an endDate that ends in a future cycle', () => {
    before(async () => {
      summer = true
      returnCycle = await ReturnCycleHelper.select(0, summer)
      previousCycle = await ReturnCycleHelper.select(1, summer)
      twoCyclesAgo = await ReturnCycleHelper.select(2, summer)

      const returnCycleEndDate = new Date(returnCycle.endDate)

      testDate = new Date(`${returnCycleEndDate.getFullYear()}-${returnCycleEndDate.getMonth() + 2}-25`)
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

      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(returnCycle.endDate),
        licenceRef: licence.licenceRef,
        returnCycleId: returnCycle.id,
        returnReference: returnRequirement.legacyId,
        startDate: formatDateObjectToISO(returnCycle.startDate)
      })
      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(previousCycle.endDate),
        licenceRef: licence.licenceRef,
        returnCycleId: previousCycle.id,
        returnReference: returnRequirement.legacyId,
        startDate: formatDateObjectToISO(previousCycle.startDate)
      })
      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(twoCyclesAgo.endDate),
        licenceRef: licence.licenceRef,
        returnCycleId: twoCyclesAgo.id,
        returnReference: returnRequirement.legacyId,
        startDate: formatDateObjectToISO(twoCyclesAgo.startDate)
      })

      // BaseRequest depends on the GlobalNotifier to have been set.
      // This happens in app/plugins/global-notifier.plugin.js when the app starts up and the plugin is registered.
      // As we're not creating an instance of Hapi server in this test we recreate the condition by setting
      // it directly with our own stub
      notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
      global.GlobalNotifier = notifierStub
    })

    it('does not void and reissue any of the return logs', async () => {
      await ProcessLicenceReturnLogsService.go(licence.licenceRef, testDate)

      const result = await ReturnLogModel.query().where('licenceRef', licence.licenceRef).orderBy('endDate', 'ASC')

      expect(result.length).to.equal(3)
      expect(result[0].status).to.equal('due')
      expect(result[1].status).to.equal('due')
      expect(result[2].status).to.equal('due')
    })
  })

  describe('when summer is true and the licence has an endDate that ends in the previous cycle', () => {
    before(async () => {
      summer = true
      returnCycle = await ReturnCycleHelper.select(0, summer)
      previousCycle = await ReturnCycleHelper.select(1, summer)
      twoCyclesAgo = await ReturnCycleHelper.select(2, summer)

      const returnCycleEndDate = new Date(previousCycle.endDate)

      testDate = new Date(`${returnCycleEndDate.getFullYear()}-${returnCycleEndDate.getMonth()}-25`)
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

      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(returnCycle.endDate),
        licenceRef: licence.licenceRef,
        returnCycleId: returnCycle.id,
        returnReference: returnRequirement.legacyId,
        startDate: formatDateObjectToISO(returnCycle.startDate)
      })
      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(previousCycle.endDate),
        licenceRef: licence.licenceRef,
        returnCycleId: previousCycle.id,
        returnReference: returnRequirement.legacyId,
        startDate: formatDateObjectToISO(previousCycle.startDate)
      })
      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(twoCyclesAgo.endDate),
        licenceRef: licence.licenceRef,
        returnCycleId: twoCyclesAgo.id,
        returnReference: returnRequirement.legacyId,
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
      await ProcessLicenceReturnLogsService.go(licence.licenceRef, testDate)

      const result = await ReturnLogModel.query().where('licenceRef', licence.licenceRef).orderBy('endDate', 'ASC')
      const areDatesSequential = await ReturnLogHelper.hasContinuousReturnLogs(licence.licenceRef)

      expect(areDatesSequential).to.equal(true)
      expect(result.length).to.equal(4)
      expect(result[0].status).to.equal('due')
      expect(result[1].status).to.equal('due')
      expect(result[1].endDate).to.equal(new Date(endDate))
      expect(result[2].status).to.equal('void')
      expect(result[3].status).to.equal('void')
    })
  })

  describe('when summer is true and the licence has an endDate that ends in the previous cycle and return requirements for both cycles', () => {
    before(async () => {
      summer = false
      returnCycle = await ReturnCycleHelper.select(0, summer)
      previousCycle = await ReturnCycleHelper.select(1, summer)
      twoCyclesAgo = await ReturnCycleHelper.select(2, summer)

      const returnCycleEndDate = new Date(previousCycle.endDate)

      testDate = new Date(`${returnCycleEndDate.getFullYear()}-${returnCycleEndDate.getMonth()}-25`)
      endDate = testDate.toISOString().split('T')[0]

      region = RegionHelper.select()
      licence = await LicenceHelper.add({ expiredDate: endDate, regionId: region.id })
      returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })
      returnRequirement = await ReturnRequirementHelper.add({ summer, returnVersionId: returnVersion.id })
      returnRequirement2 = await ReturnRequirementHelper.add({ summer: !summer, returnVersionId: returnVersion.id })
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

      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(returnCycle.endDate),
        licenceRef: licence.licenceRef,
        returnCycleId: returnCycle.id,
        returnReference: returnRequirement.legacyId,
        startDate: formatDateObjectToISO(returnCycle.startDate)
      })
      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(returnCycle.endDate),
        licenceRef: licence.licenceRef,
        returnCycleId: returnCycle.id,
        returnReference: returnRequirement2.legacyId,
        startDate: formatDateObjectToISO(returnCycle.startDate)
      })
      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(previousCycle.endDate),
        licenceRef: licence.licenceRef,
        returnCycleId: previousCycle.id,
        returnReference: returnRequirement.legacyId,
        startDate: formatDateObjectToISO(previousCycle.startDate)
      })
      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(twoCyclesAgo.endDate),
        licenceRef: licence.licenceRef,
        returnCycleId: twoCyclesAgo.id,
        returnReference: returnRequirement.legacyId,
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
      await ProcessLicenceReturnLogsService.go(licence.licenceRef, testDate)

      const result = await ReturnLogModel.query().where('licenceRef', licence.licenceRef).orderBy('endDate', 'ASC')

      expect(result.length).to.equal(6)
      expect(result[0].status).to.equal('due')
      expect(result[1].status).to.equal('due')
      expect(result[2].status).to.equal('due')
      expect(result[2].endDate).to.equal(new Date(endDate))
      expect(result[3].status).to.equal('void')
      expect(result[4].status).to.equal('void')
      expect(result[5].status).to.equal('void')
    })
  })

  describe('when summer is false and the licence has an endDate that ends in the current cycle', () => {
    before(async () => {
      summer = false
      returnCycle = await ReturnCycleHelper.select(0, summer)
      previousCycle = await ReturnCycleHelper.select(1, summer)
      twoCyclesAgo = await ReturnCycleHelper.select(2, summer)

      const returnCycleEndDate = new Date(returnCycle.endDate)

      testDate = new Date(`${returnCycleEndDate.getFullYear()}-${returnCycleEndDate.getMonth()}-25`)
      endDate = testDate.toISOString().split('T')[0]

      region = RegionHelper.select()
      licence = await LicenceHelper.add({ expiredDate: endDate, regionId: region.id })
      returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })
      returnRequirement = await ReturnRequirementHelper.add({
        regionId: region.naldRegionId,
        returnVersionId: returnVersion.id,
        summer
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

      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(returnCycle.endDate),
        licenceRef: licence.licenceRef,
        returnCycleId: returnCycle.id,
        returnReference: returnRequirement.legacyId,
        startDate: formatDateObjectToISO(returnCycle.startDate)
      })
      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(previousCycle.endDate),
        licenceRef: licence.licenceRef,
        returnCycleId: previousCycle.id,
        returnReference: returnRequirement.legacyId,
        startDate: formatDateObjectToISO(previousCycle.startDate)
      })
      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(twoCyclesAgo.endDate),
        licenceRef: licence.licenceRef,
        returnCycleId: twoCyclesAgo.id,
        returnReference: returnRequirement.legacyId,
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
      await ProcessLicenceReturnLogsService.go(licence.licenceRef, testDate)

      const result = await ReturnLogModel.query().where('licenceRef', licence.licenceRef).orderBy('endDate', 'ASC')
      const areDatesSequential = await ReturnLogHelper.hasContinuousReturnLogs(licence.licenceRef)

      expect(areDatesSequential).to.equal(true)
      expect(result.length).to.equal(4)
      expect(result[0].status).to.equal('due')
      expect(result[1].status).to.equal('due')
      expect(result[2].status).to.equal('due')
      expect(result[2].endDate).to.equal(new Date(endDate))
      expect(result[3].status).to.equal('void')
    })
  })

  describe('when summer is false and the licence has no end date', () => {
    before(async () => {
      summer = false
      returnCycle = await ReturnCycleHelper.select(0, summer)
      previousCycle = await ReturnCycleHelper.select(1, summer)
      twoCyclesAgo = await ReturnCycleHelper.select(2, summer)

      const returnCycleEndDate = new Date(returnCycle.endDate)

      testDate = new Date(`${returnCycleEndDate.getFullYear()}-${returnCycleEndDate.getMonth()}-25`)
      endDate = testDate.toISOString().split('T')[0]

      region = RegionHelper.select()
      licence = await LicenceHelper.add({ expiredDate: endDate, regionId: region.id })
      returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })
      returnRequirement = await ReturnRequirementHelper.add({
        regionId: region.naldRegionId,
        returnVersionId: returnVersion.id,
        summer
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

    it('creates the return logs for the current cycle', async () => {
      await ProcessLicenceReturnLogsService.go(licence.licenceRef)

      const result = await ReturnLogModel.query().where('licenceRef', licence.licenceRef).orderBy('endDate', 'ASC')

      expect(result.length).to.equal(1)
      expect(result[0].status).to.equal('due')
    })
  })

  describe('when summer is false and a licence has an endDate that ends in a future cycle', () => {
    before(async () => {
      summer = false
      returnCycle = await ReturnCycleHelper.select(0, summer)
      previousCycle = await ReturnCycleHelper.select(1, summer)
      twoCyclesAgo = await ReturnCycleHelper.select(2, summer)

      const returnCycleEndDate = new Date(returnCycle.endDate)

      testDate = new Date(`${returnCycleEndDate.getFullYear()}-${returnCycleEndDate.getMonth() + 2}-25`)
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

      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(returnCycle.endDate),
        licenceRef: licence.licenceRef,
        returnCycleId: returnCycle.id,
        returnReference: returnRequirement.legacyId,
        startDate: formatDateObjectToISO(returnCycle.startDate)
      })
      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(previousCycle.endDate),
        licenceRef: licence.licenceRef,
        returnCycleId: previousCycle.id,
        returnReference: returnRequirement.legacyId,
        startDate: formatDateObjectToISO(previousCycle.startDate)
      })
      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(twoCyclesAgo.endDate),
        licenceRef: licence.licenceRef,
        returnCycleId: twoCyclesAgo.id,
        returnReference: returnRequirement.legacyId,
        startDate: formatDateObjectToISO(twoCyclesAgo.startDate)
      })

      // BaseRequest depends on the GlobalNotifier to have been set.
      // This happens in app/plugins/global-notifier.plugin.js when the app starts up and the plugin is registered.
      // As we're not creating an instance of Hapi server in this test we recreate the condition by setting
      // it directly with our own stub
      notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
      global.GlobalNotifier = notifierStub
    })

    it('does not void and reissue any of the return logs', async () => {
      await ProcessLicenceReturnLogsService.go(licence.licenceRef, testDate)

      const result = await ReturnLogModel.query().where('licenceRef', licence.licenceRef).orderBy('endDate', 'ASC')

      expect(result.length).to.equal(3)
      expect(result[0].status).to.equal('due')
      expect(result[1].status).to.equal('due')
      expect(result[2].status).to.equal('due')
    })
  })

  describe('when summer is false and the licence has an endDate that ends in the previous cycle', () => {
    before(async () => {
      summer = false
      returnCycle = await ReturnCycleHelper.select(0, summer)
      previousCycle = await ReturnCycleHelper.select(1, summer)
      twoCyclesAgo = await ReturnCycleHelper.select(2, summer)

      const returnCycleEndDate = new Date(previousCycle.endDate)

      testDate = new Date(`${returnCycleEndDate.getFullYear()}-${returnCycleEndDate.getMonth()}-25`)
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

      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(returnCycle.endDate),
        licenceRef: licence.licenceRef,
        returnCycleId: returnCycle.id,
        returnReference: returnRequirement.legacyId,
        startDate: formatDateObjectToISO(returnCycle.startDate)
      })
      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(previousCycle.endDate),
        licenceRef: licence.licenceRef,
        returnCycleId: previousCycle.id,
        returnReference: returnRequirement.legacyId,
        startDate: formatDateObjectToISO(previousCycle.startDate)
      })
      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(twoCyclesAgo.endDate),
        licenceRef: licence.licenceRef,
        returnCycleId: twoCyclesAgo.id,
        returnReference: returnRequirement.legacyId,
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
      await ProcessLicenceReturnLogsService.go(licence.licenceRef, testDate)

      const result = await ReturnLogModel.query().where('licenceRef', licence.licenceRef).orderBy('endDate', 'ASC')
      const areDatesSequential = await ReturnLogHelper.hasContinuousReturnLogs(licence.licenceRef)

      expect(areDatesSequential).to.equal(true)
      expect(result.length).to.equal(4)
      expect(result[0].status).to.equal('due')
      expect(result[1].status).to.equal('due')
      expect(result[1].endDate).to.equal(new Date(endDate))
      expect(result[2].status).to.equal('void')
      expect(result[3].status).to.equal('void')
    })
  })

  describe('when summer is false and the licence has an endDate that ends in the previous cycle and return requirements for both cycles', () => {
    before(async () => {
      summer = false
      returnCycle = await ReturnCycleHelper.select(0, summer)
      previousCycle = await ReturnCycleHelper.select(1, summer)
      twoCyclesAgo = await ReturnCycleHelper.select(2, summer)

      const returnCycleEndDate = new Date(previousCycle.endDate)

      testDate = new Date(`${returnCycleEndDate.getFullYear()}-${returnCycleEndDate.getMonth()}-25`)
      endDate = testDate.toISOString().split('T')[0]

      region = RegionHelper.select()
      licence = await LicenceHelper.add({ expiredDate: endDate, regionId: region.id })
      returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })
      returnRequirement = await ReturnRequirementHelper.add({ summer, returnVersionId: returnVersion.id })
      returnRequirement2 = await ReturnRequirementHelper.add({ summer: !summer, returnVersionId: returnVersion.id })
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

      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(returnCycle.endDate),
        licenceRef: licence.licenceRef,
        returnCycleId: returnCycle.id,
        returnReference: returnRequirement.legacyId,
        startDate: formatDateObjectToISO(returnCycle.startDate)
      })
      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(returnCycle.endDate),
        licenceRef: licence.licenceRef,
        returnCycleId: returnCycle.id,
        returnReference: returnRequirement2.legacyId,
        startDate: formatDateObjectToISO(returnCycle.startDate)
      })
      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(previousCycle.endDate),
        licenceRef: licence.licenceRef,
        returnCycleId: previousCycle.id,
        returnReference: returnRequirement.legacyId,
        startDate: formatDateObjectToISO(previousCycle.startDate)
      })
      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(twoCyclesAgo.endDate),
        licenceRef: licence.licenceRef,
        returnCycleId: twoCyclesAgo.id,
        returnReference: returnRequirement.legacyId,
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
      await ProcessLicenceReturnLogsService.go(licence.licenceRef, testDate)

      const result = await ReturnLogModel.query().where('licenceRef', licence.licenceRef).orderBy('endDate', 'ASC')

      expect(result.length).to.equal(6)
      expect(result[0].status).to.equal('due')
      expect(result[1].status).to.equal('due')
      expect(result[2].status).to.equal('due')
      expect(result[2].endDate).to.equal(new Date(endDate))
      expect(result[3].status).to.equal('void')
      expect(result[4].status).to.equal('void')
      expect(result[5].status).to.equal('void')
    })
  })
})
