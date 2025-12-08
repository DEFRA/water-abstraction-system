'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')
const { futureDueDate } = require('../../../../app/presenters/notices/base.presenter.js')
const { NOTIFY_TEMPLATES } = require('../../../../app/lib/notify-templates.lib.js')
const { formatLongDate } = require('../../../../app/presenters/base.presenter.js')

// Things we need to stub
const FeatureFlagsConfig = require('../../../../config/feature-flags.config.js')

// Thing under test
const NotificationsPresenter = require('../../../../app/presenters/notices/setup/notifications.presenter.js')

describe('Notices - Setup - Notifications presenter', () => {
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

    const fixtureData = RecipientsFixture.recipients()
    const singleUseEmail = {
      ...fixtureData.primaryUser,
      contact_hash_id: 'ba3cbb0311b78e79a9aed711cf20a9e8',
      contact_type: 'single use',
      email: 'single.use@important.com'
    }
    const singleUseLetter = {
      ...fixtureData.licenceHolder,
      contact: { ...fixtureData.licenceHolder.contact, addressLine1: '4', name: 'Hermione' },
      contact_hash_id: '2cfae110bb4c6611261169ddc1f26c34',
      contact_type: 'single use'
    }

    recipients = [
      fixtureData.primaryUser,
      fixtureData.returnsAgent,
      fixtureData.licenceHolder,
      fixtureData.returnsTo,
      fixtureData.licenceHolderWithMultipleLicences,
      singleUseEmail,
      singleUseLetter
    ]

    session = {
      determinedReturnsPeriod,
      journey: 'standard',
      noticeType: 'invitations'
    }

    Sinon.stub(FeatureFlagsConfig, 'enableNullDueDate').value(true)
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('correctly presents the data', () => {
    const result = NotificationsPresenter.go(session, recipients, noticeId)

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
        recipient: 'primary.user@important.com',
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
        recipient: 'returns.agent@important.com',
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
          address_line_1: 'Mr H J Potter',
          address_line_2: '1',
          address_line_3: 'Privet Drive',
          address_line_4: 'Little Whinging',
          address_line_5: 'Surrey',
          address_line_6: 'WD25 7LR',
          name: 'Mr H J Potter',
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
          address_line_1: 'Mr H J Weasley',
          address_line_2: 'INVALID ADDRESS - Needs a valid postcode or country outside the UK',
          address_line_3: '2',
          address_line_4: 'Privet Drive',
          address_line_5: 'Little Whinging',
          address_line_6: 'Surrey',
          name: 'Mr H J Weasley',
          periodEndDate: '31 March 2025',
          periodStartDate: '1 January 2025',
          returnDueDate: formatLongDate(dynamicLetterDueDate)
        },
        returnLogIds: recipients[3].return_log_ids,
        status: 'pending',
        templateId: NOTIFY_TEMPLATES.invitations.standard.letter['returns to']
      },
      {
        contactType: recipients[4].contact_type,
        dueDate: dynamicLetterDueDate,
        eventId: noticeId,
        licences: recipients[4].licence_refs,
        messageRef: 'returns invitation',
        messageType: 'letter',
        personalisation: {
          address_line_1: 'Mr H J Potter',
          address_line_2: '3',
          address_line_3: 'Privet Drive',
          address_line_4: 'Little Whinging',
          address_line_5: 'Surrey',
          address_line_6: 'WD25 7LR',
          name: 'Mr H J Potter',
          periodEndDate: '31 March 2025',
          periodStartDate: '1 January 2025',
          returnDueDate: formatLongDate(dynamicLetterDueDate)
        },
        returnLogIds: recipients[4].return_log_ids,
        status: 'pending',
        templateId: NOTIFY_TEMPLATES.invitations.standard.letter['licence holder']
      },
      {
        contactType: 'single use',
        dueDate: dynamicEmailDueDate,
        eventId: noticeId,
        licences: recipients[5].licence_refs,
        messageRef: 'returns invitation',
        messageType: 'email',
        personalisation: {
          periodEndDate: '31 March 2025',
          periodStartDate: '1 January 2025',
          returnDueDate: formatLongDate(dynamicEmailDueDate)
        },
        recipient: 'single.use@important.com',
        returnLogIds: recipients[5].return_log_ids,
        status: 'pending',
        templateId: NOTIFY_TEMPLATES.invitations.standard.email['single use']
      },
      {
        contactType: 'single use',
        dueDate: dynamicLetterDueDate,
        eventId: noticeId,
        licences: recipients[6].licence_refs,
        messageRef: 'returns invitation',
        messageType: 'letter',
        personalisation: {
          address_line_1: 'Mr H J Hermione',
          address_line_2: '4',
          address_line_3: 'Privet Drive',
          address_line_4: 'Little Whinging',
          address_line_5: 'Surrey',
          address_line_6: 'WD25 7LR',
          name: 'Mr H J Hermione',
          periodEndDate: '31 March 2025',
          periodStartDate: '1 January 2025',
          returnDueDate: formatLongDate(dynamicLetterDueDate)
        },
        returnLogIds: recipients[6].return_log_ids,
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
            const result = NotificationsPresenter.go(session, recipients, noticeId)

            expect(result[0].messageRef).to.equal('returns invitation')
          })
        })

        describe('and the recipient is a "returns agent"', () => {
          it('returns the correct "messageRef"', () => {
            const result = NotificationsPresenter.go(session, recipients, noticeId)

            expect(result[1].messageRef).to.equal('returns invitation')
          })
        })

        describe('and the recipient is a "single use"', () => {
          it('returns the correct "messageRef"', () => {
            const result = NotificationsPresenter.go(session, recipients, noticeId)

            expect(result[5].messageRef).to.equal('returns invitation')
          })
        })
      })

      describe('when the notifications is a letter', () => {
        describe('and the recipient is the "licence holder"', () => {
          it('returns the correct "messageRef"', () => {
            const result = NotificationsPresenter.go(session, recipients, noticeId)

            expect(result[2].messageRef).to.equal('returns invitation')
          })
        })

        describe('and the recipient is a "returns to"', () => {
          it('returns the correct "messageRef"', () => {
            const result = NotificationsPresenter.go(session, recipients, noticeId)

            expect(result[3].messageRef).to.equal('returns invitation')
          })
        })

        describe('and the recipient is a "single use"', () => {
          it('returns the correct "messageRef"', () => {
            const result = NotificationsPresenter.go(session, recipients, noticeId)

            expect(result[6].messageRef).to.equal('returns invitation')
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
            const result = NotificationsPresenter.go(session, recipients, noticeId)

            expect(result[0].messageRef).to.equal('returns reminder')
          })
        })

        describe('and the recipient is a "returns agent"', () => {
          it('returns the correct "messageRef"', () => {
            const result = NotificationsPresenter.go(session, recipients, noticeId)

            expect(result[1].messageRef).to.equal('returns reminder')
          })
        })

        describe('and the recipient is a "single use"', () => {
          it('returns the correct "messageRef"', () => {
            const result = NotificationsPresenter.go(session, recipients, noticeId)

            expect(result[5].messageRef).to.equal('returns reminder')
          })
        })
      })

      describe('when the notifications is a letter', () => {
        describe('and the recipient is the "licence holder"', () => {
          it('returns the correct "messageRef"', () => {
            const result = NotificationsPresenter.go(session, recipients, noticeId)

            expect(result[2].messageRef).to.equal('returns reminder')
          })
        })

        describe('and the recipient is a "returns To"', () => {
          it('returns the correct "messageRef"', () => {
            const result = NotificationsPresenter.go(session, recipients, noticeId)

            expect(result[3].messageRef).to.equal('returns reminder')
          })
        })

        describe('and the recipient is a "single use"', () => {
          it('returns the correct "messageRef"', () => {
            const result = NotificationsPresenter.go(session, recipients, noticeId)

            expect(result[6].messageRef).to.equal('returns reminder')
          })
        })
      })
    })
  })

  describe('the "personalisation" property', () => {
    describe('when the notification is an email', () => {
      describe('and the session does not have a latest due date', () => {
        it('returns the expected "personalisation"', () => {
          const result = NotificationsPresenter.go(session, recipients, noticeId)

          expect(result[0].personalisation).to.equal({
            periodEndDate: '31 March 2025',
            periodStartDate: '1 January 2025',
            returnDueDate: formatLongDate(dynamicEmailDueDate)
          })
        })
      })

      describe('and the session has a latest due date', () => {
        beforeEach(() => {
          session.latestDueDate = new Date('2025-04-28')
        })

        it('returns the expected "personalisation"', () => {
          const result = NotificationsPresenter.go(session, recipients, noticeId)

          expect(result[0].personalisation).to.equal({
            periodEndDate: '31 March 2025',
            periodStartDate: '1 January 2025',
            returnDueDate: '28 April 2025'
          })
        })
      })
    })

    describe('when the notification is a letter', () => {
      describe('and the session does not have a latest due date', () => {
        it('returns the expected "personalisation"', () => {
          const result = NotificationsPresenter.go(session, recipients, noticeId)

          expect(result[2].personalisation).to.equal({
            address_line_1: 'Mr H J Potter',
            address_line_2: '1',
            address_line_3: 'Privet Drive',
            address_line_4: 'Little Whinging',
            address_line_5: 'Surrey',
            address_line_6: 'WD25 7LR',
            periodEndDate: '31 March 2025',
            periodStartDate: '1 January 2025',
            returnDueDate: formatLongDate(dynamicLetterDueDate),
            name: 'Mr H J Potter'
          })
        })
      })

      describe('and the session has a latest due date', () => {
        beforeEach(() => {
          session.latestDueDate = new Date('2025-04-28')
        })

        it('returns the expected "personalisation"', () => {
          const result = NotificationsPresenter.go(session, recipients, noticeId)

          expect(result[2].personalisation).to.equal({
            address_line_1: 'Mr H J Potter',
            address_line_2: '1',
            address_line_3: 'Privet Drive',
            address_line_4: 'Little Whinging',
            address_line_5: 'Surrey',
            address_line_6: 'WD25 7LR',
            periodEndDate: '31 March 2025',
            periodStartDate: '1 January 2025',
            returnDueDate: '28 April 2025',
            name: 'Mr H J Potter'
          })
        })
      })
    })
  })
})
