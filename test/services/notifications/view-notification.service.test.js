'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const NoticesFixture = require('../../fixtures/notices.fixture.js')
const NotificationsFixture = require('../../fixtures/notifications.fixture.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')
const { generateLicenceRef } = require('../../support/helpers/licence.helper.js')

// Things we need to stub
const FetchNotificationService = require('../../../app/services/notifications/fetch-notification.service.js')

// Thing under test
const ViewNotificationService = require('../../../app/services/notifications/view-notification.service.js')

describe('Notifications - View Notification service', () => {
  let licence
  let notice
  let notification

  beforeEach(() => {
    licence = {
      id: generateUUID(),
      licenceRef: generateLicenceRef()
    }

    notice = NoticesFixture.returnsInvitation()
    notification = NotificationsFixture.returnsInvitationEmail(notice)
    notification.event = notice

    Sinon.stub(FetchNotificationService, 'go').resolves({ licence, notification })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns the page data for the view', async () => {
      const result = await ViewNotificationService.go(notification.id, licence.id)

      expect(result).to.equal({
        activeNavBar: 'search',
        address: [],
        alertDetails: null,
        backLink: { href: `/system/licences/${licence.id}/communications`, text: 'Go back to communications' },
        contents: notification.plaintext,
        licenceRef: licence.licenceRef,
        messageType: 'email',
        pageTitle: 'Returns invitation',
        pageTitleCaption: `Licence ${licence.licenceRef}`,
        paperForm: null,
        reference: notice.referenceCode,
        sentDate: '2 April 2025',
        sentBy: notice.issuer,
        sentTo: notification.recipient,
        status: notification.status
      })
    })
  })
})
