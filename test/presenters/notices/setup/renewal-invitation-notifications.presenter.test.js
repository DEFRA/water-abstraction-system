// Test helpers
import * as RecipientsFixture from '../../../support/fixtures/recipients.fixture.js'
import { NOTIFY_TEMPLATES } from '../../../../app/lib/notify-templates.lib.js'
import LicenceHelper from '../../../support/helpers/licence.helper.js'

// Thing under test
import RenewalInvitationNotificationsPresenter from '../../../../app/presenters/notices/setup/renewal-invitation-notice-notifications.presenter.js'

describe('Notices - Setup - Renewal Invitation Notifications presenter', () => {
  const noticeId = 'c1cae668-3dad-4806-94e2-eb3f27222ed9'

  let recipients
  let noticeData

  beforeEach(() => {
    recipients = [RecipientsFixture.renewalInvitationPrimaryUser(), RecipientsFixture.renewalInvitationLicenceHolder()]

    noticeData = {
      expiryDate: new Date('2022-01-01'),
      journey: 'standard',
      noticeType: 'renewalInvitations',
      renewalDate: new Date('2021-11-03')
    }
  })

  it('correctly presents the data', () => {
    const result = RenewalInvitationNotificationsPresenter(noticeData, recipients, noticeId)

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
        it('returns the correct "messageRef"', () => {
          const result = RenewalInvitationNotificationsPresenter(noticeData, recipients, noticeId)

          expect(result[0].messageRef).toEqual('renewal invitation')
        })
      })

      describe('when the notification is a letter', () => {
        it('returns the correct "messageRef"', () => {
          const result = RenewalInvitationNotificationsPresenter(noticeData, recipients, noticeId)

          expect(result[1].messageRef).toEqual('renewal invitation')
        })
      })
    })

    describe('when the journey is "adhoc"', () => {
      beforeEach(() => {
        noticeData.journey = 'adhoc'
      })

      describe('and the notification is an email', () => {
        it('returns the correct "messageRef"', () => {
          const result = RenewalInvitationNotificationsPresenter(noticeData, recipients, noticeId)

          expect(result[0].messageRef).toEqual('renewal invitation ad-hoc')
        })
      })

      describe('when the notification is a letter', () => {
        it('returns the correct "messageRef"', () => {
          const result = RenewalInvitationNotificationsPresenter(noticeData, recipients, noticeId)

          expect(result[1].messageRef).toEqual('renewal invitation ad-hoc')
        })
      })
    })
  })

  describe('the "personalisation" property', () => {
    describe('when the notification is an email', () => {
      describe('and there are multiple licence refs', () => {
        beforeEach(() => {
          recipients[0].licence_refs.push(LicenceHelper.generateLicenceRef())
        })

        it('returns the expected "personalisation"', () => {
          const result = RenewalInvitationNotificationsPresenter(noticeData, recipients, noticeId)

          expect(result[0].personalisation).toEqual({
            expiryDate: '1 January 2022',
            licenceRefs: recipients[0].licence_refs.join(', '),
            renewalDate: '3 November 2021'
          })
        })
      })

      describe('and there is only one licence ref', () => {
        it('returns the expected "personalisation"', () => {
          const result = RenewalInvitationNotificationsPresenter(noticeData, recipients, noticeId)

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
          recipients[1].licence_refs.push(LicenceHelper.generateLicenceRef())
        })

        it('returns the expected "personalisation"', () => {
          const result = RenewalInvitationNotificationsPresenter(noticeData, recipients, noticeId)

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
          const result = RenewalInvitationNotificationsPresenter(noticeData, recipients, noticeId)

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
          recipients[0].licence_refs.push(LicenceHelper.generateLicenceRef())
        })

        it('returns the expected "templateId"', () => {
          const result = RenewalInvitationNotificationsPresenter(noticeData, recipients, noticeId)

          expect(result[0].templateId).toEqual(NOTIFY_TEMPLATES.renewalInvitations.standard.email['multiple licences'])
        })
      })

      describe('and there is only one licence ref', () => {
        it('returns the expected "templateId"', () => {
          const result = RenewalInvitationNotificationsPresenter(noticeData, recipients, noticeId)

          expect(result[0].templateId).toEqual(NOTIFY_TEMPLATES.renewalInvitations.standard.email['single licence'])
        })
      })
    })

    describe('when the notification is a letter', () => {
      describe('and there are multiple licence refs', () => {
        beforeEach(() => {
          recipients[1].licence_refs.push(LicenceHelper.generateLicenceRef())
        })

        it('returns the expected "templateId"', () => {
          const result = RenewalInvitationNotificationsPresenter(noticeData, recipients, noticeId)

          expect(result[1].templateId).toEqual(NOTIFY_TEMPLATES.renewalInvitations.standard.letter['multiple licences'])
        })
      })

      describe('and there is only one licence ref', () => {
        it('returns the expected "templateId"', () => {
          const result = RenewalInvitationNotificationsPresenter(noticeData, recipients, noticeId)

          expect(result[1].templateId).toEqual(NOTIFY_TEMPLATES.renewalInvitations.standard.letter['single licence'])
        })
      })
    })

    describe('when the journey is "adhoc"', () => {
      beforeEach(() => {
        noticeData.journey = 'adhoc'
      })

      describe('when the notification is an email', () => {
        it('returns the expected "templateId"', () => {
          const result = RenewalInvitationNotificationsPresenter(noticeData, recipients, noticeId)

          expect(result[0].templateId).toEqual(NOTIFY_TEMPLATES.renewalInvitations.adhoc.email['single licence'])
        })
      })

      describe('when the notification is a letter', () => {
        it('returns the expected "templateId"', () => {
          const result = RenewalInvitationNotificationsPresenter(noticeData, recipients, noticeId)

          expect(result[1].templateId).toEqual(NOTIFY_TEMPLATES.renewalInvitations.adhoc.letter['single licence'])
        })
      })
    })
  })
})
