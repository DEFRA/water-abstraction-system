'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')

// Thing under test
const CreateEventPresenter = require('../../../../app/presenters/notifications/setup/create-event.presenter.js')

describe('Notifications Setup - Event presenter', () => {
  let auth
  let recipients
  let session
  let testRecipients

  beforeEach(async () => {
    recipients = RecipientsFixture.recipients()
    testRecipients = [...Object.values(recipients)]

    session = {
      returnsPeriod: 'quarterFour',
      removeLicences: [],
      journey: 'invitations',
      referenceCode: 'RINV-123',
      determinedReturnsPeriod: {
        dueDate: new Date(`2025-07-28`),
        endDate: new Date(`2025-06-30`),
        startDate: new Date(`2025-04-01`),
        summer: 'true'
      }
    }

    auth = {
      credentials: {
        user: {
          username: 'hello@world.com'
        }
      }
    }
  })

  it('correctly presents the data', () => {
    const result = CreateEventPresenter.go(session, testRecipients, auth)

    const [firstMultiple, secondMultiple] = recipients.licenceHolderWithMultipleLicences.licence_refs.split(',')

    expect(result).to.equal({
      issuer: 'hello@world.com',
      licences:
        `["${recipients.primaryUser.licence_refs}","${recipients.returnsAgent.licence_refs}",` +
        `"${recipients.licenceHolder.licence_refs}","${recipients.returnsTo.licence_refs}",` +
        `"${firstMultiple}","${secondMultiple}"]`,
      metadata: {
        name: 'Returns: invitation',
        options: {
          excludeLicences: []
        },
        recipients: 5,
        returnCycle: {
          dueDate: '2025-07-28',
          endDate: '2025-06-30',
          isSummer: true,
          startDate: '2025-04-01'
        }
      },
      referenceCode: 'RINV-123',
      status: 'completed',
      subtype: 'returnInvitation'
    })
  })

  describe('the "issuer" property', () => {
    it('correctly return the email address from the auth credentials', () => {
      const result = CreateEventPresenter.go(session, testRecipients, auth)

      expect(result.issuer).to.equal('hello@world.com')
    })
  })

  describe('the "licences" property', () => {
    it('correctly return a JSON string containing an array of all licences from all recipients', () => {
      const result = CreateEventPresenter.go(session, testRecipients, auth)

      const [firstMultiple, secondMultiple] = recipients.licenceHolderWithMultipleLicences.licence_refs.split(',')

      expect(result.licences).to.equal(
        `["${recipients.primaryUser.licence_refs}","${recipients.returnsAgent.licence_refs}",` +
          `"${recipients.licenceHolder.licence_refs}","${recipients.returnsTo.licence_refs}",` +
          `"${firstMultiple}","${secondMultiple}"]`
      )
    })
  })

  describe('the "metadata" property', () => {
    describe('the "options.excludeLicences" property', () => {
      describe('when there licences excluded from the recipients list', () => {
        beforeEach(() => {
          session.removeLicences = ['123', '456']
        })

        it('correctly returns the exclude licences', () => {
          const result = CreateEventPresenter.go(session, testRecipients, auth)

          expect(result.metadata.options.excludeLicences).to.equal(['123', '456'])
        })
      })

      describe('when there are no licences excluded from the recipients list', () => {
        beforeEach(() => {
          session.removeLicences = []
        })

        it('correctly returns the exclude licences', () => {
          const result = CreateEventPresenter.go(session, testRecipients, auth)

          expect(result.metadata.options.excludeLicences).to.equal([])
        })
      })
    })

    describe('the "recipients" property', () => {
      beforeEach(() => {
        session.recipients = [...Object.values(recipients)]
      })

      it('correctly returns the length of recipients', () => {
        const result = CreateEventPresenter.go(session, testRecipients, auth)

        expect(result.metadata.recipients).to.equal(5)
      })
    })

    describe('the "returnCycle" property', () => {
      beforeEach(() => {
        session.determinedReturnsPeriod = {
          dueDate: new Date(`2025-07-28`),
          endDate: new Date(`2025-06-30`),
          startDate: new Date(`2025-04-01`),
          summer: 'true'
        }
      })

      it('correctly returns the return cycle', () => {
        const result = CreateEventPresenter.go(session, testRecipients, auth)

        expect(result.metadata.returnCycle).to.equal({
          dueDate: '2025-07-28',
          endDate: '2025-06-30',
          isSummer: true,
          startDate: '2025-04-01'
        })
      })
    })
  })

  describe('when the journey is for "invitations"', () => {
    beforeEach(() => {
      session.journey = 'invitations'
    })

    it('correctly sets the "metadata.name"', () => {
      const result = CreateEventPresenter.go(session, testRecipients, auth)

      expect(result.metadata.name).to.equal('Returns: invitation')
    })

    it('correctly sets the "subtype"', () => {
      const result = CreateEventPresenter.go(session, testRecipients, auth)

      expect(result.subtype).to.equal('returnInvitation')
    })
  })

  describe('when the journey is for "reminders"', () => {
    beforeEach(() => {
      session.journey = 'reminders'
    })

    it('correctly sets the "metadata.name"', () => {
      const result = CreateEventPresenter.go(session, testRecipients, auth)

      expect(result.metadata.name).to.equal('Returns: reminder')
    })

    it('correctly sets the "subtype"', () => {
      const result = CreateEventPresenter.go(session, testRecipients, auth)

      expect(result.subtype).to.equal('returnReminder')
    })
  })

  describe('when the journey is for "ad-hoc"', () => {
    beforeEach(() => {
      session.journey = 'ad-hoc'
    })

    it('correctly sets the "metadata.name"', () => {
      const result = CreateEventPresenter.go(session, testRecipients, auth)

      expect(result.metadata.name).to.equal('Returns: ad-hoc')
    })

    it('correctly sets the "subtype"', () => {
      const result = CreateEventPresenter.go(session, testRecipients, auth)

      expect(result.subtype).to.equal('adHocReminder')
    })
  })

  describe('when the journey is not recognised', () => {
    beforeEach(() => {
      session.journey = ''
    })

    it('correctly sets the "metadata.name"', () => {
      const result = CreateEventPresenter.go(session, testRecipients, auth)

      expect(result.metadata.name).to.equal('')
    })

    it('correctly sets the "subtype"', () => {
      const result = CreateEventPresenter.go(session, testRecipients, auth)

      expect(result.subtype).to.equal('')
    })
  })
})
