'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const SelectRecipientsPresenter = require('../../../../app/presenters/notices/setup/select-recipients.presenter.js')
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')

describe('Select Recipients Presenter', () => {
  let recipients
  let session
  let testRecipients

  beforeEach(() => {
    session = { id: 123 }
    recipients = RecipientsFixture.recipients()

    testRecipients = [...Object.values(recipients)]
  })

  describe('when called', () => {
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
        ]
      })
    })
  })
})
