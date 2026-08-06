// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import { generateNoticeReferenceCode } from 'water-abstraction-engine/test/generators.js'

import NotificationsFixture from '../../../../support/fixtures/notifications.fixture.js'
import NotifyResponseFixture from '../../../../support/fixtures/notify-response.fixture.js'

// Things we need to stub
import * as CreateEmailRequest from 'water-abstraction-engine/requests/notify/create-email.request.js'

// Thing under test
import SendEmailNotificationService from '../../../../../src/services/notices/setup/send/send-email-notification.service.js'

describe('Notices - Setup - Send - Send Email Notification service', () => {
  let notification
  let notifyResponse
  let referenceCode

  beforeEach(async () => {
    referenceCode = generateNoticeReferenceCode('RINV-')
    notification = NotificationsFixture.notification().notification

    notifyResponse = NotifyResponseFixture.successfulResponse(referenceCode).email

    vi.spyOn(CreateEmailRequest, 'default').mockResolvedValue(notifyResponse)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return the notification notify response', async () => {
    const result = await SendEmailNotificationService(notification, referenceCode)

    expect(result).toEqual({
      id: notification.id,
      notifyId: notifyResponse.response.body.id,
      notifyStatus: 'created',
      plaintext: 'Dear licence holder,\r\n',
      status: 'pending'
    })
  })
})
