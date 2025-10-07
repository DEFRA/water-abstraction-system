'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')
const { generateReferenceCode } = require('../../../support/helpers/notification.helper.js')

// Thing under test
const SelectRecipientsPresenter = require('../../../../app/presenters/notices/setup/select-recipients.presenter.js')

describe('Notices - Setup - Select Recipients Presenter', () => {
  let recipients
  let referenceCode
  let selectedRecipients
  let session
  let testRecipients

  beforeEach(() => {
    recipients = RecipientsFixture.recipients()

    referenceCode = generateReferenceCode()

    selectedRecipients = [
      recipients.primaryUser.contact_hash_id,
      recipients.returnsAgent.contact_hash_id,
      recipients.licenceHolder.contact_hash_id,
      recipients.returnsTo.contact_hash_id,
      recipients.licenceHolderWithMultipleLicences.contact_hash_id
    ]

    session = {
      id: 123,
      referenceCode
    }

    testRecipients = [...Object.values(recipients)]
  })

  it('returns page data for the view', () => {
    const result = SelectRecipientsPresenter.go(session, testRecipients, selectedRecipients)

    expect(result).to.equal({
      backLink: {
        href: `/system/notices/setup/${session.id}/check`,
        text: 'Back'
      },
      pageTitle: 'Select Recipients',
      pageTitleCaption: `Notice ${referenceCode}`,
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
      setupAddress: {
        href: '/system/notices/setup/123/contact-type',
        text: 'Set up a single use address or email address'
      }
    })
  })

  describe('the "recipients" property', () => {
    beforeEach(() => {
      const recipient = Object.values(recipients)

      selectedRecipients = [recipient[0].contact_hash_id]

      testRecipients = [recipient[0]]
    })

    describe('and there are no "selectedRecipients"', () => {
      beforeEach(() => {
        selectedRecipients = []
      })

      it('returns page data for the view with relevant recipients not checked', () => {
        const result = SelectRecipientsPresenter.go(session, testRecipients, selectedRecipients)

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
        selectedRecipients = [recipients.primaryUser.contact_hash_id]

        const recipient = Object.values(recipients)

        testRecipients.push(recipient[1])
      })

      it('returns page data for the view with relevant recipients checked', () => {
        const result = SelectRecipientsPresenter.go(session, testRecipients, selectedRecipients)

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

  describe('the "setupAddress" property', () => {
    describe('when the "noticeType" is "paperReturn"', () => {
      beforeEach(() => {
        session.noticeType = 'paperReturn'
      })

      it('returns correct text and link', () => {
        const result = SelectRecipientsPresenter.go(session, testRecipients, selectedRecipients)

        expect(result.setupAddress).to.equal({
          href: `/system/notices/setup/${session.id}/recipient-name`,
          text: 'Set up a single use address'
        })
      })
    })

    describe('when the "noticeType" is not "paperForm"', () => {
      it('returns correct text and link', () => {
        const result = SelectRecipientsPresenter.go(session, testRecipients, selectedRecipients)

        expect(result.setupAddress).to.equal({
          href: `/system/notices/setup/${session.id}/contact-type`,
          text: 'Set up a single use address or email address'
        })
      })
    })
  })
})
