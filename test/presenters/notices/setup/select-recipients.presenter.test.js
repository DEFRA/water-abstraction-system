'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')

// Thing under test
const SelectRecipientsPresenter = require('../../../../app/presenters/notices/setup/select-recipients.presenter.js')

describe('Select Recipients Presenter', () => {
  let recipients
  let session
  let testRecipients

  beforeEach(() => {
    session = { id: 123 }
    recipients = RecipientsFixture.recipients()

    testRecipients = [...Object.values(recipients)]
  })

  it('returns page data for the view', () => {
    const result = SelectRecipientsPresenter.go(session, testRecipients)

    expect(result).to.equal({
      backLink: `/system/notices/setup/${session.id}/check`,
      pageTitle: 'Select Recipients',
      recipients: [
        {
          checked: true,
          contact: [recipients.primaryUser.email],
          contact_hash_id: recipients.primaryUser.contact_hash_id
        },
        {
          checked: true,
          contact: [recipients.returnsAgent.email],
          contact_hash_id: recipients.returnsAgent.contact_hash_id
        },
        {
          checked: true,
          contact: ['Mr H J Licence holder', '1', 'Privet Drive', 'Little Whinging', 'Surrey', 'WD25 7LR'],
          contact_hash_id: recipients.licenceHolder.contact_hash_id
        },
        {
          checked: true,
          contact: [
            'Mr H J Returns to',
            'INVALID ADDRESS - Needs a valid postcode or country outside the UK',
            '2',
            'Privet Drive',
            'Little Whinging',
            'Surrey'
          ],
          contact_hash_id: recipients.returnsTo.contact_hash_id
        },
        {
          checked: true,
          contact: [
            'Mr H J Licence holder with multiple licences',
            '3',
            'Privet Drive',
            'Little Whinging',
            'Surrey',
            'WD25 7LR'
          ],
          contact_hash_id: recipients.licenceHolderWithMultipleLicences.contact_hash_id
        }
      ],
      sessionId: session.id
    })
  })

  describe('the "recipients" property', () => {
    beforeEach(() => {
      const recipient = Object.values(recipients)

      testRecipients = [recipient[0]]
    })

    describe('and "selectedRecipients" in not present in the session', () => {
      it('returns page data for the view with all recipients checked', () => {
        const result = SelectRecipientsPresenter.go(session, testRecipients)

        expect(result.recipients).to.equal([
          {
            checked: true,
            contact: [recipients.primaryUser.email],
            contact_hash_id: recipients.primaryUser.contact_hash_id
          }
        ])
      })
    })

    describe('and there are no "selectedRecipients"', () => {
      beforeEach(() => {
        session.selectedRecipients = []
      })

      it('returns page data for the view with relevant recipients not checked', () => {
        const result = SelectRecipientsPresenter.go(session, testRecipients)

        expect(result.recipients).to.equal([
          {
            checked: false,
            contact: [recipients.primaryUser.email],
            contact_hash_id: recipients.primaryUser.contact_hash_id
          }
        ])
      })
    })

    describe('and there are "selectedRecipients"', () => {
      beforeEach(() => {
        session.selectedRecipients = [recipients.primaryUser.contact_hash_id]

        const recipient = Object.values(recipients)

        testRecipients.push(recipient[1])
      })

      it('returns page data for the view with relevant recipients checked', () => {
        const result = SelectRecipientsPresenter.go(session, testRecipients)

        expect(result.recipients).to.equal([
          {
            checked: true,
            contact: [recipients.primaryUser.email],
            contact_hash_id: recipients.primaryUser.contact_hash_id
          },
          {
            checked: false,
            contact: [recipients.returnsAgent.email],
            contact_hash_id: recipients.returnsAgent.contact_hash_id
          }
        ])
      })
    })
  })
})
