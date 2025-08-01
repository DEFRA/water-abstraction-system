'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')

// Thing under test
const ContactPresenter = require('../../../../app/presenters/notices/setup/contact.presenter.js')

describe('Notices - Setup - Contact presenter', () => {
  let recipients

  beforeEach(() => {
    recipients = RecipientsFixture.recipients()
  })

  describe('when the recipient is an email', () => {
    it('should return the email address', () => {
      const result = ContactPresenter.go(recipients.primaryUser)

      expect(result).to.equal(['primary.user@important.com'])
    })
  })

  describe('when the recipient is an address', () => {
    describe('and it is valid', () => {
      it('should return the postal address', () => {
        const result = ContactPresenter.go(recipients.licenceHolder)

        expect(result).to.equal(['Mr H J Licence holder', '1', 'Privet Drive', 'Little Whinging', 'Surrey', 'WD25 7LR'])
      })
    })

    describe('and it is invalid', () => {
      beforeEach(() => {
        recipients.licenceHolder.contact.postcode = null
      })

      it('should return the postal address flagged as INVALID', () => {
        const result = ContactPresenter.go(recipients.licenceHolder)

        expect(result).to.equal([
          'Mr H J Licence holder',
          'INVALID ADDRESS - Needs a valid postcode or country outside the UK',
          '1',
          'Privet Drive',
          'Little Whinging',
          'Surrey'
        ])
      })
    })
  })
})
