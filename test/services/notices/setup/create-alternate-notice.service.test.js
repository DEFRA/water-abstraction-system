'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Joi = require('joi')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../../app/lib/general.lib.js')
const { formatLongDate } = require('../../../../app/presenters/base.presenter.js')
const { notifyTemplates } = require('../../../../app/lib/notify-templates.lib.js')

const NotificationHelper = require('../../../support/helpers/notification.helper.js')

// Things to stub
const FetchAlternateRecipientsService = require('../../../../app/services/notices/setup/fetch-alternate-recipients.service.js')
const FetchFailedReturnsInvitationsService = require('../../../../app/services/notices/setup/fetch-failed-returns-invitations.service.js')

// Thing under test
const CreateAlternateNoticeService = require('../../../../app/services/notices/setup/create-alternate-notice.service.js')

describe('Notices - Setup - Create Alternate Notice service', () => {
  let fetchFailedReturnsInvitationsResults
  let fetchReturnsAddressesServiceResults
  let noticeWithErrors
  let notifications

  const noticeSchema = Joi.object({
    createdAt: Joi.date().required(),
    id: Joi.string().guid().required(),
    issuer: 'admin-internal@wrls.gov.uk',
    licences: Joi.array().ordered('11/111', '01/124', '01/125').required(),
    metadata: {
      error: 0,
      name: 'Returns: invitation',
      options: {
        excludedLicences: Joi.array().empty()
      },
      recipients: 3,
      returnCycle: {
        dueDate: '2026-04-28',
        endDate: '2026-03-31',
        quarterly: false,
        startDate: '2025-04-01',
        summer: false
      }
    },
    overallStatus: 'pending',
    referenceCode: Joi.string()
      .pattern(/^RINV-/)
      .required(),
    status: 'completed',
    statusCounts: {
      cancelled: 0,
      error: 0,
      pending: 3,
      sent: 0
    },
    subtype: 'returnInvitation',
    triggerNoticeId: Joi.string().guid().optional(),
    type: 'notification',
    updatedAt: Joi.date().required()
  })

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
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called with a notice with errors', () => {
    beforeEach(() => {
      Sinon.stub(FetchFailedReturnsInvitationsService, 'go').resolves(fetchFailedReturnsInvitationsResults)
      Sinon.stub(FetchAlternateRecipientsService, 'go').resolves(fetchReturnsAddressesServiceResults)
    })

    it('returns a list of notifications to be sent and the reference code for the new notice', async () => {
      const result = await CreateAlternateNoticeService.go(noticeWithErrors)

      notifications = [
        _notification(result.notice.id, fetchReturnsAddressesServiceResults[0]),
        _notification(result.notice.id, fetchReturnsAddressesServiceResults[1]),
        _notification(result.notice.id, fetchReturnsAddressesServiceResults[2])
      ]

      Joi.assert(result.notice, noticeSchema)
      expect(result.notifications[0]).to.equal(notifications[0], { skip: ['createdAt', 'id'] })
      expect(result.notifications[1]).to.equal(notifications[1], { skip: ['createdAt', 'id'] })
      expect(result.notifications[2]).to.equal(notifications[2], { skip: ['createdAt', 'id'] })
    })
  })

  describe('when called with a notice with no errors', () => {
    beforeEach(() => {
      Sinon.stub(FetchFailedReturnsInvitationsService, 'go').resolves({ failedLicenceRefs: [], failedReturnIds: [] })
    })

    it('returns an empty array and a null reference code', async () => {
      const result = await CreateAlternateNoticeService.go(noticeWithErrors)

      expect(result).to.equal({
        notifications: [],
        notice: null
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

function _notification(noticeId, licenceHolderDetails) {
  return {
    dueDate: '2026-04-28',
    eventId: noticeId,
    licenceMonitoringStationId: null,
    licences: licenceHolderDetails.licence_refs,
    messageRef: 'returns_invitation_licence_holder_letter',
    messageType: 'letter',
    pdf: null,
    personalisation: {
      address_line_1: `${licenceHolderDetails.contact.initials} ${licenceHolderDetails.contact.name}`,
      address_line_2: '4',
      address_line_3: 'Privet Drive',
      address_line_4: 'Little Whinging',
      address_line_5: 'Surrey',
      address_line_6: 'WD25 7LR',
      name: `${licenceHolderDetails.contact.initials} ${licenceHolderDetails.contact.name}`,
      periodEndDate: formatLongDate('2026-03-31'),
      periodStartDate: formatLongDate('2025-04-01'),
      returnDueDate: formatLongDate('2026-04-28')
    },
    recipient: null,
    returnLogIds: licenceHolderDetails.return_log_ids,
    status: 'pending',
    templateId: notifyTemplates.standard.failedInvitations.licenceHolderLetter
  }
}
