'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const NoticesFixture = require('../../support/fixtures/notices.fixture.js')
const NotificationsFixture = require('../../support/fixtures/notifications.fixture.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')
const { generateLicenceRef } = require('../../support/helpers/licence.helper.js')

// Thing under test
const CommunicationsPresenter = require('../../../app/presenters/return-logs/communications.presenter.js')

describe('Return Logs - Communications presenter', () => {
  let notification
  let notifications
  let returnLog

  beforeEach(() => {
    returnLog = returnLog = {
      id: generateUUID(),
      licence: {
        id: generateUUID(),
        licenceRef: generateLicenceRef()
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
    const result = CommunicationsPresenter.go(returnLog, notifications)

    expect(result).to.equal({
      backLink: {
        href: `/system/licences/${returnLog.licence.id}/returns`,
        text: 'Go back to summary'
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
