// Things we need to stub
import GlobalNotifierStub from '../../../support/stubs/global-notifier.stub.js'
import * as SendRenewalInvitations from '../../../../app/services/jobs/renewal-invitations/send-renewal-invitations.service.js'

// Thing under test
import ProcessRenewalInvitationsService from '../../../../app/services/jobs/renewal-invitations/process-renewal-invitations.service.js'

describe('Jobs - Renewal Invitations - Process Renewal Invitations service', () => {
  const days = '300'

  let notifierStub

  beforeEach(() => {
    vi.spyOn(SendRenewalInvitations, 'default').mockResolvedValue(['mock invitation'])

    // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = GlobalNotifierStub()
    globalThis.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete globalThis.GlobalNotifier
  })

  it('calls the "SendRenewalInvitations"', async () => {
    await ProcessRenewalInvitationsService(days)

    expect(SendRenewalInvitations.default).toHaveBeenCalledWith(days)
  })

  it('logs the time taken in milliseconds and seconds', async () => {
    await ProcessRenewalInvitationsService(days)

    const logDataArg = notifierStub.omg.mock.calls[0][1]

    expect(notifierStub.omg).toHaveBeenCalledWith('Renewals invitation status job complete', expect.any(Object))
    expect(logDataArg.timeTakenMs).toBeDefined()
    expect(logDataArg.timeTakenSs).toBeDefined()
    expect(logDataArg.count).toEqual(1)
  })
})
