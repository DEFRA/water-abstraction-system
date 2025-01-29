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
  let page
  let pagination
  let testInput
  let testRecipients

  beforeEach(() => {
    page = 1
    pagination = {
      numberOfPages: 1
    }

    testRecipients = RecipientsFixture.recipients()
    // The determine recipients service will add the message relevant to the recipient
    testInput = Object.values(testRecipients).map((recipient) => {
      return {
        ...recipient,
        message_type: 'Letter or email'
      }
    })
  })

  describe('when provided with "recipients"', () => {
    it('correctly presents the data', () => {
      const result = ReviewPresenter.go(testInput, page, pagination)

      expect(result).to.equal({
        defaultPageSize: 25,
        pageTitle: 'Send returns invitations',
        recipients: [
          {
            contact: ['primary.user@important.com'],
            licences: [testRecipients.primaryUser.licence_refs],
            method: 'Letter or email - Primary user'
          },
          {
            contact: ['returns.agent@important.com'],
            licences: [testRecipients.returnsAgent.licence_refs],
            method: 'Letter or email - Returns agent'
          },
          {
            contact: ['Mr H J Licence holder', '1', 'Privet Drive', 'Little Whinging', 'Surrey', 'WD25 7LR'],
            licences: [testRecipients.licenceHolder.licence_refs],
            method: 'Letter or email - Licence holder'
          },
          {
            contact: ['Mr H J Returns to', '2', 'Privet Drive', 'Little Whinging', 'Surrey', 'WD25 7LR'],
            licences: [testRecipients.returnsTo.licence_refs],
            method: 'Letter or email - Returns to'
          },
          {
            contact: [
              'Mr H J Licence holder with multiple licences',
              '3',
              'Privet Drive',
              'Little Whinging',
              'Surrey',
              'WD25 7LR'
            ],
            licences: testRecipients.licenceHolderWithMultipleLicences.licence_refs.split(','),
            method: 'Letter or email - Licence holder'
          }
        ],
        recipientsAmount: 5
      })
    })

    describe('the "recipients" property', () => {
      describe('format all recipient types', () => {
        it('should return the formatted recipients', () => {
          const result = ReviewPresenter.go(testInput, page, pagination)

          expect(result.recipients).to.equal([
            {
              contact: ['primary.user@important.com'],
              licences: [testRecipients.primaryUser.licence_refs],
              method: 'Letter or email - Primary user'
            },
            {
              contact: ['returns.agent@important.com'],
              licences: [testRecipients.returnsAgent.licence_refs],
              method: 'Letter or email - Returns agent'
            },
            {
              contact: ['Mr H J Licence holder', '1', 'Privet Drive', 'Little Whinging', 'Surrey', 'WD25 7LR'],
              licences: [testRecipients.licenceHolder.licence_refs],
              method: 'Letter or email - Licence holder'
            },
            {
              contact: ['Mr H J Returns to', '2', 'Privet Drive', 'Little Whinging', 'Surrey', 'WD25 7LR'],
              licences: [testRecipients.returnsTo.licence_refs],
              method: 'Letter or email - Returns to'
            },
            {
              contact: [
                'Mr H J Licence holder with multiple licences',
                '3',
                'Privet Drive',
                'Little Whinging',
                'Surrey',
                'WD25 7LR'
              ],
              licences: testRecipients.licenceHolderWithMultipleLicences.licence_refs.split(','),
              method: 'Letter or email - Licence holder'
            }
          ])
        })

        describe('the "contact" property', () => {
          describe('when the contact is an email', () => {
            it('should return the email address', () => {
              const result = ReviewPresenter.go(testInput, page, pagination)

              const testRecipient = result.recipients.find((recipient) =>
                recipient.licences.includes(testRecipients.primaryUser.licence_refs)
              )

              expect(testRecipient).to.equal({
                contact: ['primary.user@important.com'],
                licences: [`${testRecipients.primaryUser.licence_refs}`],
                method: 'Letter or email - Primary user'
              })
            })
          })

          describe('when the contact is an address', () => {
            it('should convert the contact into an array', () => {
              const result = ReviewPresenter.go(testInput, page, pagination)

              const testRecipient = result.recipients.find((recipient) =>
                recipient.licences.includes(testRecipients.licenceHolder.licence_refs)
              )

              expect(testRecipient).to.equal({
                contact: ['Mr H J Licence holder', '1', 'Privet Drive', 'Little Whinging', 'Surrey', 'WD25 7LR'],
                licences: [`${testRecipients.licenceHolder.licence_refs}`],
                method: 'Letter or email - Licence holder'
              })
            })
          })
        })

        describe('the "licences" property', () => {
          describe('when the recipient has a single licence number', () => {
            it('should return licence numbers as an array', () => {
              const result = ReviewPresenter.go(testInput, page, pagination)

              const testRecipient = result.recipients.find((recipient) =>
                recipient.licences.includes(testRecipients.licenceHolder.licence_refs)
              )

              expect(testRecipient.licences).to.equal([testRecipients.licenceHolder.licence_refs])
            })
          })

          describe('when the recipient has multiple licence numbers', () => {
            it('should return licence numbers as an array', () => {
              const result = ReviewPresenter.go(testInput, page, pagination)

              const testRecipient = result.recipients.find(
                (recipient) =>
                  JSON.stringify(recipient.licences) ===
                  JSON.stringify(testRecipients.licenceHolderWithMultipleLicences.licence_refs.split(','))
              )

              expect(testRecipient.licences).to.equal(
                testRecipients.licenceHolderWithMultipleLicences.licence_refs.split(',')
              )
            })
          })
        })
      })

      describe('and there are <= 25 recipients ', () => {
        it('returns all the recipients', () => {
          const result = ReviewPresenter.go(testInput, page, pagination)

          expect(result.recipients.length).to.equal(testInput.length)
        })
      })

      describe('and there are >= 25 recipients', () => {
        beforeEach(() => {
          testInput = [...testInput, ...testInput, ...testInput, ...testInput, ...testInput, ...testInput]

          pagination = {
            numberOfPages: 2
          }
        })

        describe('and the page is 1', () => {
          it('returns the first 25 recipients', () => {
            const result = ReviewPresenter.go(testInput, page, pagination)

            expect(result.recipients.length).to.equal(25)
          })

          it('returns the updated "pageTitle"', () => {
            const result = ReviewPresenter.go(testInput, page, pagination)

            expect(result.pageTitle).to.equal('Send returns invitations (page 1 of 2)')
          })
        })

        describe('and there is more than one page', () => {
          beforeEach(() => {
            page = '2'
          })

          it('returns the remaining recipients', () => {
            const result = ReviewPresenter.go(testInput, page, pagination)

            expect(result.recipients.length).to.equal(5)
          })

          it('returns the updated "pageTitle"', () => {
            const result = ReviewPresenter.go(testInput, page, pagination)

            expect(result.pageTitle).to.equal('Send returns invitations (page 2 of 2)')
          })
        })
      })
    })
  })
})
