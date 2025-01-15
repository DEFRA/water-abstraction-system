'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../../fixtures/recipients.fixture.js')

// Thing under test
const ReviewPresenter = require('../../../../app/presenters/notifications/setup/review.presenter.js')

describe('Notifications Setup - Review presenter', () => {
  let recipients
  let page

  beforeEach(() => {
    page = 1
    recipients = RecipientsFixture.recipients()
  })

  describe('the "pageTitle" property', () => {
    it('should return page title', () => {
      const result = ReviewPresenter.go(recipients, page)
      expect(result.pageTitle).to.equal('Review the mailing list')
    })
  })

  describe('the "recipientsAmount" property', () => {
    it('should return the size of the recipients array', () => {
      const result = ReviewPresenter.go(recipients, page)
      expect(result.recipientsAmount).to.equal(recipients.length)
    })
  })

  describe('the "recipients" property', () => {
    describe('pagination', () => {
      describe('when on the first page and the recipients is longer than the default pagination limit', () => {
        it('should return the expect default pagination length', () => {
          const result = ReviewPresenter.go(recipients, page)

          expect(result.recipients.length).to.equal(25)
        })
      })
      describe('when on the last page and the recipients is less than the default pagination limit', () => {
        it('should return the remaining recipients', () => {
          const result = ReviewPresenter.go(recipients, 2)

          expect(result.recipients.length).to.equal(5)
        })
      })
    })
    describe('format recipient', () => {
      describe('for a single licence number', () => {
        it('should return licence numbers as an array', () => {
          const result = ReviewPresenter.go(recipients, page)

          const [testRecipient] = result.recipients
          expect(testRecipient.licences).to.equal(['01/1234/0'])
        })
      })
      describe('for a recipient with multiple licence numbers', () => {
        let additionalLicence
        let allLicences

        beforeEach(() => {
          additionalLicence = '123/456/D'
          allLicences = recipients[0].all_licences
          recipients = RecipientsFixture.recipients()

          recipients[0].all_licences = `${allLicences},${additionalLicence}`
        })

        it('should return licence numbers as an array', () => {
          const result = ReviewPresenter.go(recipients, page)

          const [testRecipient] = result.recipients
          expect(testRecipient.licences).to.equal([allLicences, additionalLicence])
        })
      })
      it('should return a formatted recipient', () => {
        const result = ReviewPresenter.go(recipients, page)

        const [testRecipient] = result.recipients
        expect(testRecipient).to.equal({
          contact: [
            'Harry 0',
            'Licence holder',
            'undefined',
            'Privet Drive',
            'Surrey',
            'Harry',
            'J',
            'WD25 7LR',
            'Little Whinging',
            'Person'
          ],
          licences: ['01/1234/0'],
          method: 'Letter - licence holder'
        })
      })
      it('should strip null keys from the contact object', () => {
        const result = ReviewPresenter.go(recipients, page)

        const [testRecipient] = result.recipients
        expect(testRecipient.contact).to.equal([
          'Harry 0',
          'Licence holder',
          'undefined',
          'Privet Drive',
          'Surrey',
          'Harry',
          'J',
          'WD25 7LR',
          'Little Whinging',
          'Person'
        ])
      })
    })
  })
})
