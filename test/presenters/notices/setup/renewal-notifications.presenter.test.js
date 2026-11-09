// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import { NOTIFY_TEMPLATES } from 'water-abstraction-engine/lib/notify-templates.lib.js'
import RecipientsFixture from 'water-abstraction-engine/test/fixtures/recipients.fixture.js'
import { generateLicenceRef } from 'water-abstraction-engine/test/generators.js'

// Thing under test
import RenewalNotificationsPresenter from '../../../../src/presenters/notices/setup/renewal-notifications.presenter.js'

describe('Notices - Setup - Renewal Notifications presenter', () => {
  const noticeId = 'c1cae668-3dad-4806-94e2-eb3f27222ed9'

  let recipients
  let noticeData

  beforeEach(() => {
    recipients = [RecipientsFixture.renewalNoticePrimaryUser(), RecipientsFixture.renewalNoticeLicenceHolder()]

    noticeData = {
      expiryDate: new Date('2022-01-01'),
      journey: 'standard',
      noticeType: 'renewalInvitations',
      renewalDate: new Date('2021-11-03')
    }
  })

  it('correctly presents the data', () => {
    const result = RenewalNotificationsPresenter(noticeData, recipients, noticeId)

    expect(result).toEqual([
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
          address_line_1: 'Renewal licence holder',
          address_line_2: '4',
          address_line_3: 'Privet Drive',
          address_line_4: 'Little Whinging',
          address_line_5: 'Surrey',
          address_line_6: 'WD25 7LR',
          name: 'Renewal licence holder',
          expiryDate: '1 January 2022',
          licenceRef: recipients[1].licence_refs[0],
          renewalDate: '3 November 2021'
        },
        status: 'pending',
        templateId: NOTIFY_TEMPLATES.renewalInvitations.standard.letter['single licence']
      }
    ])
  })

  describe('the "messageRef" property', () => {
    describe('when the journey is "standard"', () => {
      describe('and the notification is an email', () => {
        describe('and the notice type is "renewalFinals"', () => {
          beforeEach(() => {
            noticeData.noticeType = 'renewalFinals'
          })

          it('returns the correct "messageRef"', () => {
            const result = RenewalNotificationsPresenter(noticeData, recipients, noticeId)

            expect(result[0].messageRef).toEqual('renewal final')
          })
        })

        describe('and the notice type is "renewalInvitations"', () => {
          it('returns the correct "messageRef"', () => {
            const result = RenewalNotificationsPresenter(noticeData, recipients, noticeId)

            expect(result[0].messageRef).toEqual('renewal invitation')
          })
        })

        describe('and the notice type is "renewalReminders"', () => {
          beforeEach(() => {
            noticeData.noticeType = 'renewalReminders'
          })

          it('returns the correct "messageRef"', () => {
            const result = RenewalNotificationsPresenter(noticeData, recipients, noticeId)

            expect(result[0].messageRef).toEqual('renewal reminder')
          })
        })
      })

      describe('when the notification is a letter', () => {
        describe('and the notice type is "renewalFinals"', () => {
          beforeEach(() => {
            noticeData.noticeType = 'renewalFinals'
          })

          it('returns the correct "messageRef"', () => {
            const result = RenewalNotificationsPresenter(noticeData, recipients, noticeId)

            expect(result[1].messageRef).toEqual('renewal final')
          })
        })

        describe('and the notice type is "renewalInvitations"', () => {
          it('returns the correct "messageRef"', () => {
            const result = RenewalNotificationsPresenter(noticeData, recipients, noticeId)

            expect(result[1].messageRef).toEqual('renewal invitation')
          })
        })

        describe('and the notice type is "renewalReminders"', () => {
          beforeEach(() => {
            noticeData.noticeType = 'renewalReminders'
          })

          it('returns the correct "messageRef"', () => {
            const result = RenewalNotificationsPresenter(noticeData, recipients, noticeId)

            expect(result[1].messageRef).toEqual('renewal reminder')
          })
        })
      })
    })

    describe('when the journey is "adhoc"', () => {
      beforeEach(() => {
        noticeData.journey = 'adhoc'
      })

      describe('and the notification is an email', () => {
        describe('and the notice type is "renewalFinals"', () => {
          beforeEach(() => {
            noticeData.noticeType = 'renewalFinals'
          })

          it('returns the correct "messageRef"', () => {
            const result = RenewalNotificationsPresenter(noticeData, recipients, noticeId)

            expect(result[0].messageRef).toEqual('renewal final ad-hoc')
          })
        })

        describe('and the notice type is "renewalInvitations"', () => {
          it('returns the correct "messageRef"', () => {
            const result = RenewalNotificationsPresenter(noticeData, recipients, noticeId)

            expect(result[0].messageRef).toEqual('renewal invitation ad-hoc')
          })
        })

        describe('and the notice type is "renewalReminders"', () => {
          beforeEach(() => {
            noticeData.noticeType = 'renewalReminders'
          })

          it('returns the correct "messageRef"', () => {
            const result = RenewalNotificationsPresenter(noticeData, recipients, noticeId)

            expect(result[0].messageRef).toEqual('renewal reminder ad-hoc')
          })
        })
      })

      describe('when the notification is a letter', () => {
        describe('and the notice type is "renewalFinals"', () => {
          beforeEach(() => {
            noticeData.noticeType = 'renewalFinals'
          })

          it('returns the correct "messageRef"', () => {
            const result = RenewalNotificationsPresenter(noticeData, recipients, noticeId)

            expect(result[1].messageRef).toEqual('renewal final ad-hoc')
          })
        })

        describe('and the notice type is "renewalInvitations"', () => {
          it('returns the correct "messageRef"', () => {
            const result = RenewalNotificationsPresenter(noticeData, recipients, noticeId)

            expect(result[1].messageRef).toEqual('renewal invitation ad-hoc')
          })
        })

        describe('and the notice type is "renewalReminders"', () => {
          beforeEach(() => {
            noticeData.noticeType = 'renewalReminders'
          })

          it('returns the correct "messageRef"', () => {
            const result = RenewalNotificationsPresenter(noticeData, recipients, noticeId)

            expect(result[1].messageRef).toEqual('renewal reminder ad-hoc')
          })
        })
      })
    })
  })

  describe('the "personalisation" property', () => {
    describe('when the notification is an email', () => {
      describe('and there are multiple licence refs', () => {
        beforeEach(() => {
          recipients[0].licence_refs.push(generateLicenceRef())
        })

        it('returns the expected "personalisation"', () => {
          const result = RenewalNotificationsPresenter(noticeData, recipients, noticeId)

          expect(result[0].personalisation).toEqual({
            expiryDate: '1 January 2022',
            licenceRefs: recipients[0].licence_refs.join(', '),
            renewalDate: '3 November 2021'
          })
        })
      })

      describe('and there is only one licence ref', () => {
        it('returns the expected "personalisation"', () => {
          const result = RenewalNotificationsPresenter(noticeData, recipients, noticeId)

          expect(result[0].personalisation).toEqual({
            expiryDate: '1 January 2022',
            licenceRef: recipients[0].licence_refs[0],
            renewalDate: '3 November 2021'
          })
        })
      })
    })

    describe('when the notification is a letter', () => {
      describe('and there are multiple licence refs', () => {
        beforeEach(() => {
          recipients[1].licence_refs.push(generateLicenceRef())
        })

        it('returns the expected "personalisation"', () => {
          const result = RenewalNotificationsPresenter(noticeData, recipients, noticeId)

          expect(result[1].personalisation).toEqual({
            address_line_1: 'Renewal licence holder',
            address_line_2: '4',
            address_line_3: 'Privet Drive',
            address_line_4: 'Little Whinging',
            address_line_5: 'Surrey',
            address_line_6: 'WD25 7LR',
            expiryDate: '1 January 2022',
            licenceRefs: recipients[1].licence_refs.join(', '),
            name: 'Renewal licence holder',
            renewalDate: '3 November 2021'
          })
        })
      })

      describe('and there is only one licence ref', () => {
        it('returns the expected "personalisation"', () => {
          const result = RenewalNotificationsPresenter(noticeData, recipients, noticeId)

          expect(result[1].personalisation).toEqual({
            address_line_1: 'Renewal licence holder',
            address_line_2: '4',
            address_line_3: 'Privet Drive',
            address_line_4: 'Little Whinging',
            address_line_5: 'Surrey',
            address_line_6: 'WD25 7LR',
            expiryDate: '1 January 2022',
            licenceRef: recipients[1].licence_refs[0],
            name: 'Renewal licence holder',
            renewalDate: '3 November 2021'
          })
        })
      })
    })
  })

  describe('the "templateId" property', () => {
    describe('when the notification is an email', () => {
      describe('and there are multiple licence refs', () => {
        beforeEach(() => {
          recipients[0].licence_refs.push(generateLicenceRef())
        })

        describe('and the notice type is "renewalFinals"', () => {
          beforeEach(() => {
            noticeData.noticeType = 'renewalFinals'
          })

          it('returns the expected "templateId"', () => {
            const result = RenewalNotificationsPresenter(noticeData, recipients, noticeId)

            expect(result[0].templateId).toEqual(NOTIFY_TEMPLATES.renewalFinals.standard.email['multiple licences'])
          })
        })

        describe('and the notice type is "renewalInvitations"', () => {
          it('returns the expected "templateId"', () => {
            const result = RenewalNotificationsPresenter(noticeData, recipients, noticeId)

            expect(result[0].templateId).toEqual(
              NOTIFY_TEMPLATES.renewalInvitations.standard.email['multiple licences']
            )
          })
        })

        describe('and the notice type is "renewalReminders"', () => {
          beforeEach(() => {
            noticeData.noticeType = 'renewalReminders'
          })

          it('returns the expected "templateId"', () => {
            const result = RenewalNotificationsPresenter(noticeData, recipients, noticeId)

            expect(result[0].templateId).toEqual(NOTIFY_TEMPLATES.renewalReminders.standard.email['multiple licences'])
          })
        })
      })

      describe('and there is only one licence ref', () => {
        describe('and the notice type is "renewalFinals"', () => {
          beforeEach(() => {
            noticeData.noticeType = 'renewalFinals'
          })

          it('returns the expected "templateId"', () => {
            const result = RenewalNotificationsPresenter(noticeData, recipients, noticeId)

            expect(result[0].templateId).toEqual(NOTIFY_TEMPLATES.renewalFinals.standard.email['single licence'])
          })
        })

        describe('and the notice type is "renewalInvitations"', () => {
          it('returns the expected "templateId"', () => {
            const result = RenewalNotificationsPresenter(noticeData, recipients, noticeId)

            expect(result[0].templateId).toEqual(NOTIFY_TEMPLATES.renewalInvitations.standard.email['single licence'])
          })
        })

        describe('and the notice type is "renewalReminders"', () => {
          beforeEach(() => {
            noticeData.noticeType = 'renewalReminders'
          })

          it('returns the expected "templateId"', () => {
            const result = RenewalNotificationsPresenter(noticeData, recipients, noticeId)

            expect(result[0].templateId).toEqual(NOTIFY_TEMPLATES.renewalReminders.standard.email['single licence'])
          })
        })
      })
    })

    describe('when the notification is a letter', () => {
      describe('and there are multiple licence refs', () => {
        beforeEach(() => {
          recipients[1].licence_refs.push(generateLicenceRef())
        })

        describe('and the notice type is "renewalFinals"', () => {
          beforeEach(() => {
            noticeData.noticeType = 'renewalFinals'
          })

          it('returns the expected "templateId"', () => {
            const result = RenewalNotificationsPresenter(noticeData, recipients, noticeId)

            expect(result[1].templateId).toEqual(NOTIFY_TEMPLATES.renewalFinals.standard.letter['multiple licences'])
          })
        })

        describe('and the notice type is "renewalInvitations"', () => {
          it('returns the expected "templateId"', () => {
            const result = RenewalNotificationsPresenter(noticeData, recipients, noticeId)

            expect(result[1].templateId).toEqual(
              NOTIFY_TEMPLATES.renewalInvitations.standard.letter['multiple licences']
            )
          })
        })

        describe('and the notice type is "renewalReminders"', () => {
          beforeEach(() => {
            noticeData.noticeType = 'renewalReminders'
          })

          it('returns the expected "templateId"', () => {
            const result = RenewalNotificationsPresenter(noticeData, recipients, noticeId)

            expect(result[1].templateId).toEqual(NOTIFY_TEMPLATES.renewalReminders.standard.letter['multiple licences'])
          })
        })
      })

      describe('and there is only one licence ref', () => {
        describe('and the notice type is "renewalFinals"', () => {
          beforeEach(() => {
            noticeData.noticeType = 'renewalFinals'
          })

          it('returns the expected "templateId"', () => {
            const result = RenewalNotificationsPresenter(noticeData, recipients, noticeId)

            expect(result[1].templateId).toEqual(NOTIFY_TEMPLATES.renewalFinals.standard.letter['single licence'])
          })
        })

        describe('and the notice type is "renewalInvitations"', () => {
          it('returns the expected "templateId"', () => {
            const result = RenewalNotificationsPresenter(noticeData, recipients, noticeId)

            expect(result[1].templateId).toEqual(NOTIFY_TEMPLATES.renewalInvitations.standard.letter['single licence'])
          })
        })

        describe('and the notice type is "renewalReminders"', () => {
          beforeEach(() => {
            noticeData.noticeType = 'renewalReminders'
          })

          it('returns the expected "templateId"', () => {
            const result = RenewalNotificationsPresenter(noticeData, recipients, noticeId)

            expect(result[1].templateId).toEqual(NOTIFY_TEMPLATES.renewalReminders.standard.letter['single licence'])
          })
        })
      })
    })

    describe('when the journey is "adhoc"', () => {
      beforeEach(() => {
        noticeData.journey = 'adhoc'
      })

      describe('when the notification is an email', () => {
        describe('and the notice type is "renewalFinals"', () => {
          beforeEach(() => {
            noticeData.noticeType = 'renewalFinals'
          })

          it('returns the expected "templateId"', () => {
            const result = RenewalNotificationsPresenter(noticeData, recipients, noticeId)

            expect(result[0].templateId).toEqual(NOTIFY_TEMPLATES.renewalFinals.adhoc.email['single licence'])
          })
        })

        describe('and the notice type is "renewalInvitations"', () => {
          it('returns the expected "templateId"', () => {
            const result = RenewalNotificationsPresenter(noticeData, recipients, noticeId)

            expect(result[0].templateId).toEqual(NOTIFY_TEMPLATES.renewalInvitations.adhoc.email['single licence'])
          })
        })

        describe('and the notice type is "renewalReminders"', () => {
          beforeEach(() => {
            noticeData.noticeType = 'renewalReminders'
          })

          it('returns the expected "templateId"', () => {
            const result = RenewalNotificationsPresenter(noticeData, recipients, noticeId)

            expect(result[0].templateId).toEqual(NOTIFY_TEMPLATES.renewalReminders.adhoc.email['single licence'])
          })
        })
      })

      describe('when the notification is a letter', () => {
        describe('and the notice type is "renewalFinals"', () => {
          beforeEach(() => {
            noticeData.noticeType = 'renewalFinals'
          })

          it('returns the expected "templateId"', () => {
            const result = RenewalNotificationsPresenter(noticeData, recipients, noticeId)

            expect(result[1].templateId).toEqual(NOTIFY_TEMPLATES.renewalFinals.adhoc.letter['single licence'])
          })
        })

        describe('and the notice type is "renewalInvitations"', () => {
          it('returns the expected "templateId"', () => {
            const result = RenewalNotificationsPresenter(noticeData, recipients, noticeId)

            expect(result[1].templateId).toEqual(NOTIFY_TEMPLATES.renewalInvitations.adhoc.letter['single licence'])
          })
        })

        describe('and the notice type is "renewalReminders"', () => {
          beforeEach(() => {
            noticeData.noticeType = 'renewalReminders'
          })

          it('returns the expected "templateId"', () => {
            const result = RenewalNotificationsPresenter(noticeData, recipients, noticeId)

            expect(result[1].templateId).toEqual(NOTIFY_TEMPLATES.renewalReminders.adhoc.letter['single licence'])
          })
        })
      })
    })
  })
})
