'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const NoticeSessionFixture = require('../../../fixtures/notice-session.fixture.js')
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')
const { addressToCSV } = require('../../../../app/presenters/notices/base.presenter.js')
const { transformArrayToCSVRow } = require('../../../../app/lib/transform-to-csv.lib.js')

// Thing under test
const DownloadReturnsNoticePresenter = require('../../../../app/presenters/notices/setup/download-returns-notice.presenter.js')

describe('Notices - Setup - Download Returns Notice presenter', () => {
  let recipient
  let session

  describe('when the notice type is "paper returns"', () => {
    beforeEach(() => {
      session = NoticeSessionFixture.paperReturn()
    })

    describe('and the recipient is a "licence holder"', () => {
      beforeEach(() => {
        recipient = RecipientsFixture.returnsNoticeLicenceHolder(true)
      })

      it('correctly formats the data to a csv string', () => {
        const result = DownloadReturnsNoticePresenter.go([recipient], session)

        const recipientRow = _transformRecipientToRow(recipient, session.notificationType)

        expect(result).to.equal(
          // Headers
          'Licence,Return reference,Return start date,Return end date,Return due date,Notification type,Message type,Contact type,Email,Address line 1,Address line 2,Address line 3,Address line 4,Address line 5,Address line 6,Address line 7\n' +
            recipientRow
        )
      })
    })

    describe('and the recipient is a "returns to"', () => {
      beforeEach(() => {
        recipient = RecipientsFixture.returnsNoticeReturnsTo(true)
      })

      it('correctly formats the data to a csv string', () => {
        const result = DownloadReturnsNoticePresenter.go([recipient], session)

        const recipientRow = _transformRecipientToRow(recipient, session.notificationType)

        expect(result).to.equal(
          // Headers
          'Licence,Return reference,Return start date,Return end date,Return due date,Notification type,Message type,Contact type,Email,Address line 1,Address line 2,Address line 3,Address line 4,Address line 5,Address line 6,Address line 7\n' +
            recipientRow
        )
      })
    })

    describe('and the recipient is a "primary user"', () => {
      beforeEach(() => {
        recipient = RecipientsFixture.returnsNoticePrimaryUser(true)
      })

      it('correctly formats the data to a csv string', () => {
        const result = DownloadReturnsNoticePresenter.go([recipient], session)

        const recipientRow = _transformRecipientToRow(recipient, session.notificationType)

        expect(result).to.equal(
          // Headers
          'Licence,Return reference,Return start date,Return end date,Return due date,Notification type,Message type,Contact type,Email,Address line 1,Address line 2,Address line 3,Address line 4,Address line 5,Address line 6,Address line 7\n' +
            recipientRow
        )
      })
    })

    describe('and the recipient is a "returns agent"', () => {
      beforeEach(() => {
        recipient = RecipientsFixture.returnsNoticeReturnsAgent(true)
      })

      it('correctly formats the data to a csv string', () => {
        const result = DownloadReturnsNoticePresenter.go([recipient], session)

        const recipientRow = _transformRecipientToRow(recipient, session.notificationType)

        expect(result).to.equal(
          // Headers
          'Licence,Return reference,Return start date,Return end date,Return due date,Notification type,Message type,Contact type,Email,Address line 1,Address line 2,Address line 3,Address line 4,Address line 5,Address line 6,Address line 7\n' +
            recipientRow
        )
      })
    })
  })

  describe('when the notice type is "returns invitation"', () => {
    beforeEach(() => {
      session = NoticeSessionFixture.standardInvitation()
    })

    describe('and the recipient is a "licence holder"', () => {
      beforeEach(() => {
        recipient = RecipientsFixture.returnsNoticeLicenceHolder(true)
      })

      it('correctly formats the data to a csv string', () => {
        const result = DownloadReturnsNoticePresenter.go([recipient], session)

        const recipientRow = _transformRecipientToRow(recipient, session.notificationType)

        expect(result).to.equal(
          // Headers
          'Licence,Return reference,Return start date,Return end date,Return due date,Notification type,Message type,Contact type,Email,Address line 1,Address line 2,Address line 3,Address line 4,Address line 5,Address line 6,Address line 7\n' +
            recipientRow
        )
      })
    })

    describe('and the recipient is a "returns to"', () => {
      beforeEach(() => {
        recipient = RecipientsFixture.returnsNoticeReturnsTo(true)
      })

      it('correctly formats the data to a csv string', () => {
        const result = DownloadReturnsNoticePresenter.go([recipient], session)

        const recipientRow = _transformRecipientToRow(recipient, session.notificationType)

        expect(result).to.equal(
          // Headers
          'Licence,Return reference,Return start date,Return end date,Return due date,Notification type,Message type,Contact type,Email,Address line 1,Address line 2,Address line 3,Address line 4,Address line 5,Address line 6,Address line 7\n' +
            recipientRow
        )
      })
    })

    describe('and the recipient is a "primary user"', () => {
      beforeEach(() => {
        recipient = RecipientsFixture.returnsNoticePrimaryUser(true)
      })

      it('correctly formats the data to a csv string', () => {
        const result = DownloadReturnsNoticePresenter.go([recipient], session)

        const recipientRow = _transformRecipientToRow(recipient, session.notificationType)

        expect(result).to.equal(
          // Headers
          'Licence,Return reference,Return start date,Return end date,Return due date,Notification type,Message type,Contact type,Email,Address line 1,Address line 2,Address line 3,Address line 4,Address line 5,Address line 6,Address line 7\n' +
            recipientRow
        )
      })
    })

    describe('and the recipient is a "returns agent"', () => {
      beforeEach(() => {
        recipient = RecipientsFixture.returnsNoticeReturnsAgent(true)
      })

      it('correctly formats the data to a csv string', () => {
        const result = DownloadReturnsNoticePresenter.go([recipient], session)

        const recipientRow = _transformRecipientToRow(recipient, session.notificationType)

        expect(result).to.equal(
          // Headers
          'Licence,Return reference,Return start date,Return end date,Return due date,Notification type,Message type,Contact type,Email,Address line 1,Address line 2,Address line 3,Address line 4,Address line 5,Address line 6,Address line 7\n' +
            recipientRow
        )
      })
    })
  })

  describe('when the notice type is "returns reminder"', () => {
    beforeEach(() => {
      session = NoticeSessionFixture.standardReminder()
    })

    describe('and the recipient is a "licence holder"', () => {
      beforeEach(() => {
        recipient = RecipientsFixture.returnsNoticeLicenceHolder(true)
      })

      it('correctly formats the data to a csv string', () => {
        const result = DownloadReturnsNoticePresenter.go([recipient], session)

        const recipientRow = _transformRecipientToRow(recipient, session.notificationType)

        expect(result).to.equal(
          // Headers
          'Licence,Return reference,Return start date,Return end date,Return due date,Notification type,Message type,Contact type,Email,Address line 1,Address line 2,Address line 3,Address line 4,Address line 5,Address line 6,Address line 7\n' +
            recipientRow
        )
      })
    })

    describe('and the recipient is a "returns to"', () => {
      beforeEach(() => {
        recipient = RecipientsFixture.returnsNoticeReturnsTo(true)
      })

      it('correctly formats the data to a csv string', () => {
        const result = DownloadReturnsNoticePresenter.go([recipient], session)

        const recipientRow = _transformRecipientToRow(recipient, session.notificationType)

        expect(result).to.equal(
          // Headers
          'Licence,Return reference,Return start date,Return end date,Return due date,Notification type,Message type,Contact type,Email,Address line 1,Address line 2,Address line 3,Address line 4,Address line 5,Address line 6,Address line 7\n' +
            recipientRow
        )
      })
    })

    describe('and the recipient is a "primary user"', () => {
      beforeEach(() => {
        recipient = RecipientsFixture.returnsNoticePrimaryUser(true)
      })

      it('correctly formats the data to a csv string', () => {
        const result = DownloadReturnsNoticePresenter.go([recipient], session)

        const recipientRow = _transformRecipientToRow(recipient, session.notificationType)

        expect(result).to.equal(
          // Headers
          'Licence,Return reference,Return start date,Return end date,Return due date,Notification type,Message type,Contact type,Email,Address line 1,Address line 2,Address line 3,Address line 4,Address line 5,Address line 6,Address line 7\n' +
            recipientRow
        )
      })
    })

    describe('and the recipient is a "returns agent"', () => {
      beforeEach(() => {
        recipient = RecipientsFixture.returnsNoticeReturnsAgent(true)
      })

      it('correctly formats the data to a csv string', () => {
        const result = DownloadReturnsNoticePresenter.go([recipient], session)

        const recipientRow = _transformRecipientToRow(recipient, session.notificationType)

        expect(result).to.equal(
          // Headers
          'Licence,Return reference,Return start date,Return end date,Return due date,Notification type,Message type,Contact type,Email,Address line 1,Address line 2,Address line 3,Address line 4,Address line 5,Address line 6,Address line 7\n' +
            recipientRow
        )
      })
    })
  })
})

function _transformRecipientToRow(recipient, notificationType) {
  const row = [
    recipient.licence_ref,
    recipient.return_reference,
    recipient.start_date,
    recipient.end_date,
    recipient.due_date,
    notificationType,
    recipient.message_type,
    recipient.contact_type,
    recipient.email || '',
    ...addressToCSV(recipient.contact)
  ]

  return transformArrayToCSVRow(row)
}
