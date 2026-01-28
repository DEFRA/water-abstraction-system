'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../../support/fixtures/recipients.fixtures.js')
const { futureDueDate } = require('../../../../app/presenters/notices/base.presenter.js')
const { NOTIFY_TEMPLATES } = require('../../../../app/lib/notify-templates.lib.js')
const { formatLongDate } = require('../../../../app/presenters/base.presenter.js')

// Thing under test
const ReturnsNoticeNotificationsPresenter = require('../../../../app/presenters/notices/setup/returns-notice-notifications.presenter.js')

describe('Notices - Setup - Returns Notice Notifications presenter', () => {
  const noticeId = 'c1cae668-3dad-4806-94e2-eb3f27222ed9'

  let determinedReturnsPeriod
  let dynamicEmailDueDate
  let dynamicLetterDueDate
  let recipients
  let session

  beforeEach(() => {
    dynamicEmailDueDate = futureDueDate()
    dynamicLetterDueDate = futureDueDate('letter')

    determinedReturnsPeriod = {
      dueDate: null,
      endDate: new Date('2025-03-31'),
      name: 'quarterFour',
      startDate: new Date('2025-01-01'),
      summer: 'false'
    }

    recipients = [
      RecipientsFixture.returnsNoticePrimaryUser(),
      RecipientsFixture.returnsNoticeReturnsAgent(),
      RecipientsFixture.returnsNoticeLicenceHolder(),
      RecipientsFixture.returnsNoticeReturnsTo(),
      RecipientsFixture.additionalEmailRecipient(),
      RecipientsFixture.additionalPostalRecipient()
    ]

    session = {
      determinedReturnsPeriod,
      journey: 'standard',
      noticeType: 'invitations'
    }
  })

  it('correctly presents the data', () => {
    const result = ReturnsNoticeNotificationsPresenter.go(session, recipients, noticeId)

    expect(result).to.equal([
      {
        contactType: recipients[0].contact_type,
        dueDate: dynamicEmailDueDate,
        eventId: noticeId,
        licences: recipients[0].licence_refs,
        messageRef: 'returns invitation',
        messageType: 'email',
        personalisation: {
          periodEndDate: '31 March 2025',
          periodStartDate: '1 January 2025',
          returnDueDate: formatLongDate(dynamicEmailDueDate)
        },
        recipient: recipients[0].email,
        returnLogIds: recipients[0].return_log_ids,
        status: 'pending',
        templateId: NOTIFY_TEMPLATES.invitations.standard.email['primary user']
      },
      {
        contactType: recipients[1].contact_type,
        dueDate: dynamicEmailDueDate,
        eventId: noticeId,
        licences: recipients[1].licence_refs,
        messageRef: 'returns invitation',
        messageType: 'email',
        personalisation: {
          periodEndDate: '31 March 2025',
          periodStartDate: '1 January 2025',
          returnDueDate: formatLongDate(dynamicEmailDueDate)
        },
        recipient: recipients[1].email,
        returnLogIds: recipients[1].return_log_ids,
        status: 'pending',
        templateId: NOTIFY_TEMPLATES.invitations.standard.email['returns agent']
      },
      {
        contactType: recipients[2].contact_type,
        dueDate: dynamicLetterDueDate,
        eventId: noticeId,
        licences: recipients[2].licence_refs,
        messageRef: 'returns invitation',
        messageType: 'letter',
        personalisation: {
          address_line_1: 'J Returnsholder',
          address_line_2: '4',
          address_line_3: 'Privet Drive',
          address_line_4: 'Little Whinging',
          address_line_5: 'Surrey',
          address_line_6: 'WD25 7LR',
          name: 'J Returnsholder',
          periodEndDate: '31 March 2025',
          periodStartDate: '1 January 2025',
          returnDueDate: formatLongDate(dynamicLetterDueDate)
        },
        returnLogIds: recipients[2].return_log_ids,
        status: 'pending',
        templateId: NOTIFY_TEMPLATES.invitations.standard.letter['licence holder']
      },
      {
        contactType: recipients[3].contact_type,
        dueDate: dynamicLetterDueDate,
        eventId: noticeId,
        licences: recipients[3].licence_refs,
        messageRef: 'returns invitation',
        messageType: 'letter',
        personalisation: {
          address_line_1: 'J Returnsto',
          address_line_2: '4',
          address_line_3: 'Privet Drive',
          address_line_4: 'Little Whinging',
          address_line_5: 'Surrey',
          address_line_6: 'WD25 7LR',
          name: 'J Returnsto',
          periodEndDate: '31 March 2025',
          periodStartDate: '1 January 2025',
          returnDueDate: formatLongDate(dynamicLetterDueDate)
        },
        returnLogIds: recipients[3].return_log_ids,
        status: 'pending',
        templateId: NOTIFY_TEMPLATES.invitations.standard.letter['returns to']
      },
      {
        contactType: 'single use',
        dueDate: dynamicEmailDueDate,
        eventId: noticeId,
        licences: recipients[4].licence_refs,
        messageRef: 'returns invitation',
        messageType: 'email',
        personalisation: {
          periodEndDate: '31 March 2025',
          periodStartDate: '1 January 2025',
          returnDueDate: formatLongDate(dynamicEmailDueDate)
        },
        recipient: recipients[4].email,
        returnLogIds: recipients[4].return_log_ids,
        status: 'pending',
        templateId: NOTIFY_TEMPLATES.invitations.standard.email['single use']
      },
      {
        contactType: 'single use',
        dueDate: dynamicLetterDueDate,
        eventId: noticeId,
        licences: recipients[5].licence_refs,
        messageRef: 'returns invitation',
        messageType: 'letter',
        personalisation: {
          address_line_1: 'Additional',
          address_line_2: '4',
          address_line_3: 'Privet Drive',
          address_line_4: 'Little Whinging',
          address_line_5: 'Surrey',
          address_line_6: 'WD25 7LR',
          name: 'Additional',
          periodEndDate: '31 March 2025',
          periodStartDate: '1 January 2025',
          returnDueDate: formatLongDate(dynamicLetterDueDate)
        },
        returnLogIds: recipients[5].return_log_ids,
        status: 'pending',
        templateId: NOTIFY_TEMPLATES.invitations.standard.letter['single use']
      }
    ])
  })

  describe('the "messageRef" property', () => {
    describe('when the notice is a "returns invitation"', () => {
      describe('and the notification is an email', () => {
        describe('and the recipient is the "primary user"', () => {
          it('returns the correct "messageRef"', () => {
            const result = ReturnsNoticeNotificationsPresenter.go(session, recipients, noticeId)

            expect(result[0].messageRef).to.equal('returns invitation')
          })
        })

        describe('and the recipient is a "returns agent"', () => {
          it('returns the correct "messageRef"', () => {
            const result = ReturnsNoticeNotificationsPresenter.go(session, recipients, noticeId)

            expect(result[1].messageRef).to.equal('returns invitation')
          })
        })

        describe('and the recipient is a "single use"', () => {
          it('returns the correct "messageRef"', () => {
            const result = ReturnsNoticeNotificationsPresenter.go(session, recipients, noticeId)

            expect(result[4].messageRef).to.equal('returns invitation')
          })
        })
      })

      describe('when the notifications is a letter', () => {
        describe('and the recipient is the "licence holder"', () => {
          it('returns the correct "messageRef"', () => {
            const result = ReturnsNoticeNotificationsPresenter.go(session, recipients, noticeId)

            expect(result[2].messageRef).to.equal('returns invitation')
          })
        })

        describe('and the recipient is a "returns to"', () => {
          it('returns the correct "messageRef"', () => {
            const result = ReturnsNoticeNotificationsPresenter.go(session, recipients, noticeId)

            expect(result[3].messageRef).to.equal('returns invitation')
          })
        })

        describe('and the recipient is a "single use"', () => {
          it('returns the correct "messageRef"', () => {
            const result = ReturnsNoticeNotificationsPresenter.go(session, recipients, noticeId)

            expect(result[5].messageRef).to.equal('returns invitation')
          })
        })
      })
    })

    describe('when the notice is a "returns reminder"', () => {
      beforeEach(() => {
        session.noticeType = 'reminders'
      })

      describe('and the notification is an email', () => {
        describe('and the recipient is the "primary user"', () => {
          it('returns the correct "messageRef"', () => {
            const result = ReturnsNoticeNotificationsPresenter.go(session, recipients, noticeId)

            expect(result[0].messageRef).to.equal('returns reminder')
          })
        })

        describe('and the recipient is a "returns agent"', () => {
          it('returns the correct "messageRef"', () => {
            const result = ReturnsNoticeNotificationsPresenter.go(session, recipients, noticeId)

            expect(result[1].messageRef).to.equal('returns reminder')
          })
        })

        describe('and the recipient is a "single use"', () => {
          it('returns the correct "messageRef"', () => {
            const result = ReturnsNoticeNotificationsPresenter.go(session, recipients, noticeId)

            expect(result[4].messageRef).to.equal('returns reminder')
          })
        })
      })

      describe('when the notifications is a letter', () => {
        describe('and the recipient is the "licence holder"', () => {
          it('returns the correct "messageRef"', () => {
            const result = ReturnsNoticeNotificationsPresenter.go(session, recipients, noticeId)

            expect(result[2].messageRef).to.equal('returns reminder')
          })
        })

        describe('and the recipient is a "returns To"', () => {
          it('returns the correct "messageRef"', () => {
            const result = ReturnsNoticeNotificationsPresenter.go(session, recipients, noticeId)

            expect(result[3].messageRef).to.equal('returns reminder')
          })
        })

        describe('and the recipient is a "single use"', () => {
          it('returns the correct "messageRef"', () => {
            const result = ReturnsNoticeNotificationsPresenter.go(session, recipients, noticeId)

            expect(result[5].messageRef).to.equal('returns reminder')
          })
        })
      })
    })
  })

  describe('the "personalisation" property', () => {
    describe('when the notification is an email', () => {
      it('returns the expected "personalisation"', () => {
        const result = ReturnsNoticeNotificationsPresenter.go(session, recipients, noticeId)

        expect(result[0].personalisation).to.equal({
          periodEndDate: '31 March 2025',
          periodStartDate: '1 January 2025',
          returnDueDate: formatLongDate(recipients[0].notificationDueDate)
        })
      })
    })

    describe('when the notification is a letter', () => {
      it('returns the expected "personalisation"', () => {
        const result = ReturnsNoticeNotificationsPresenter.go(session, recipients, noticeId)

        expect(result[2].personalisation).to.equal({
          address_line_1: 'J Returnsholder',
          address_line_2: '4',
          address_line_3: 'Privet Drive',
          address_line_4: 'Little Whinging',
          address_line_5: 'Surrey',
          address_line_6: 'WD25 7LR',
          periodEndDate: '31 March 2025',
          periodStartDate: '1 January 2025',
          returnDueDate: formatLongDate(recipients[2].notificationDueDate),
          name: 'J Returnsholder'
        })
      })
    })
  })
})
