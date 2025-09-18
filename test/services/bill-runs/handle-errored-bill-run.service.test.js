'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../support/helpers/bill-run.helper.js')

// Thing under test
const HandleErroredBillRunService = require('../../../app/services/bill-runs/handle-errored-bill-run.service.js')

describe('Handle Errored Bill Run service', () => {
  let billRun
  let notifierStub

  beforeEach(async () => {
    billRun = await BillRunHelper.add()

    // BaseRequest depends on the GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    delete global.GlobalNotifier
  })

  describe('when the service is called successfully', () => {
    it('sets the bill run status to "error"', async () => {
      await HandleErroredBillRunService.go(billRun.id)

      const result = await billRun.$query()

      expect(result.status).to.equal('error')
    })

    describe('when no error code is passed', () => {
      it('does not set an error code', async () => {
        await HandleErroredBillRunService.go(billRun.id)

        const result = await billRun.$query()

        expect(result.errorCode).to.be.null()
      })
    })

    describe('when an error code is passed', () => {
      it('does set an error code', async () => {
        await HandleErroredBillRunService.go(billRun.id, 40)

        const result = await billRun.$query()

        expect(result.errorCode).to.equal(40)
      })
    })
  })

  describe('when the service is called unsuccessfully', () => {
    describe('because patching the bill run fails', () => {
      it('handles the error', async () => {
        await expect(HandleErroredBillRunService.go(billRun.id, 'INVALID_ERROR_CODE')).not.to.reject()
      })

      it('logs an error', async () => {
        // Note that we would not normally pass a string as an error code but we do this here to force the patch to fail
        // in lieu of a working method of stubbing Objection
        await HandleErroredBillRunService.go(billRun.id, 'INVALID_ERROR_CODE')

        const logDataArg = notifierStub.omfg.firstCall.args[1]

        expect(notifierStub.omfg.calledWith('Failed to set error status on bill run')).to.be.true()
        expect(logDataArg.billRunId).to.equal(billRun.id)
        expect(logDataArg.errorCode).to.equal('INVALID_ERROR_CODE')
      })
    })
  })
})
