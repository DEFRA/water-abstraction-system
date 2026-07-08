// Test helpers
import * as RecipientsFixture from '../../../support/fixtures/recipients.fixture.js'
import { NOTIFY_TEMPLATES } from '../../../../app/lib/notify-templates.lib.js'
import { formatLongDate } from '../../../../app/presenters/base.presenter.js'
import { futureDueDate } from '../../../../app/presenters/notices/base.presenter.js'
import { generateUUID } from '../../../../app/lib/general.lib.js'

// Thing under test
import ReturnsNoticeNotificationsPresenter from '../../../../app/presenters/notices/setup/returns-notice-notifications.presenter.js'

describe('Notices - Setup - Returns Notice Notifications presenter', () => {
  let noticeId
  let determinedReturnsPeriod
  let dynamicEmailDueDate
  let dynamicLetterDueDate
  let recipients
  let session

  beforeEach(() => {
    noticeId = generateUUID()

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
    const result = ReturnsNoticeNotificationsPresenter(session, recipients, noticeId)

    expect(result).toEqual([
      {
        contactType: recipients[0].contact_type,
        dueDate: dynamicEmailDueDate,
        eventId: noticeId,
        licences: recipients[0].licence_refs,
        messageRef: 'returns invitation',
        messageType: 'email',
        personalisation: {
          licenceNumber: recipients[0].licence_refs[0],
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
          licenceNumber: recipients[1].licence_refs[0],
          periodEndDate: '31 March 2025',
          periodStartDate: '1 January 2025',
          returnDueDate: formatLongDate(dynamicEmailDueDate)
        },
        recipient: recipients[1].email,
        returnLogIds: recipients[1].return_log_ids,
        status: 'pending',
        templateId: NOTIFY_TEMPLATES.invitations.standard.email['returns user']
      },
      {
        contactType: recipients[2].contact_type,
        dueDate: dynamicLetterDueDate,
        eventId: noticeId,
        licences: recipients[2].licence_refs,
        messageRef: 'returns invitation',
        messageType: 'letter',
        personalisation: {
          address_line_1: 'Returnsholder',
          address_line_2: '4',
          address_line_3: 'Privet Drive',
          address_line_4: 'Little Whinging',
          address_line_5: 'Surrey',
          address_line_6: 'WD25 7LR',
          licenceNumber: recipients[2].licence_refs[0],
          name: 'Returnsholder',
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
          address_line_1: 'Returnsto',
          address_line_2: '4',
          address_line_3: 'Privet Drive',
          address_line_4: 'Little Whinging',
          address_line_5: 'Surrey',
          address_line_6: 'WD25 7LR',
          licenceNumber: recipients[3].licence_refs[0],
          name: 'Returnsto',
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
          licenceNumber: recipients[4].licence_refs[0],
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
          licenceNumber: recipients[5].licence_refs[0],
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
            const result = ReturnsNoticeNotificationsPresenter(session, recipients, noticeId)

            expect(result[0].messageRef).toEqual('returns invitation')
          })
        })

        describe('and the recipient is a "returns user"', () => {
          it('returns the correct "messageRef"', () => {
            const result = ReturnsNoticeNotificationsPresenter(session, recipients, noticeId)

            expect(result[1].messageRef).toEqual('returns invitation')
          })
        })

        describe('and the recipient is a "single use"', () => {
          it('returns the correct "messageRef"', () => {
            const result = ReturnsNoticeNotificationsPresenter(session, recipients, noticeId)

            expect(result[4].messageRef).toEqual('returns invitation')
          })
        })
      })

      describe('when the notifications is a letter', () => {
        describe('and the recipient is the "licence holder"', () => {
          it('returns the correct "messageRef"', () => {
            const result = ReturnsNoticeNotificationsPresenter(session, recipients, noticeId)

            expect(result[2].messageRef).toEqual('returns invitation')
          })
        })

        describe('and the recipient is a "returns to"', () => {
          it('returns the correct "messageRef"', () => {
            const result = ReturnsNoticeNotificationsPresenter(session, recipients, noticeId)

            expect(result[3].messageRef).toEqual('returns invitation')
          })
        })

        describe('and the recipient is a "single use"', () => {
          it('returns the correct "messageRef"', () => {
            const result = ReturnsNoticeNotificationsPresenter(session, recipients, noticeId)

            expect(result[5].messageRef).toEqual('returns invitation')
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
            const result = ReturnsNoticeNotificationsPresenter(session, recipients, noticeId)

            expect(result[0].messageRef).toEqual('returns reminder')
          })
        })

        describe('and the recipient is a "returns user"', () => {
          it('returns the correct "messageRef"', () => {
            const result = ReturnsNoticeNotificationsPresenter(session, recipients, noticeId)

            expect(result[1].messageRef).toEqual('returns reminder')
          })
        })

        describe('and the recipient is a "single use"', () => {
          it('returns the correct "messageRef"', () => {
            const result = ReturnsNoticeNotificationsPresenter(session, recipients, noticeId)

            expect(result[4].messageRef).toEqual('returns reminder')
          })
        })
      })

      describe('when the notifications is a letter', () => {
        describe('and the recipient is the "licence holder"', () => {
          it('returns the correct "messageRef"', () => {
            const result = ReturnsNoticeNotificationsPresenter(session, recipients, noticeId)

            expect(result[2].messageRef).toEqual('returns reminder')
          })
        })

        describe('and the recipient is a "returns To"', () => {
          it('returns the correct "messageRef"', () => {
            const result = ReturnsNoticeNotificationsPresenter(session, recipients, noticeId)

            expect(result[3].messageRef).toEqual('returns reminder')
          })
        })

        describe('and the recipient is a "single use"', () => {
          it('returns the correct "messageRef"', () => {
            const result = ReturnsNoticeNotificationsPresenter(session, recipients, noticeId)

            expect(result[5].messageRef).toEqual('returns reminder')
          })
        })
      })
    })
  })

  describe('the "personalisation" property', () => {
    describe('when the notification is an email', () => {
      it('returns the expected "personalisation"', () => {
        const result = ReturnsNoticeNotificationsPresenter(session, recipients, noticeId)

        expect(result[0].personalisation).toEqual({
          licenceNumber: recipients[0].licence_refs[0],
          periodEndDate: '31 March 2025',
          periodStartDate: '1 January 2025',
          returnDueDate: formatLongDate(recipients[0].notificationDueDate)
        })
      })
    })

    describe('when the notification is a letter', () => {
      it('returns the expected "personalisation"', () => {
        const result = ReturnsNoticeNotificationsPresenter(session, recipients, noticeId)

        expect(result[2].personalisation).toEqual({
          address_line_1: 'Returnsholder',
          address_line_2: '4',
          address_line_3: 'Privet Drive',
          address_line_4: 'Little Whinging',
          address_line_5: 'Surrey',
          address_line_6: 'WD25 7LR',
          licenceNumber: recipients[2].licence_refs[0],
          periodEndDate: '31 March 2025',
          periodStartDate: '1 January 2025',
          returnDueDate: formatLongDate(recipients[2].notificationDueDate),
          name: 'Returnsholder'
        })
      })
    })
  })
})
