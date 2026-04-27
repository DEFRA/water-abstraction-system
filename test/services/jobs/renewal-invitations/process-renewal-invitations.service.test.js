'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const SendRenewalInvitations = require('../../../../app/services/jobs/renewal-invitations/send-renewal-invitations.service.js')

// Thing under test
const ProcessRenewalInvitationsService = require('../../../../app/services/jobs/renewal-invitations/process-renewal-invitations.service.js')

describe('Jobs - Renewal Invitations - Process Renewal Invitations service', () => {
  const days = '300'

  let notifierStub

  beforeEach(() => {
    Sinon.stub(SendRenewalInvitations, 'go').resolves(['mock invitation'])

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

  it('calls the "SendRenewalInvitations"', async () => {
    await ProcessRenewalInvitationsService.go(days)

    expect(SendRenewalInvitations.go.calledWith(days)).to.be.true()
  })

  it('logs the time taken in milliseconds and seconds', async () => {
    await ProcessRenewalInvitationsService.go(days)

    const logDataArg = notifierStub.omg.firstCall.args[1]

    expect(notifierStub.omg.calledWith('Renewal invitations status job complete')).to.be.true()
    expect(logDataArg.timeTakenMs).to.exist()
    expect(logDataArg.timeTakenSs).to.exist()
    expect(logDataArg.count).to.equal(1)
  })
})
