'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const AnnualProcessBillRunService = require('../../../../app/services/bill-runs/annual/process-bill-run.service.js')

describe('Annual Process Bill Run service', () => {
  let notifierStub

  beforeEach(() => {
    // RequestLib depends on the GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  describe('when the service is called', () => {
    it('logs the attempt to process the annual bill run', async () => {
      await AnnualProcessBillRunService.go({ id: 'd913e2c1-2442-4c87-8642-d88670dad8e4' })

      expect(
        notifierStub.omg.calledWith('Annual not implemented: Cannot process d913e2c1-2442-4c87-8642-d88670dad8e4')
      ).to.be.true()
    })
  })
})
