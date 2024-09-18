'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ReturnLogModel = require('../../../../app/models/return-log.model.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')
const ReturnRequirementHelper = require('../../../support/helpers/return-requirement.helper.js')
const ReturnRequirementPointHelper = require('../../../support/helpers/return-requirement-point.helper.js')
const ReturnRequirementPurposeHelper = require('../../../support/helpers/return-requirement-purpose.helper.js')
const ReturnVersionHelper = require('../../../support/helpers/return-version.helper.js')

// Thing under test
const ProcessLicenceReturnLogsService = require('../../../../app/services/jobs/return-logs/process-licence-return-logs.service.js')

describe('Process licence return logs service', () => {
  const allYearDueDate = new Date(new Date().getFullYear() + 1, 3, 28).toISOString().split('T')[0]
  const allYearEndDate = new Date(new Date().getFullYear() + 1, 2, 31).toISOString().split('T')[0]
  const allYearStartDate = new Date(new Date().getFullYear(), 3, 1).toISOString().split('T')[0]

  describe('when a valid licence reference is provided', () => {
    let licence
    let region
    let returnVersion
    let returnRequirement
    let notifierStub

    before(async () => {
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
      global.GlobalNotifier = notifierStub
    })

    it('generates and saves any returns logs required for the current cycle', async () => {
      await ProcessLicenceReturnLogsService.go(licence.licenceRef)

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
    })
  })
})
