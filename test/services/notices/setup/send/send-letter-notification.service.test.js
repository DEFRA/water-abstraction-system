// Test helpers
import * as NotificationsFixture from '../../../../support/fixtures/notifications.fixture.js'
import * as NotifyResponseFixture from '../../../../support/fixtures/notify-response.fixture.js'
import { generateNoticeReferenceCode } from '../../../../../app/lib/general.lib.js'

// Things we need to stub
import * as CreateLetterRequest from '../../../../../app/requests/notify/create-letter.request.js'

// Thing under test
import SendLetterNotificationService from '../../../../../app/services/notices/setup/send/send-letter-notification.service.js'

describe('Notices - Setup - Send - Send Letter Notification service', () => {
  let notification
  let notifyResponse
  let referenceCode

  beforeEach(async () => {
    referenceCode = generateNoticeReferenceCode('RINV-')
    notification = NotificationsFixture.notification().notification

    notifyResponse = NotifyResponseFixture.successfulResponse(referenceCode).letter

    vi.spyOn(CreateLetterRequest, 'send').mockResolvedValue(notifyResponse)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return the notification notify response', async () => {
    const result = await SendLetterNotificationService(notification, referenceCode)

    expect(result).toEqual({
      id: notification.id,
      notifyId: notifyResponse.response.body.id,
      notifyStatus: 'created',
      plaintext: 'Dear Licence holder,\r\n',
      status: 'pending'
    })
  })
})
