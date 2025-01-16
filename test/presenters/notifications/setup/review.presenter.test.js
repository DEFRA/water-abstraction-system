'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')

// Thing under test
const ReviewPresenter = require('../../../../app/presenters/notifications/setup/review.presenter.js')

describe('Notifications Setup - Review presenter', () => {
  let recipients

  beforeEach(() => {
    recipients = RecipientsFixture.recipients()
  })

  describe('the "pageTitle" property', () => {
    it('should return page title', () => {
      const result = ReviewPresenter.go(recipients)
      expect(result.pageTitle).to.equal('Send returns invitations')
    })
  })

  describe('the "recipientsAmount" property', () => {
    it('should return the size of the recipients array', () => {
      const result = ReviewPresenter.go(recipients)
      expect(result.recipientsAmount).to.equal(recipients.length)
    })
  })

  describe('the "recipients" property', () => {
    describe('format recipient', () => {
      it('should return a formatted recipient', () => {
        const result = ReviewPresenter.go(recipients)

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

      describe('the "contact" property', () => {
        it('should strip "null" keys/values from the contact object', () => {
          const result = ReviewPresenter.go(recipients)

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

      describe('the "licences" property', () => {
        describe('when the recipient has a  single licence number', () => {
          it('should return licence numbers as an array', () => {
            const result = ReviewPresenter.go(recipients)

            const [testRecipient] = result.recipients
            expect(testRecipient.licences).to.equal(['01/1234/0'])
          })
        })

        describe('when the recipient has multiple licence numbers', () => {
          let additionalLicence
          let allLicences

          beforeEach(() => {
            additionalLicence = '123/456/D'

            recipients = RecipientsFixture.recipients()
            allLicences = recipients[0].all_licences

            recipients[0].all_licences = `${allLicences},${additionalLicence}`
          })

          it('should return licence numbers as an array', () => {
            const result = ReviewPresenter.go(recipients)

            const [testRecipient] = result.recipients
            expect(testRecipient.licences).to.equal([allLicences, additionalLicence])
          })
        })
      })
    })
  })
})
