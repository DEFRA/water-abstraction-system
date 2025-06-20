'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const BillRunModel = require('../../../../app/models/bill-run.model.js')

// Thing under test
const CleanEmptyBillRunsService = require('../../../../app/services/jobs/clean/clean-empty-bill-runs.service.js')

describe('Jobs - Clean - Clean Empty Bill Runs service', () => {
  let billRun
  let notifierStub

  beforeEach(async () => {
    // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = { omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the clean is successful', () => {
    describe('when there is an "empty" bill run', () => {
      beforeEach(async () => {
        billRun = await BillRunHelper.add({ status: 'empty' })
      })

      it('removes the empty bill run', async () => {
        await CleanEmptyBillRunsService.go()

        const results = await BillRunModel.query().whereIn('id', [billRun.id])

        expect(results).to.have.length(0)
      })
    })

    describe('when the bill run is not flagged as "empty"', () => {
      beforeEach(async () => {
        billRun = await BillRunHelper.add({ status: 'processing' })
      })

      it('does not remove the empty bill run', async () => {
        await CleanEmptyBillRunsService.go()

        const results = await BillRunModel.query().whereIn('id', [billRun.id])

        expect(results).to.have.length(1)
      })
    })
  })

  describe('when the clean errors', () => {
    beforeEach(() => {
      Sinon.stub(BillRunModel, 'query').returns({
        delete: Sinon.stub().returnsThis(),
        where: Sinon.stub().rejects()
      })
    })

    it('does not throw an error', async () => {
      await expect(CleanEmptyBillRunsService.go()).not.to.reject()
    })

    it('logs the error', async () => {
      await CleanEmptyBillRunsService.go()

      const errorLogArgs = notifierStub.omfg.firstCall.args

      expect(notifierStub.omfg.calledWith('Clean job failed')).to.be.true()
      expect(errorLogArgs[1]).to.equal({ job: 'clean-empty-bill-runs' })
      expect(errorLogArgs[2]).to.be.instanceOf(Error)
    })
  })
})
