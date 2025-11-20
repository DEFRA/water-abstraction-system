'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test Helpers
const NoticesFixture = require('../../fixtures/notices.fixture.js')
const NotificationsFixture = require('../../fixtures/notifications.fixture.js')
const { generateLicenceRef } = require('../../support/helpers/licence.helper.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Thing under test
const ViewLicenceCommunicationsPresenter = require('../../../app/presenters/licences/view-licence-communications.presenter.js')
describe('Licences - View Licence Communications presenter', () => {
  let licence
  let notification

  beforeEach(() => {
    licence = {
      id: generateUUID(),
      licenceRef: generateLicenceRef()
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
    const result = ViewLicenceCommunicationsPresenter.go([notification], licence)

    expect(result).to.equal({
      backLink: {
        href: '/licences',
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
