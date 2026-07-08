// Test framework dependencies

// Test helpers
import * as NotificationsFixture from '../../../../support/fixtures/notifications.fixture.js'
import * as NotifyResponseFixture from '../../../../support/fixtures/notify-response.fixture.js'
import { generateNoticeReferenceCode } from '../../../../../app/lib/general.lib.js'

// Things we need to stub
import * as CreatePrecompiledFileRequest from '../../../../../app/requests/notify/create-precompiled-file.request.js'
import PreparePaperReturnService from '../../../../../app/services/notices/setup/prepare-paper-return.service.js'

// Thing under test
import SendPaperReturnNotificationService from '../../../../../app/services/notices/setup/send/send-paper-return-notification.service.js'

describe('Notices - Setup - Send - Send Paper Return Notification service', () => {
  let buffer
  let notification
  let notifyResponse
  let referenceCode

  beforeEach(async () => {
    referenceCode = generateNoticeReferenceCode('RINV-')
    notification = NotificationsFixture.notification().notification

    notifyResponse = NotifyResponseFixture.successfulResponse(referenceCode).pdf

    vi.spyOn(CreatePrecompiledFileRequest, 'send') // TODO: onCall not auto-converted.mockResolvedValue(notifyResponse)

    buffer = Buffer.from('mock file')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the notification is successful', () => {
    beforeEach(() => {
      vi.mock('../../../../../app/services/notices/setup/prepare-paper-return.service.js')
      PreparePaperReturnService.mockResolvedValue({
        succeeded: true,
        response: { body: buffer }
      })
    })

    it('should return the notification notify response', async () => {
      const result = await SendPaperReturnNotificationService(notification, referenceCode)

      expect(result).toEqual({
        id: notification.id,
        notifyId: notifyResponse.response.body.id,
        notifyStatus: 'created',
        pdf: buffer,
        plaintext: null,
        status: 'pending'
      })
    })
  })

  describe('when generating the return form fails', () => {
    beforeEach(() => {
      vi.mock('../../../../../app/services/notices/setup/prepare-paper-return.service.js')
      PreparePaperReturnService.mockResolvedValue({
        succeeded: false,
        response: { code: 'ENOTFOUND', message: 'getaddrinfo ENOTFOUND gotenberg' }
      })
    })

    it('should return the notification notify response', async () => {
      const result = await SendPaperReturnNotificationService(notification, referenceCode)

      expect(result).toEqual({
        id: notification.id,
        notifyError:
          '{"status":"ENOTFOUND","message":"Failed to generate the paper return PDF","errors":["getaddrinfo ENOTFOUND gotenberg"]}',
        status: 'error'
      })
    })
  })
})
