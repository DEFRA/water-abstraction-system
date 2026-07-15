// Test Helpers
import * as NoticesFixture from '../../support/fixtures/notices.fixture.js'
import * as NotificationsFixture from '../../support/fixtures/notifications.fixture.js'
import LicenceHelper from '../../support/helpers/licence.helper.js'
import { generateUUID } from '../../../app/lib/general.lib.js'

// Thing under test
import CommunicationsPresenter from '../../../app/presenters/licences/communications.presenter.js'

describe('Licences - Communications presenter', () => {
  let licence
  let notification

  beforeEach(() => {
    licence = {
      id: generateUUID(),
      licenceRef: LicenceHelper.generateLicenceRef()
    }

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
  })

  it('correctly presents the data', () => {
    const result = CommunicationsPresenter([notification], licence)

    expect(result).toEqual({
      backLink: {
        href: '/',
        text: 'Go back to search'
      },
      notifications: [
        {
          link: {
            hiddenText: 'sent 9 October 2025 via email',
            href: `/system/notifications/${notification.id}?id=${licence.id}`
          },
          method: 'Email',
          sentBy: notification.event.issuer,
          sentDate: '9 October 2025',
          status: notification.status,
          type: 'Stop alert'
        }
      ],
      pageTitle: 'Communications',
      pageTitleCaption: `Licence ${licence.licenceRef}`
    })
  })
})
