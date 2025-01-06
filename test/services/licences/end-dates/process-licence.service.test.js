'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')
const ProcessBillingFlagService = require('../../../app/services/licences/supplementary/process-billing-flag.service.js')
const ProcessLicenceReturnLogsService = require('../../../app/services/return-logs/process-licence-return-logs.service.js')

// Thing under test
const ProcessLicenceService = require('../../../app/services/licences/end-dates/process-licence.service.js')

describe('Licences - End Dates - Process Licence service', () => {
  let licence
  let notifierStub
  let processBillingFlagsStub
  let processReturnLogsStub

  beforeEach(() => {
    licence = {
      id: '614d2443-7f26-4d5d-a3ca-918e3cd53faa',
      nald_expired_date: null,
      nald_lapsed_date: null,
      nald_revoked_date: null,
      wrls_expired_date: null,
      wrls_lapsed_date: null,
      wrls_revoked_date: null
    }

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

  describe('when the "end dates" on the licence have not changed', () => {
    beforeEach(() => {
      processBillingFlagsStub = Sinon.stub(ProcessBillingFlagService, 'go').resolves()

      // NOTE: We set our feature flag to true to ensure that this is not the reason ProcessLicenceReturnLogsService was
      // not called
      Sinon.stub(FeatureFlagsConfig, 'enableRequirementsForReturns').value(true)
      processReturnLogsStub = Sinon.stub(ProcessLicenceReturnLogsService, 'go').resolves()
    })

    it('does not process the licence', async () => {
      await ProcessLicenceService.go(licence)

      expect(processBillingFlagsStub.called).to.be.false()
      expect(processReturnLogsStub.called).to.be.false()
    })
  })

  describe('when the "end dates" on the licence have changed', () => {
    beforeEach(() => {
      licence.nald_revoked_date = new Date('2023-01-01')
      licence.wrls_revoked_date = null

      processBillingFlagsStub = Sinon.stub(ProcessBillingFlagService, 'go').resolves()
      processReturnLogsStub = Sinon.stub(ProcessLicenceReturnLogsService, 'go').resolves()
    })

    it('processes the licence for supplementary billing flags', async () => {
      await ProcessLicenceService.go(licence)

      expect(processBillingFlagsStub.calledOnce).to.be.true()
    })

    describe('and the app is now managing "requirements for returns"', () => {
      beforeEach(() => {
        Sinon.stub(FeatureFlagsConfig, 'enableRequirementsForReturns').value(true)
      })

      it('processes the licence for reissuing return logs', async () => {
        await ProcessLicenceService.go(licence)

        expect(processReturnLogsStub.calledOnce).to.be.true()
      })
    })

    describe('and the app is not yet managing "requirements for returns"', () => {
      beforeEach(() => {
        Sinon.stub(FeatureFlagsConfig, 'enableRequirementsForReturns').value(false)
      })

      it('does not process the licence for reissuing return logs', async () => {
        await ProcessLicenceService.go(licence)

        expect(processReturnLogsStub.called).to.be.false()
      })
    })
  })

  describe('when an error is thrown whilst processing the licence', () => {
    beforeEach(() => {
      licence.nald_revoked_date = new Date('2023-01-01')
      licence.wrls_revoked_date = null

      processBillingFlagsStub = Sinon.stub(ProcessBillingFlagService, 'go').rejects(new Error('failed'))
    })

    it('handles the error', async () => {
      await ProcessLicenceService.go(licence)

      const errorLogArgs = notifierStub.omfg.firstCall.args

      expect(notifierStub.omfg.calledWith('Licence changes processing failed')).to.be.true()
      expect(errorLogArgs[1]).to.equal({ id: licence.id })
      expect(errorLogArgs[2]).to.be.instanceOf(Error)
    })
  })
})
