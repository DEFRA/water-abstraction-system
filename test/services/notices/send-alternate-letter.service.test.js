'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../app/lib/general.lib.js')

const NotificationHelper = require('../../support/helpers/notification.helper.js')

// Things to stub
const CreateNoticeService = require('../../../app/services/notices/setup/create-notice.service.js')
const CreateNotificationsService = require('../../../app/services/notices/setup/create-notifications.service.js')
const FetchFailedReturnsInvitationsService = require('../../../app/services/notices/fetch-failed-returns-invitations.service.js')
const FetchReturnsAddressesService = require('../../../app/services/notices/fetch-returns-addresses.service.js')

// Thing under test
const SendAlternateLetterService = require('../../../app/services/notices/send-alternate-letter.service.js')

describe('Notices - Send Alternate Letter service', () => {
  let fetchFailedReturnsInvitationsResults
  let fetchReturnsAddressesServiceResults
  let newNotice
  let noticeWithErrors
  let notifications

  beforeEach(() => {
    fetchFailedReturnsInvitationsResults = {
      failedLicenceRefs: ['11/111', '01/124', '01/125'],
      failedReturnIds: [
        '18998ffd-feaf-4e24-b998-7e7af026ba14',
        'c06708f5-195a-43b1-9f2e-d4f72ee7bd76',
        '0f760d21-0f05-49e7-b226-21ad02dd22b4',
        '6917b4bb-4b68-480f-ae19-3f525dc7c67b',
        'e6bc04bc-1899-4b3c-b733-6f4be6aa8e07'
      ]
    }
    fetchReturnsAddressesServiceResults = [
      _licenceHolderAddress('Anne', '01/111', [generateUUID()]),
      _licenceHolderAddress('Barry', '01/124', [generateUUID()]),
      _licenceHolderAddress('Charles', '01/125', [generateUUID()])
    ]

    noticeWithErrors = {
      issuer: 'admin-internal@wrls.gov.uk',
      licences: ['01/123', '01/124', '01/125', '01/126'],
      metadata: {
        name: 'Returns: invitation',
        error: 3,
        options: { excludeLicences: [] },
        recipients: 4,
        returnCycle: {
          dueDate: '2026-04-28',
          endDate: '2026-03-31',
          summer: false,
          startDate: '2025-04-01',
          quarterly: false
        }
      },
      overallStatus: 'error',
      referenceCode: NotificationHelper.generateReferenceCode('RINV'),
      status: 'completed',
      subtype: 'returnInvitation',
      type: 'notification'
    }

    newNotice = {
      ...noticeWithErrors,
      id: generateUUID(),
      licences: ['01/123', '01/124', '01/125'],
      metadata: {
        ...noticeWithErrors.metadata,
        error: 0,
        recipients: 3
      },
      overallStatus: 'pending',
      referenceCode: NotificationHelper.generateReferenceCode('RINV')
    }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called with a valid event', () => {
    beforeEach(() => {
      Sinon.stub(FetchFailedReturnsInvitationsService, 'go').resolves(fetchFailedReturnsInvitationsResults)
      Sinon.stub(FetchReturnsAddressesService, 'go').resolves(fetchReturnsAddressesServiceResults)
      Sinon.stub(CreateNoticeService, 'go').resolves(newNotice)
      Sinon.stub(CreateNotificationsService, 'go').resolves(newNotice)
    })

    it('creates a new event to send letters to the licence holders', async () => {
      const result = await SendAlternateLetterService.go(noticeWithErrors)

      expect(result).to.equal({
        activeNavBar: 'notices',
        backLink: { href: '/system/notices', text: 'Go back to notices' },
        filters: {
          licence: null,
          openFilter: false,
          recipient: null,
          status: null
        },
        notifications: [
          {
            recipient: [
              'Clean Water Limited',
              'c/o Bob Bobbles',
              'Water Lane',
              'Swampy Heath',
              'CAMBRIDGESHIRE',
              'CB23 1ZZ'
            ],
            licenceRefs: ['01/123'],
            link: {
              href: `/system/notifications/${notifications[0].id}`,
              hiddenText: 'notification for recipient Clean Water Limited'
            },
            messageType: 'letter',
            status: 'sent'
          },
          {
            recipient: ['shaw.carol@atari.com'],
            licenceRefs: ['01/124'],
            link: {
              href: `/system/notifications/${notifications[1].id}`,
              hiddenText: 'notification for recipient shaw.carol@atari.com'
            },
            messageType: 'email',
            status: 'error'
          }
        ],
        numberShowing: 2,
        pageTitle: 'Warning alert',
        pageTitleCaption: `Notice ${fetchResults.notice.referenceCode}`,
        reference: fetchResults.notice.referenceCode,
        sentBy: 'test@wrls.gov.uk',
        sentDate: '21 February 2025',
        showingDeclaration: 'Showing all 2 notifications',
        status: 'error',
        pagination: {
          numberOfPages: 1
        },
        totalNumber: 2
      })
    })
  })
})

function _licenceHolderAddress(name = 'Bob', licenceRef, returnLogIds) {
  return {
    contact: {
      addressLine1: '4',
      addressLine2: 'Privet Drive',
      addressLine3: null,
      addressLine4: null,
      country: null,
      county: 'Surrey',
      forename: 'Harry',
      initials: 'J',
      name,
      postcode: 'WD25 7LR',
      role: 'Licence holder',
      salutation: null,
      town: 'Little Whinging',
      type: 'Person'
    },
    contact_type: 'Licence holder',
    licence_refs: licenceRef,
    return_log_ids: returnLogIds
  }
}
