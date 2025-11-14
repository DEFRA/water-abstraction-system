'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventHelper = require('../../../support/helpers/event.helper.js')
const NotificationHelper = require('../../../support/helpers/notification.helper.js')

// Thing under test
const FetchFailedReturnsInvitationsService = require('../../../../app/services/notices/setup/fetch-failed-returns-invitations.service.js')

describe('Notices - Fetch Failed Returns Invitations service', () => {
  let event

  before(async () => {
    event = await EventHelper.add({
      issuer: 'admin-internal@wrls.gov.uk',
      licences: ['01/123', '01/124', '01/125', '12/222', '33/333'],
      metadata: {
        name: 'Returns: invitation',
        error: 3,
        options: { excludeLicences: [] },
        recipients: 4,
        returnCycle: { dueDate: '2025-10-28', endDate: '2025-09-30', isSummer: false, startDate: '2025-07-01' }
      },
      overallStatus: 'error',
      referenceCode: NotificationHelper.generateReferenceCode('WAA'),
      status: 'completed',
      subtype: 'returnInvitation',
      type: 'notification'
    })

    await NotificationHelper.add({
      eventId: event.id,
      licences: '["11/111", "01/124"]',
      messageRef: 'returns_invitation_primary_user_email',
      messageType: 'email',
      notifyId: '62f1299a-bf0c-4d89-8240-232cdb24c0f6',
      notifyStatus: 'created',
      plaintext: 'Dear Clean Water Limited,\r\n',
      recipient: 'error@example.com',
      returnLogIds: ['18998ffd-feaf-4e24-b998-7e7af026ba14', 'c06708f5-195a-43b1-9f2e-d4f72ee7bd76'],
      status: 'error'
    })

    await NotificationHelper.add({
      eventId: event.id,
      licences: '["11/111", "01/125"]',
      messageRef: 'returns_invitation_primary_user_email',
      messageType: 'email',
      notifyId: '62f1299a-bf0c-4d89-8240-232cdb24c0f7',
      notifyStatus: 'created',
      plaintext: 'Dear Clean Water Limited,\r\n',
      recipient: 'error-duplicate-licence-ref@example.com',
      returnLogIds: [
        '0f760d21-0f05-49e7-b226-21ad02dd22b4',
        '6917b4bb-4b68-480f-ae19-3f525dc7c67b',
        'e6bc04bc-1899-4b3c-b733-6f4be6aa8e07'
      ],
      status: 'error'
    })

    await NotificationHelper.add({
      alternateNoticeId: 'db649e8c-d38d-4d7a-92ce-bc681c645124',
      eventId: event.id,
      licences: '["33/333"]',
      messageRef: 'returns_invitation_primary_user_email',
      messageType: 'email',
      notifyId: '62f1299a-bf0c-4d89-8240-232cdb24c0f7',
      notifyStatus: 'created',
      plaintext: 'Dear Clean Water Limited,\r\n',
      recipient: 'already-processed@example.com',
      returnLogIds: ['38ed8bf6-2979-4e7a-83b8-77a46f1b64e6'],
      status: 'error'
    })

    await NotificationHelper.add({
      eventId: event.id,
      licences: '["12/222"]',
      messageRef: 'returns_invitation_primary_user_email',
      messageType: 'email',
      notifyId: '62f1299a-bf0c-4d89-8240-232cdb24c0f8',
      notifyStatus: 'created',
      plaintext: 'Dear Clean Water Limited,\r\n',
      recipient: 'sent@example.com',
      returnLogIds: ['38ed8bf6-2979-4e7a-83b8-77a46f1b64e6'],
      status: 'sent'
    })
  })

  describe('when there is a matching notice', () => {
    it('returns the unique list of licence references that have an error with no alternateNoticeId', async () => {
      const result = await FetchFailedReturnsInvitationsService.go(event.id)

      expect(result).to.equal({
        failedLicenceRefs: ['11/111', '01/124', '01/125'],
        failedReturnIds: [
          '18998ffd-feaf-4e24-b998-7e7af026ba14',
          'c06708f5-195a-43b1-9f2e-d4f72ee7bd76',
          '0f760d21-0f05-49e7-b226-21ad02dd22b4',
          '6917b4bb-4b68-480f-ae19-3f525dc7c67b',
          'e6bc04bc-1899-4b3c-b733-6f4be6aa8e07'
        ]
      })
    })
  })

  describe('when no matching notice exists', () => {
    it('returns an empty array', async () => {
      const result = await FetchFailedReturnsInvitationsService.go('1f0e0086-7bc4-4ef2-a696-35ea1e79d224')

      expect(result).to.equal([])
    })
  })
})
