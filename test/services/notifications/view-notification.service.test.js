// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import LicenceHelper from '../../support/helpers/licence.helper.js'
import NoticesFixture from '../../support/fixtures/notices.fixture.js'
import NotificationsFixture from '../../support/fixtures/notifications.fixture.js'
import { generateUUID } from '../../../app/lib/general.lib.js'

// Things we need to stub
import * as FetchNotificationService from '../../../app/services/notifications/fetch-notification.service.js'

// Thing under test
import ViewNotificationService from '../../../app/services/notifications/view-notification.service.js'

describe('Notifications - View Notification service', () => {
  let companyContactId
  let licence
  let notice
  let notification
  let returnLogId

  beforeEach(() => {
    notice = NoticesFixture.returnsInvitation()
    notification = NotificationsFixture.returnsInvitationEmail(notice)
    notification.event = notice

    // These will be undefined if not in the query string
    companyContactId = undefined
    licence = undefined
    returnLogId = undefined
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('from the view licence communications page', () => {
      beforeEach(() => {
        licence = {
          id: generateUUID(),
          licenceRef: LicenceHelper.generateLicenceRef()
        }

        vi.spyOn(FetchNotificationService, 'default').mockResolvedValue({ licence, notification })
      })

      it('returns the page data for the view', async () => {
        const result = await ViewNotificationService(notification.id, licence.id)

        expect(result).toEqual({
          activeNavBar: 'search',
          address: [],
          alertDetails: null,
          backLink: { href: `/system/licences/${licence.id}/communications`, text: 'Go back to communications' },
          contents: notification.plaintext,
          errorDetails: null,
          messageType: 'email',
          pageTitle: 'Returns invitation',
          pageTitleCaption: `Licence ${licence.licenceRef}`,
          paperForm: null,
          reference: notice.referenceCode,
          returnedDate: null,
          sentDate: '2 April 2025',
          sentBy: notice.issuer,
          sentTo: notification.recipient,
          status: notification.status
        })
      })
    })

    describe('from the view notice page', () => {
      beforeEach(() => {
        vi.spyOn(FetchNotificationService, 'default').mockResolvedValue({ licence: null, notification })
      })

      it('returns the page data for the view', async () => {
        const result = await ViewNotificationService(notification.id)

        expect(result).toEqual({
          activeNavBar: 'notices',
          address: [],
          alertDetails: null,
          backLink: {
            href: `/system/notices/${notice.id}`,
            text: `Go back to notice ${notice.referenceCode}`
          },
          contents: notification.plaintext,
          errorDetails: null,
          messageType: 'email',
          pageTitle: 'Returns invitation',
          pageTitleCaption: `Notice ${notice.referenceCode}`,
          paperForm: null,
          reference: null,
          returnedDate: null,
          sentDate: '2 April 2025',
          sentBy: notice.issuer,
          sentTo: notification.recipient,
          status: notification.status
        })
      })
    })

    describe('from the view return log page', () => {
      beforeEach(() => {
        returnLogId = generateUUID()
        vi.spyOn(FetchNotificationService, 'default').mockResolvedValue({ licence: null, notification })
      })

      it('returns the page data for the view', async () => {
        const result = await ViewNotificationService(notification.id, licence, returnLogId)

        expect(result).toEqual({
          activeNavBar: 'notices',
          address: [],
          alertDetails: null,
          backLink: {
            href: `/system/return-logs/${returnLogId}/communications`,
            text: 'Go back to return log'
          },
          contents: notification.plaintext,
          errorDetails: null,
          messageType: 'email',
          pageTitle: 'Returns invitation',
          pageTitleCaption: `Notice ${notice.referenceCode}`,
          paperForm: null,
          reference: null,
          returnedDate: null,
          sentDate: '2 April 2025',
          sentBy: notice.issuer,
          sentTo: notification.recipient,
          status: notification.status
        })
      })
    })

    describe('from the view company contacts page', () => {
      beforeEach(() => {
        companyContactId = generateUUID()
        vi.spyOn(FetchNotificationService, 'default').mockResolvedValue({ licence: null, notification })
      })

      it('returns the page data for the view', async () => {
        const result = await ViewNotificationService(notification.id, licence, returnLogId, companyContactId)

        expect(result).toEqual({
          activeNavBar: 'notices',
          address: [],
          alertDetails: null,
          backLink: {
            href: `/system/company-contacts/${companyContactId}/communications`,
            text: 'Go back to company contact'
          },
          contents: notification.plaintext,
          errorDetails: null,
          messageType: 'email',
          pageTitle: 'Returns invitation',
          pageTitleCaption: `Notice ${notice.referenceCode}`,
          paperForm: null,
          reference: null,
          returnedDate: null,
          sentDate: '2 April 2025',
          sentBy: notice.issuer,
          sentTo: notification.recipient,
          status: notification.status
        })
      })
    })
  })
})
