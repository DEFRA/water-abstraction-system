'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test Helpers
const NoticesFixture = require('../../fixtures/notices.fixture.js')
const NotificationsFixture = require('../../fixtures/notifications.fixture.js')

// Thing under test
const ViewLicenceCommunicationsPresenter = require('../../../app/presenters/licences/view-licence-communications.presenter.js')

describe('Licences - View Licence Communications presenter', () => {
  const licenceId = 'e7aefa9b-b832-41c8-9add-4e3e03cc1331'

  let notification

  beforeEach(() => {
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
    const result = ViewLicenceCommunicationsPresenter.go([notification], licenceId)

    expect(result).to.equal({
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
      ]
    })
  })
})
