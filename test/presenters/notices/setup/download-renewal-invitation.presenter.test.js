'use strict'

// Test helpers
const NoticeSessionFixture = require('../../../support/fixtures/notice-session.fixture.js')
const RecipientsFixture = require('../../../support/fixtures/recipients.fixture.js')
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')
const { addressToCSV } = require('../../../../app/presenters/notices/base.presenter.js')
const { transformArrayToCSVRow } = require('../../../../app/lib/transform-to-csv.lib.js')

// Thing under test
const DownloadRenewalInvitationPresenter = require('../../../../app/presenters/notices/setup/download-renewal-invitation.presenter.js')

describe('Notices - Setup - Download Renewal Invitation presenter', () => {
  let recipient
  let session

  beforeEach(() => {
    session = NoticeSessionFixture.adHocRenewalInvitation()
  })

  describe('when the recipient is a "licence holder"', () => {
    beforeEach(() => {
      recipient = RecipientsFixture.renewalInvitationLicenceHolder()
    })

    it('correctly formats the data to a csv string', () => {
      const result = DownloadRenewalInvitationPresenter.go([recipient], session)

      const recipientRow = _transformRecipientToRow(recipient, session)
      const expected =
        // Headers
        'Licence,Renewal date,Expiry date,Notification type,Message type,Contact type,Email,Address line 1,Address line 2,Address line 3,Address line 4,Address line 5,Address line 6,Address line 7\n' +
        recipientRow

      expect(result).toEqual(expected)
    })
  })

  describe('when the recipient is a "primary user"', () => {
    beforeEach(() => {
      recipient = RecipientsFixture.renewalInvitationPrimaryUser()
    })

    it('correctly formats the data to a csv string', () => {
      const result = DownloadRenewalInvitationPresenter.go([recipient], session)

      const recipientRow = _transformRecipientToRow(recipient, session)
      const expected =
        // Headers
        'Licence,Renewal date,Expiry date,Notification type,Message type,Contact type,Email,Address line 1,Address line 2,Address line 3,Address line 4,Address line 5,Address line 6,Address line 7\n' +
        recipientRow

      expect(result).toEqual(expected)
    })
  })

  describe('when the recipient has multiple licences', () => {
    beforeEach(() => {
      recipient = RecipientsFixture.renewalInvitationPrimaryUser()
      recipient.licence_refs = [generateLicenceRef(), generateLicenceRef()]
    })

    it('joins the licence refs with a comma', () => {
      const result = DownloadRenewalInvitationPresenter.go([recipient], session)

      const recipientRow = _transformRecipientToRow(recipient, session)
      const expected =
        // Headers
        'Licence,Renewal date,Expiry date,Notification type,Message type,Contact type,Email,Address line 1,Address line 2,Address line 3,Address line 4,Address line 5,Address line 6,Address line 7\n' +
        recipientRow

      expect(result).toEqual(expected)
    })
  })
})

function _transformRecipientToRow(recipient, session) {
  const { contact } = recipient
  const { expiryDate, notificationType, renewalDate } = session

  const row = [
    recipient.licence_refs.join(', '),
    new Date(renewalDate),
    new Date(expiryDate),
    notificationType,
    recipient.message_type,
    recipient.contact_type,
    recipient.email || '',
    ...addressToCSV(contact)
  ]

  return transformArrayToCSVRow(row)
}
