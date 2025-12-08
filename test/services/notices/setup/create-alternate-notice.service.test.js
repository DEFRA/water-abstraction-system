'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const NoticesFixture = require('../../../fixtures/notices.fixture.js')
const { NOTIFY_TEMPLATES } = require('../../../../app/lib/notify-templates.lib.js')

// Things to stub
const FetchAlternateReturnsRecipientsService = require('../../../../app/services/notices/setup/returns-notice/fetch-alternate-returns-recipients.service.js')
const FetchFailedReturnsInvitationsService = require('../../../../app/services/notices/setup/returns-notice/fetch-failed-returns-invitations.service.js')

// Thing under test
const CreateAlternateNoticeService = require('../../../../app/services/notices/setup/create-alternate-notice.service.js')

describe('Notices - Setup - Create Alternate Notice service', () => {
  let fetchFailedReturnsInvitationsResults
  let fetchReturnsAddressesServiceResults
  let noticeWithErrors

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called with a notice with errors', () => {
    beforeEach(() => {
      noticeWithErrors = NoticesFixture.returnsInvitation()
      noticeWithErrors.licences = ['11/111', '01/123', '01/124', '01/125', '01/126']
      noticeWithErrors.metadata.recipients = 5
      noticeWithErrors.statusCounts.error = 3
      noticeWithErrors.statusCounts.sent = 2

      fetchFailedReturnsInvitationsResults = {
        failedLicenceRefs: ['11/111', '01/124', '01/125'],
        failedReturnIds: [
          '18998ffd-feaf-4e24-b998-7e7af026ba14',
          'c06708f5-195a-43b1-9f2e-d4f72ee7bd76',
          'e6bc04bc-1899-4b3c-b733-6f4be6aa8e07'
        ]
      }

      fetchReturnsAddressesServiceResults = [
        _licenceHolderAddress('Anne', '01/111', [
          '18998ffd-feaf-4e24-b998-7e7af026ba14',
          'c06708f5-195a-43b1-9f2e-d4f72ee7bd76'
        ]),
        _licenceHolderAddress('Charles', '01/125', ['e6bc04bc-1899-4b3c-b733-6f4be6aa8e07'])
      ]

      Sinon.stub(FetchFailedReturnsInvitationsService, 'go').resolves(fetchFailedReturnsInvitationsResults)
      Sinon.stub(FetchAlternateReturnsRecipientsService, 'go').resolves(fetchReturnsAddressesServiceResults)
    })

    it('returns a list of notifications to be sent and the reference code for the new notice', async () => {
      const result = await CreateAlternateNoticeService.go(noticeWithErrors)

      expect(result.notice).to.equal(
        {
          issuer: 'admin-internal@wrls.gov.uk',
          licences: ['11/111', '01/124', '01/125'],
          metadata: {
            name: 'Returns: invitation',
            error: 0,
            options: { excludedLicences: [] },
            recipients: 2,
            returnCycle: {
              dueDate: '2025-04-28',
              endDate: '2025-03-31',
              isSummer: false,
              startDate: '2024-04-01'
            }
          },
          overallStatus: 'pending',
          status: 'completed',
          statusCounts: { cancelled: 0, error: 0, pending: 2, sent: 0 },
          subtype: 'returnInvitation',
          triggerNoticeId: noticeWithErrors.id,
          type: 'notification'
        },
        { skip: ['createdAt', 'id', 'referenceCode', 'updatedAt'] }
      )

      expect(result.notifications[0]).to.equal(
        {
          dueDate: new Date('2025-04-28'),
          eventId: result.notice.id,
          licences: '01/111',
          messageType: 'letter',
          messageRef: 'returns invitation',
          personalisation: {
            name: 'J Anne',
            periodEndDate: '31 March 2025',
            returnDueDate: '28 April 2025',
            address_line_1: 'J Anne',
            address_line_2: '4',
            address_line_3: 'Privet Drive',
            address_line_4: 'Little Whinging',
            address_line_5: 'Surrey',
            address_line_6: 'WD25 7LR',
            periodStartDate: '1 April 2024'
          },
          returnLogIds: ['18998ffd-feaf-4e24-b998-7e7af026ba14', 'c06708f5-195a-43b1-9f2e-d4f72ee7bd76'],
          status: 'pending',
          templateId: NOTIFY_TEMPLATES.failedInvitations.standard.letter['licence holder'],
          licenceMonitoringStationId: null,
          pdf: null,
          recipient: null
        },
        { skip: ['createdAt', 'id'] }
      )
      expect(result.notifications[1]).to.equal(
        {
          dueDate: new Date('2025-04-28'),
          eventId: result.notice.id,
          licences: '01/125',
          messageType: 'letter',
          messageRef: 'returns invitation',
          personalisation: {
            name: 'J Charles',
            periodEndDate: '31 March 2025',
            returnDueDate: '28 April 2025',
            address_line_1: 'J Charles',
            address_line_2: '4',
            address_line_3: 'Privet Drive',
            address_line_4: 'Little Whinging',
            address_line_5: 'Surrey',
            address_line_6: 'WD25 7LR',
            periodStartDate: '1 April 2024'
          },
          returnLogIds: ['e6bc04bc-1899-4b3c-b733-6f4be6aa8e07'],
          status: 'pending',
          templateId: NOTIFY_TEMPLATES.failedInvitations.standard.letter['licence holder'],
          licenceMonitoringStationId: null,
          pdf: null,
          recipient: null
        },
        { skip: ['createdAt', 'id'] }
      )
    })
  })

  describe('when called with a notice with no errors', () => {
    beforeEach(() => {
      Sinon.stub(FetchFailedReturnsInvitationsService, 'go').resolves({ failedLicenceRefs: [], failedReturnIds: [] })
    })

    it('returns an empty notifications array and a null notice', async () => {
      const result = await CreateAlternateNoticeService.go('bc09ccb8-e735-4804-8688-6165450d53b9')

      expect(result).to.equal({
        notifications: [],
        notice: null
      })
    })
  })
})

function _licenceHolderAddress(name, licenceRef, returnLogIds) {
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
    contact_type: 'licence holder',
    licence_refs: licenceRef,
    return_log_ids: returnLogIds
  }
}
