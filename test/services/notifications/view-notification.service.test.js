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
    notice = NoticesFixture.returnsInvitation()
    notification = NotificationsFixture.returnsInvitationEmail(notice)
    notification.event = notice
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('from the view licence communications page', () => {
      beforeEach(() => {
        licence = {
          id: generateUUID(),
          licenceRef: generateLicenceRef()
        }

        Sinon.stub(FetchNotificationService, 'go').resolves({ licence, notification })
      })

      it('returns the page data for the view', async () => {
        const result = await ViewNotificationService.go(notification.id, licence.id)

        expect(result).to.equal({
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
        Sinon.stub(FetchNotificationService, 'go').resolves({ licence: null, notification })
      })

      it('returns the page data for the view', async () => {
        const result = await ViewNotificationService.go(notification.id)

        expect(result).to.equal({
          activeNavBar: 'manage',
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
  })
})
