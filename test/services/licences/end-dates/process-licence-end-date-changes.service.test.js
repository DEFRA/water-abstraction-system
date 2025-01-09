'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceEndDateChangeHelper = require('../../../support/helpers/licence-end-date-change.helper.js')

// Things we need to stub
const FeatureFlagsConfig = require('../../../../config/feature-flags.config.js')
const LicenceEndDateChangeModel = require('../../../../app/models/licence-end-date-change.model.js')
const ProcessBillingFlagService = require('../../../../app/services/licences/supplementary/process-billing-flag.service.js')
const ProcessLicenceReturnLogsService = require('../../../../app/services/return-logs/process-licence-return-logs.service.js')

// Thing under test
const ProcessLicenceEndDateChangesService = require('../../../../app/services/licences/end-dates/process-licence-end-date-changes.service.js')

describe('Licences - End Dates - Process Licence End Date Changes service', () => {
  let licenceEndDateChange
  let notifierStub
  let processBillingFlagsStub
  let processReturnLogsStub

  beforeEach(async () => {
    licenceEndDateChange = await LicenceEndDateChangeHelper.add()

    // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    delete global.GlobalNotifier
  })

  describe('when processing the licence end date changes', () => {
    beforeEach(() => {
      processBillingFlagsStub = Sinon.stub(ProcessBillingFlagService, 'go').resolves()
      processReturnLogsStub = Sinon.stub(ProcessLicenceReturnLogsService, 'go').resolves()
    })

    it('processes the changed licence for supplementary billing flags', async () => {
      await ProcessLicenceEndDateChangesService.go()

      expect(processBillingFlagsStub.called).to.be.true()
    })

    describe('and the app is now managing "requirements for returns"', () => {
      beforeEach(() => {
        Sinon.stub(FeatureFlagsConfig, 'enableRequirementsForReturns').value(true)
      })

      it('processes the changed licence for reissuing return logs', async () => {
        await ProcessLicenceEndDateChangesService.go()

        expect(processReturnLogsStub.called).to.be.true()
      })
    })

    describe('and the app is not yet managing "requirements for returns"', () => {
      beforeEach(() => {
        Sinon.stub(FeatureFlagsConfig, 'enableRequirementsForReturns').value(false)
      })

      it('does not process the changed licence for reissuing return logs', async () => {
        await ProcessLicenceEndDateChangesService.go()

        expect(processReturnLogsStub.called).to.be.false()
      })
    })

    describe('and when the processing is complete', () => {
      it('deletes the licence end date change record', async () => {
        await ProcessLicenceEndDateChangesService.go()

        const result = await LicenceEndDateChangeModel.query().findById(licenceEndDateChange.id)

        expect(result).to.be.undefined()
      })

      it('logs the completed licence change', async () => {
        await ProcessLicenceEndDateChangesService.go()

        const logDataArg = notifierStub.omg.firstCall.args[1]

        expect(notifierStub.omg.calledWith('Process licence end date change complete')).to.be.true()
        expect(logDataArg).to.equal({
          id: licenceEndDateChange.id,
          licenceId: licenceEndDateChange.licenceId,
          dateType: licenceEndDateChange.dateType,
          changeDate: licenceEndDateChange.changeDate,
          naldDate: licenceEndDateChange.naldDate,
          wrlsDate: licenceEndDateChange.wrlsDate
        })
      })

      it('logs the time taken in milliseconds and seconds', async () => {
        await ProcessLicenceEndDateChangesService.go()

        const logDataArg = notifierStub.omg.secondCall.args[1]

        expect(notifierStub.omg.calledWith('Process licence end date changes complete')).to.be.true()
        expect(logDataArg.timeTakenMs).to.exist()
        expect(logDataArg.timeTakenSs).to.exist()
        expect(logDataArg.count).to.exist()
      })
    })
  })

  describe('when there is an error', () => {
    describe('during the processing of a licence', () => {
      beforeEach(() => {
        processBillingFlagsStub = Sinon.stub(ProcessBillingFlagService, 'go').rejects()
      })

      it('handles the error', async () => {
        await ProcessLicenceEndDateChangesService.go()

        const errorLogArgs = notifierStub.omfg.firstCall.args

        expect(notifierStub.omfg.calledWith('Process licence end date change failed')).to.be.true()
        expect(errorLogArgs[1]).to.equal({
          id: licenceEndDateChange.id,
          licenceId: licenceEndDateChange.licenceId,
          dateType: licenceEndDateChange.dateType,
          changeDate: licenceEndDateChange.changeDate,
          naldDate: licenceEndDateChange.naldDate,
          wrlsDate: licenceEndDateChange.wrlsDate
        })
        expect(errorLogArgs[2]).to.be.instanceOf(Error)
      })
    })

    describe('trying to fetch the licence end date changes', () => {
      beforeEach(() => {
        Sinon.stub(LicenceEndDateChangeModel, 'query').returns({
          select: Sinon.stub().rejects()
        })
      })

      it('handles the error', async () => {
        await ProcessLicenceEndDateChangesService.go()

        const errorLogArgs = notifierStub.omfg.firstCall.args

        expect(notifierStub.omfg.calledWith('Process licence end date changes failed')).to.be.true()
        expect(errorLogArgs[1]).to.be.null()
        expect(errorLogArgs[2]).to.be.instanceOf(Error)
      })
    })
  })
})
