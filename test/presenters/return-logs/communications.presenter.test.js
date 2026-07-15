// Test helpers
import * as NoticesFixture from '../../support/fixtures/notices.fixture.js'
import * as NotificationsFixture from '../../support/fixtures/notifications.fixture.js'
import { generateUUID } from '../../../app/lib/general.lib.js'
import LicenceHelper from '../../support/helpers/licence.helper.js'

// Thing under test
import CommunicationsPresenter from '../../../app/presenters/return-logs/communications.presenter.js'

describe('Return Logs - Communications presenter', () => {
  let notification
  let notifications
  let returnLog

  beforeEach(() => {
    returnLog = returnLog = {
      id: generateUUID(),
      licence: {
        id: generateUUID(),
        licenceRef: LicenceHelper.generateLicenceRef()
      }
    }

    const notice = NoticesFixture.returnsInvitation()
    const { createdAt, id, messageType, status } = NotificationsFixture.returnsInvitationEmail(notice)

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

    notifications = [notification]
  })

  it('correctly presents the data', () => {
    const result = CommunicationsPresenter(returnLog, notifications)

    expect(result).toEqual({
      backLink: {
        href: `/system/licences/${returnLog.licence.id}/returns`,
        text: 'Go back to returns'
      },
      notifications: [
        {
          link: {
            hiddenText: 'sent 2 April 2025 via email',
            href: `/system/notifications/${notification.id}?return=${returnLog.id}`
          },
          method: 'Email',
          sentBy: 'admin-internal@wrls.gov.uk',
          sentDate: '2 April 2025',
          status: 'sent',
          type: 'Returns invitation'
        }
      ],
      pageTitle: 'Communications',
      pageTitleCaption: `Licence ${returnLog.licence.licenceRef}`
    })
  })
})
