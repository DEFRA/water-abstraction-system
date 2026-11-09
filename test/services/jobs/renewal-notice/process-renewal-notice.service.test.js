// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Things we need to stub
import GlobalNotifierStub from 'water-abstraction-engine/test/stubs/global-notifier.stub.js'
import * as SendRenewalNotice from '../../../../src/services/jobs/renewal-notice/send-renewal-notice.service.js'

// Thing under test
import ProcessRenewalNoticeService from '../../../../src/services/jobs/renewal-notice/process-renewal-notice.service.js'

describe('Jobs - Renewal Notices - Process Renewal Notices service', () => {
  const requestedNoticeType = 'invitations'

  let notifierStub

  beforeEach(() => {
    vi.spyOn(SendRenewalNotice, 'default').mockResolvedValue(['mock invitation'])

    // The service depends on GlobalNotifier to have been set. This happens in the GlobalNotifierPlugin
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = GlobalNotifierStub()
    globalThis.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete globalThis.GlobalNotifier
  })

  it('calls the "SendRenewalNotice" for invitations', async () => {
    await ProcessRenewalNoticeService(requestedNoticeType)

    expect(SendRenewalNotice.default).toHaveBeenCalledWith(requestedNoticeType)
  })

  it('logs the time taken in milliseconds and seconds', async () => {
    await ProcessRenewalNoticeService(requestedNoticeType)

    const logDataArg = notifierStub.omg.mock.calls[0][1]

    expect(notifierStub.omg).toHaveBeenCalledWith('Renewals notice job complete', expect.any(Object))
    expect(logDataArg.timeTakenMs).toBeDefined()
    expect(logDataArg.timeTakenSs).toBeDefined()
    expect(logDataArg.count).toEqual(1)
  })
})
