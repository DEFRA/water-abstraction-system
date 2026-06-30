'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Things we need to stub
const GlobalNotifierStub = require('../../../support/stubs/global-notifier.stub.js')
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
    notifierStub = GlobalNotifierStub.build(Sinon)
    globalThis.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    delete globalThis.GlobalNotifier
  })

  it('calls the "SendRenewalInvitations"', async () => {
    await ProcessRenewalInvitationsService.go(days)

    expect(SendRenewalInvitations.go.calledWith(days)).toBe(true)
  })

  it('logs the time taken in milliseconds and seconds', async () => {
    await ProcessRenewalInvitationsService.go(days)

    const logDataArg = notifierStub.omg.firstCall.args[1]

    expect(notifierStub.omg.calledWith('Renewals invitation status job complete')).toBe(true)
    expect(logDataArg.timeTakenMs).toBeDefined()
    expect(logDataArg.timeTakenSs).toBeDefined()
    expect(logDataArg.count).toEqual(1)
  })
})
