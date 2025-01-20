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
  let testRecipients
  let testInput

  beforeEach(() => {
    testRecipients = RecipientsFixture.recipients()
    testInput = Object.values(testRecipients)
  })

  describe('when provided with "recipients"', () => {
    it('correctly presents the data', () => {
      const result = ReviewPresenter.go(testInput)

      expect(result).to.equal({
        pageTitle: 'Send returns invitations',
        recipients: [
          {
            licences: [`${testRecipients.primaryUser.all_licences}`],
            method: 'Email - primary user',
            contact: ['primary.user@important.com']
          },
          {
            licences: [`${testRecipients.returnsAgent.all_licences}`],
            method: 'Email - returns agent',
            contact: ['returns.agent@important.com']
          },
          {
            licences: [`${testRecipients.licenceHolder.all_licences}`],
            method: 'Letter - licence holder',
            contact: [
              'Licence Guy',
              'undefined',
              'Privet Drive',
              'Surrey',
              'Harry',
              'J',
              'WD25 7LR',
              'Little Whinging',
              'Person',
              'Licence holder'
            ]
          },
          {
            licences: [`${testRecipients.returnsTo.all_licences}`],
            method: 'Letter - Returns To',
            contact: [
              'Returner Guy',
              'undefined',
              'Privet Drive',
              'Surrey',
              'Harry',
              'J',
              'WD25 7LR',
              'Little Whinging',
              'Person',
              'Returns to'
            ]
          },
          {
            licences: testRecipients.licenceHolderWithMultipleLicences.all_licences.split(','),
            method: 'Letter - licence holder',
            contact: [
              'Multiple Licence Guy',
              'undefined',
              'Privet Drive',
              'Surrey',
              'Harry',
              'J',
              'WD25 7LR',
              'Little Whinging',
              'Person',
              'Licence holder'
            ]
          }
        ],
        recipientsAmount: 5
      })
    })

    describe('the "pageTitle" property', () => {
      it('should return page title', () => {
        const result = ReviewPresenter.go(testInput)
        expect(result.pageTitle).to.equal('Send returns invitations')
      })
    })

    describe('the "recipientsAmount" property', () => {
      it('should return the size of the recipients array', () => {
        const result = ReviewPresenter.go(testInput)
        expect(result.recipientsAmount).to.equal(testInput.length)
      })
    })

    describe('the "recipients" property', () => {
      describe('format all recipient types', () => {
        it('should return the formatted recipients', () => {
          const result = ReviewPresenter.go(testInput)

          expect(result.recipients).to.equal([
            {
              licences: [`${testRecipients.primaryUser.all_licences}`],
              method: 'Email - primary user',
              contact: ['primary.user@important.com']
            },
            {
              licences: [`${testRecipients.returnsAgent.all_licences}`],
              method: 'Email - returns agent',
              contact: ['returns.agent@important.com']
            },
            {
              licences: [`${testRecipients.licenceHolder.all_licences}`],
              method: 'Letter - licence holder',
              contact: [
                'Licence Guy',
                'undefined',
                'Privet Drive',
                'Surrey',
                'Harry',
                'J',
                'WD25 7LR',
                'Little Whinging',
                'Person',
                'Licence holder'
              ]
            },
            {
              licences: [`${testRecipients.returnsTo.all_licences}`],
              method: 'Letter - Returns To',
              contact: [
                'Returner Guy',
                'undefined',
                'Privet Drive',
                'Surrey',
                'Harry',
                'J',
                'WD25 7LR',
                'Little Whinging',
                'Person',
                'Returns to'
              ]
            },
            {
              licences: testRecipients.licenceHolderWithMultipleLicences.all_licences.split(','),
              method: 'Letter - licence holder',
              contact: [
                'Multiple Licence Guy',
                'undefined',
                'Privet Drive',
                'Surrey',
                'Harry',
                'J',
                'WD25 7LR',
                'Little Whinging',
                'Person',
                'Licence holder'
              ]
            }
          ])
        })

        describe('the "contact" property', () => {
          describe('when the contact is an email', () => {
            it('should return the email address', () => {
              const result = ReviewPresenter.go(testInput)

              const testRecipient = result.recipients.find((recipient) =>
                recipient.licences.includes(testRecipients.primaryUser.all_licences)
              )

              expect(testRecipient).to.equal({
                contact: ['primary.user@important.com'],
                licences: [`${testRecipients.primaryUser.all_licences}`],
                method: 'Email - primary user'
              })
            })
          })

          describe('when the contact is an address', () => {
            it('should strip "null" keys/values from the contact object', () => {
              const result = ReviewPresenter.go(testInput)

              const testRecipient = result.recipients.find((recipient) =>
                recipient.licences.includes(testRecipients.licenceHolder.all_licences)
              )

              expect(testRecipient).to.equal({
                licences: [`${testRecipients.licenceHolder.all_licences}`],
                method: 'Letter - licence holder',
                contact: [
                  'Licence Guy',
                  'undefined',
                  'Privet Drive',
                  'Surrey',
                  'Harry',
                  'J',
                  'WD25 7LR',
                  'Little Whinging',
                  'Person',
                  'Licence holder'
                ]
              })
            })
          })
        })

        describe('the "licences" property', () => {
          describe('when the recipient has a single licence number', () => {
            it('should return licence numbers as an array', () => {
              const result = ReviewPresenter.go(testInput)

              const testRecipient = result.recipients.find((recipient) =>
                recipient.licences.includes(testRecipients.licenceHolder.all_licences)
              )

              expect(testRecipient.licences).to.equal([testRecipients.licenceHolder.all_licences])
            })
          })

          describe('when the recipient has multiple licence numbers', () => {
            it('should return licence numbers as an array', () => {
              const result = ReviewPresenter.go(testInput)

              const testRecipient = result.recipients.find(
                (recipient) =>
                  JSON.stringify(recipient.licences) ===
                  JSON.stringify(testRecipients.licenceHolderWithMultipleLicences.all_licences.split(','))
              )

              expect(testRecipient.licences).to.equal(
                testRecipients.licenceHolderWithMultipleLicences.all_licences.split(',')
              )
            })
          })
        })
      })
    })
  })
})
