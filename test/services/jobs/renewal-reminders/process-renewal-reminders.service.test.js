'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ProcessRenewalRemindersService = require('../../../../app/services/jobs/renewal-reminders/process-renewal-reminders.service.js')

describe('Jobs - Licence Updates - Process Renewal Reminders service', () => {
  let notifierStub

  beforeEach(() => {
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

  it('logs the time taken in milliseconds and seconds', async () => {
    await ProcessRenewalRemindersService.go()

    const logDataArg = notifierStub.omg.firstCall.args[1]

    expect(notifierStub.omg.calledWith('Renewal reminders status job complete')).to.be.true()
    expect(logDataArg.timeTakenMs).to.exist()
    expect(logDataArg.timeTakenSs).to.exist()
  })
})
