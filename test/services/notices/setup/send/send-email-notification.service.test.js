// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import NotificationsFixture from '../../../../support/fixtures/notifications.fixture.js'
import NotifyResponseFixture from '../../../../support/fixtures/notify-response.fixture.js'
import { generateNoticeReferenceCode } from '../../../../support/generators.js'

// Things we need to stub
import * as CreateEmailRequest from '../../../../../app/requests/notify/create-email.request.js'

// Thing under test
import SendEmailNotificationService from '../../../../../app/services/notices/setup/send/send-email-notification.service.js'

describe('Notices - Setup - Send - Send Email Notification service', () => {
  let notification
  let notifyResponse
  let referenceCode

  beforeEach(async () => {
    referenceCode = generateNoticeReferenceCode('RINV-')
    notification = NotificationsFixture.notification().notification

    notifyResponse = NotifyResponseFixture.successfulResponse(referenceCode).email

    vi.spyOn(CreateEmailRequest, 'send').mockResolvedValue(notifyResponse)
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
