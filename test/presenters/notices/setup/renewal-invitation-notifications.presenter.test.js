'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../../support/fixtures/recipients.fixture.js')
const { NOTIFY_TEMPLATES } = require('../../../../app/lib/notify-templates.lib.js')

// Thing under test
const ReturnsInvitationNotificationsPresenter = require('../../../../app/presenters/notices/setup/renewal-invitation-notice-notifications.presenter.js')

describe('Notices - Setup - Returns Notice Notifications presenter', () => {
  const noticeId = 'c1cae668-3dad-4806-94e2-eb3f27222ed9'

  let recipients
  let noticeData

  beforeEach(() => {
    recipients = [RecipientsFixture.returnsNoticePrimaryUser(), RecipientsFixture.returnsNoticeLicenceHolder()]

    noticeData = {
      expiryDate: new Date('2022-01-01'),
      journey: 'standard',
      noticeType: 'renewalInvitations',
      renewalDate: new Date('2021-11-03')
    }
  })

  it('correctly presents the data', () => {
    const result = ReturnsInvitationNotificationsPresenter.go(noticeData, recipients, noticeId)

    expect(result).to.equal([
      {
        contactType: recipients[0].contact_type,
        eventId: noticeId,
        licences: recipients[0].licence_refs,
        messageRef: 'renewal invitation',
        messageType: 'email',
        personalisation: {
          expiryDate: '1 January 2022',
          licenceRef: recipients[0].licence_refs[0],
          renewalDate: '3 November 2021'
        },
        recipient: recipients[0].email,
        status: 'pending',
        templateId: NOTIFY_TEMPLATES.renewalInvitations.standard.email['single licence']
      },
      {
        contactType: recipients[1].contact_type,
        eventId: noticeId,
        licences: recipients[1].licence_refs,
        messageRef: 'renewal invitation',
        messageType: 'letter',
        personalisation: {
          address_line_1: 'Returnsholder',
          address_line_2: '4',
          address_line_3: 'Privet Drive',
          address_line_4: 'Little Whinging',
          address_line_5: 'Surrey',
          address_line_6: 'WD25 7LR',
          name: 'Returnsholder',
          expiryDate: '1 January 2022',
          licenceRef: recipients[1].licence_refs[0],
          renewalDate: '3 November 2021'
        },
        status: 'pending',
        templateId: NOTIFY_TEMPLATES.renewalInvitations.standard.letter['single licence']
      }
    ])
  })
})
