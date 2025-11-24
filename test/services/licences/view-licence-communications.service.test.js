'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test Helpers
const NoticesFixture = require('../../fixtures/notices.fixture.js')
const NotificationsFixture = require('../../fixtures/notifications.fixture.js')
const { generateLicenceRef } = require('../../support/helpers/licence.helper.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Things we need to stub
const FetchCommunicationsService = require('../../../app/services/licences/fetch-communications.service.js')
const FetchLicenceService = require('../../../app/services/licences/fetch-licence.service.js')

// Thing under test
const ViewLicenceCommunicationsService = require('../../../app/services/licences/view-licence-communications.service.js')

describe('Licences - View Licence Communications service', () => {
  const page = 1

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

    Sinon.stub(FetchLicenceService, 'go').resolves({
      id: licenceId,
      licenceRef
    })

    Sinon.stub(FetchCommunicationsService, 'go').resolves({
      notifications: [notification],
      totalNumber: 1
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewLicenceCommunicationsService.go(licenceId, auth, page)

      expect(result).to.equal({
        activeNavBar: 'search',
        activeSecondaryNav: 'communications',
        backLink: {
          href: '/licences',
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
          numberOfPages: 1
        },
        roles: ['billing']
      })
    })
  })
})
