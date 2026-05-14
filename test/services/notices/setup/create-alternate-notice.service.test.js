'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventModel = require('../../../../app/models/event.model.js')
const NoticesFixture = require('../../../support/fixtures/notices.fixture.js')
const NotificationModel = require('../../../../app/models/notification.model.js')
const RecipientsFixture = require('../../../support/fixtures/recipients.fixture.js')
const { formatLongDate } = require('../../../../app/presenters/base.presenter.js')
const { futureDueDate } = require('../../../../app/presenters/notices/base.presenter.js')
const { NOTIFY_TEMPLATES } = require('../../../../app/lib/notify-templates.lib.js')

// Things to stub
const FetchAlternateRenewalRecipientsService = require('../../../../app/services/notices/setup/renewal-notice/fetch-alternate-renewal-recipients.service.js')
const FetchAlternateReturnsRecipientsService = require('../../../../app/services/notices/setup/returns-notice/fetch-alternate-returns-recipients.service.js')

// Thing under test
const CreateAlternateNoticeService = require('../../../../app/services/notices/setup/create-alternate-notice.service.js')

describe('Notices - Setup - Create Alternate Notice service', () => {
  let licenceRefs
  let notice
  let notificationId
  let recipient

  afterEach(async () => {
    Sinon.restore()

    await NotificationModel.query().deleteById(notificationId)
    await EventModel.query().deleteById(notice.id)
  })

  describe('when called for a returns invitation', () => {
    let dueDate
    let returnLogIds

    beforeEach(() => {
      dueDate = futureDueDate('letter')

      notice = NoticesFixture.returnsInvitation()

      recipient = RecipientsFixture.returnsNoticeLicenceHolder()
      recipient.licence_refs = notice.licences

      licenceRefs = notice.licences
      returnLogIds = recipient.return_log_ids

      Sinon.stub(FetchAlternateReturnsRecipientsService, 'go').resolves([recipient])
    })

    it('creates and then returns the alternate notice and associated notifications ready for sending', async () => {
      const result = await CreateAlternateNoticeService.go(notice, licenceRefs, { dueDate, returnLogIds })

      expect(result.notice).to.equal(
        {
          issuer: notice.issuer,
          licences: notice.licences,
          metadata: {
            name: 'Returns: invitation',
            error: 0,
            options: { excludedLicences: [] },
            recipients: 1,
            returnCycle: notice.metadata.returnCycle
          },
          overallStatus: 'pending',
          status: 'completed',
          statusCounts: { cancelled: 0, error: 0, pending: 1, sent: 0 },
          subtype: 'returnInvitation',
          triggerNoticeId: notice.id,
          type: 'notification'
        },
        { skip: ['createdAt', 'id', 'referenceCode', 'updatedAt'] }
      )

      expect(result.notifications).to.have.length(1)
      expect(result.notifications[0]).to.equal(
        {
          contactType: 'licence holder',
          dueDate,
          eventId: result.notice.id,
          licences: recipient.licence_refs,
          licenceMonitoringStationId: null,
          messageType: 'letter',
          messageRef: 'returns invitation alternate',
          pdf: null,
          personalisation: {
            name: 'Returnsholder',
            periodEndDate: '31 March 2025',
            returnDueDate: formatLongDate(dueDate),
            address_line_1: 'Returnsholder',
            address_line_2: '4',
            address_line_3: 'Privet Drive',
            address_line_4: 'Little Whinging',
            address_line_5: 'Surrey',
            address_line_6: 'WD25 7LR',
            periodStartDate: '1 April 2024'
          },
          recipient: null,
          returnLogIds,
          status: 'pending',
          templateId: NOTIFY_TEMPLATES.alternateInvitations.standard.letter['licence holder']
        },
        { skip: ['createdAt', 'id', 'updatedAt'] }
      )

      // We record this here to allow us to clean up in the afterEach()
      notificationId = result.notifications[0].id
    })
  })

  describe('when called for a renewal invitation', () => {
    let expiryDate
    let renewalDate

    beforeEach(() => {
      expiryDate = new Date('2026-04-28')
      renewalDate = new Date('2026-01-28')

      notice = NoticesFixture.renewalInvitation()

      recipient = RecipientsFixture.renewalInvitationLicenceHolder()
      recipient.licence_refs = notice.licences

      licenceRefs = notice.licences

      Sinon.stub(FetchAlternateRenewalRecipientsService, 'go').resolves([recipient])
    })

    it('creates and then returns the alternate notice and associated notifications ready for sending', async () => {
      const result = await CreateAlternateNoticeService.go(notice, licenceRefs, { expiryDate, renewalDate })

      expect(result.notice).to.equal(
        {
          issuer: notice.issuer,
          licences: notice.licences,
          metadata: {
            error: 0,
            expiryDate: '2026-04-28',
            name: 'Renewals: invitation',
            options: { excludedLicences: [] },
            recipients: 1,
            renewalDate: '2026-01-28'
          },
          overallStatus: 'pending',
          status: 'completed',
          statusCounts: { cancelled: 0, error: 0, pending: 1, sent: 0 },
          subtype: 'renewalInvitation',
          triggerNoticeId: notice.id,
          type: 'notification'
        },
        { skip: ['createdAt', 'id', 'referenceCode', 'updatedAt'] }
      )

      expect(result.notifications).to.have.length(1)
      expect(result.notifications[0]).to.equal(
        {
          contactType: 'licence holder',
          dueDate: null,
          eventId: result.notice.id,
          licences: recipient.licence_refs,
          licenceMonitoringStationId: null,
          messageType: 'letter',
          messageRef: 'renewal invitation',
          pdf: null,
          personalisation: {
            address_line_1: 'Renewal licence holder',
            address_line_2: '4',
            address_line_3: 'Privet Drive',
            address_line_4: 'Little Whinging',
            address_line_5: 'Surrey',
            address_line_6: 'WD25 7LR',
            expiryDate: '28 April 2026',
            licenceRef: notice.licences[0],
            name: 'Renewal licence holder',
            renewalDate: '28 January 2026'
          },
          recipient: null,
          returnLogIds: null,
          status: 'pending',
          templateId: NOTIFY_TEMPLATES.renewalInvitations.standard.letter['single licence']
        },
        { skip: ['createdAt', 'id', 'updatedAt'] }
      )

      // We record this here to allow us to clean up in the afterEach()
      notificationId = result.notifications[0].id
    })
  })
})
