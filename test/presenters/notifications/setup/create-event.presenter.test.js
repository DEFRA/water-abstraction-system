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
  let session
  let recipients

  beforeEach(async () => {
    recipients = RecipientsFixture.recipients()

    session = {
      returnsPeriod: 'quarterFour',
      removeLicences: [],
      journey: 'invitations',
      referenceCode: 'RINV-123',
      recipients: [...Object.values(recipients)],
      determinedReturnsPeriod: {
        dueDate: new Date(`2025-07-28`),
        endDate: new Date(`2025-06-30`),
        startDate: new Date(`2025-04-01`),
        summer: 'true'
      }
    }
  })

  it('correctly presents the data', () => {
    const result = CreateEventPresenter.go(session)

    expect(result).to.equal({
      licences: [
        recipients.primaryUser.licence_refs,
        recipients.returnsAgent.licence_refs,
        recipients.licenceHolder.licence_refs,
        recipients.returnsTo.licence_refs,
        ...recipients.licenceHolderWithMultipleLicences.licence_refs.split(',')
      ],
      metadata: {
        name: 'Returns: invitation',
        options: {
          excludeLicences: []
        },
        recipients: 5,
        returnCycle: {
          dueDate: session.determinedReturnsPeriod.dueDate,
          endDate: session.determinedReturnsPeriod.endDate,
          isSummer: 'true',
          startDate: session.determinedReturnsPeriod.startDate
        }
      },
      referenceCode: 'RINV-123',
      status: 'started',
      subtype: 'returnInvitation'
    })
  })

  describe('the "licences" property', () => {
    it('correctly return an array of all licence from all recipients', () => {
      const result = CreateEventPresenter.go(session)

      expect(result.licences).to.equal([
        recipients.primaryUser.licence_refs,
        recipients.returnsAgent.licence_refs,
        recipients.licenceHolder.licence_refs,
        recipients.returnsTo.licence_refs,
        ...recipients.licenceHolderWithMultipleLicences.licence_refs.split(',')
      ])
    })
  })

  describe('the "metadata" property', () => {
    describe('the "options.excludeLicences" property', () => {
      describe('when there licences excluded from the recipients list', () => {
        beforeEach(() => {
          session.removeLicences = ['123', '456']
        })

        it('correctly returns the exclude licences', () => {
          const result = CreateEventPresenter.go(session)

          expect(result.metadata.options.excludeLicences).to.equal(['123', '456'])
        })
      })

      describe('when there are no licences excluded from the recipients list', () => {
        beforeEach(() => {
          session.removeLicences = []
        })

        it('correctly returns the exclude licences', () => {
          const result = CreateEventPresenter.go(session)

          expect(result.metadata.options.excludeLicences).to.equal([])
        })
      })
    })

    describe('the "recipients" property', () => {
      beforeEach(() => {
        session.recipients = [...Object.values(recipients)]
      })

      it('correctly returns the length of recipients', () => {
        const result = CreateEventPresenter.go(session)

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
        const result = CreateEventPresenter.go(session)

        expect(result.metadata.returnCycle).to.equal({
          dueDate: session.determinedReturnsPeriod.dueDate,
          endDate: session.determinedReturnsPeriod.endDate,
          isSummer: 'true',
          startDate: session.determinedReturnsPeriod.startDate
        })
      })
    })
  })

  describe('when the journey is for "invitations"', () => {
    beforeEach(() => {
      session.journey = 'invitations'
    })

    it('correctly sets the "metadata.name"', () => {
      const result = CreateEventPresenter.go(session)

      expect(result.metadata.name).to.equal('Returns: invitation')
    })

    it('correctly sets the "subtype"', () => {
      const result = CreateEventPresenter.go(session)

      expect(result.subtype).to.equal('returnInvitation')
    })
  })

  describe('when the journey is for "reminders"', () => {
    beforeEach(() => {
      session.journey = 'reminders'
    })

    it('correctly sets the "metadata.name"', () => {
      const result = CreateEventPresenter.go(session)

      expect(result.metadata.name).to.equal('Returns: reminder')
    })

    it('correctly sets the "subtype"', () => {
      const result = CreateEventPresenter.go(session)

      expect(result.subtype).to.equal('returnReminder')
    })
  })

  describe('when the journey is not recognised', () => {
    beforeEach(() => {
      session.journey = ''
    })

    it('correctly sets the "metadata.name"', () => {
      const result = CreateEventPresenter.go(session)

      expect(result.metadata.name).to.equal('')
    })

    it('correctly sets the "subtype"', () => {
      const result = CreateEventPresenter.go(session)

      expect(result.subtype).to.equal('')
    })
  })
})
