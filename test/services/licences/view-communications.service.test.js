// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test Helpers
import NoticesFixture from '../../support/fixtures/notices.fixture.js'
import NotificationsFixture from '../../support/fixtures/notifications.fixture.js'
import { generateLicenceRef, generateUUID } from '../../support/generators.js'

// Things we need to stub
import * as FetchLicenceService from '../../../app/services/licences/fetch-licence.service.js'
import * as FetchNotificationsDal from '../../../app/dal/licences/fetch-notifications.dal.js'

// Thing under test
import ViewCommunicationsService from '../../../app/services/licences/view-communications.service.js'

describe('Licences - View Communications service', () => {
  const page = '1'

  let auth
  let licenceId
  let licenceRef
  let notification

  beforeEach(() => {
    auth = {
      credentials: {
        roles: [
          {
            role: 'billing'
          }
        ]
      }
    }

    licenceId = generateUUID()
    licenceRef = generateLicenceRef()

    const notice = NoticesFixture.alertStop()
    const { createdAt, id, messageType, status } = NotificationsFixture.abstractionAlertEmail(notice)

    notification = {
      createdAt,
      id,
      messageType,
      status,
      event: {
        id: notice.id,
        issuer: notice.issuer,
        subtype: notice.subtype,
        sendingAlertType: notice.metadata.options.sendingAlertType
      }
    }

    vi.spyOn(FetchLicenceService, 'default').mockResolvedValue({
      id: licenceId,
      licenceRef
    })

    vi.spyOn(FetchNotificationsDal, 'default').mockResolvedValue({
      notifications: [notification],
      totalNumber: 1
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewCommunicationsService(licenceId, auth, page)

      expect(result).toEqual({
        activeSecondaryNav: 'communications',
        backLink: {
          href: '/',
          text: 'Go back to search'
        },
        notifications: [
          {
            link: {
              hiddenText: 'sent 9 October 2025 via email',
              href: `/system/notifications/${notification.id}?id=${licenceId}`
            },
            method: 'Email',
            sentBy: notification.event.issuer,
            sentDate: '9 October 2025',
            status: notification.status,
            type: 'Stop alert'
          }
        ],
        pageTitle: 'Communications',
        pageTitleCaption: `Licence ${licenceRef}`,
        pagination: {
          currentPageNumber: 1,
          numberOfPages: 1,
          showingMessage: 'Showing all 1 communications'
        },
        roles: ['billing']
      })
    })
  })
})
