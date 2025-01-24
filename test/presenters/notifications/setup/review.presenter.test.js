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
    testInput = Object.values(testRecipients)
  })

  describe('when provided with "recipients"', () => {
    it('correctly presents the data', () => {
      const result = ReviewPresenter.go(testInput, page, pagination)

      expect(result).to.equal({
        defaultPageSize: 25,
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
            contact: ['Mr H J Licence holder', '1', 'Privet Drive', 'Little Whinging', 'Surrey', 'WD25 7LR']
          },
          {
            licences: [`${testRecipients.returnsTo.all_licences}`],
            method: 'Letter - Returns To',
            contact: ['Mr H J Returns to', '2', 'Privet Drive', 'Little Whinging', 'Surrey', 'WD25 7LR']
          },
          {
            licences: testRecipients.licenceHolderWithMultipleLicences.all_licences.split(','),
            method: 'Letter - licence holder',
            contact: [
              'Mr H J Licence holder with multiple licences',
              '3',
              'Privet Drive',
              'Little Whinging',
              'Surrey',
              'WD25 7LR'
            ]
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
              contact: ['Mr H J Licence holder', '1', 'Privet Drive', 'Little Whinging', 'Surrey', 'WD25 7LR']
            },
            {
              licences: [`${testRecipients.returnsTo.all_licences}`],
              method: 'Letter - Returns To',
              contact: ['Mr H J Returns to', '2', 'Privet Drive', 'Little Whinging', 'Surrey', 'WD25 7LR']
            },
            {
              licences: testRecipients.licenceHolderWithMultipleLicences.all_licences.split(','),
              method: 'Letter - licence holder',
              contact: [
                'Mr H J Licence holder with multiple licences',
                '3',
                'Privet Drive',
                'Little Whinging',
                'Surrey',
                'WD25 7LR'
              ]
            }
          ])
        })

        describe('the "contact" property', () => {
          describe('when the contact is an email', () => {
            it('should return the email address', () => {
              const result = ReviewPresenter.go(testInput, page, pagination)

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
            describe('and the type is a "person"', () => {
              it('should convert the contact into an array and return the persons name', () => {
                const result = ReviewPresenter.go(testInput, page, pagination)

                const testRecipient = result.recipients.find((recipient) =>
                  recipient.licences.includes(testRecipients.licenceHolder.all_licences)
                )

                expect(testRecipient).to.equal({
                  licences: [`${testRecipients.licenceHolder.all_licences}`],
                  method: 'Letter - licence holder',
                  contact: ['Mr H J Licence holder', '1', 'Privet Drive', 'Little Whinging', 'Surrey', 'WD25 7LR']
                })
              })
            })

            describe('and the type is a "organisation"', () => {
              beforeEach(() => {
                testRecipients = RecipientsFixture.recipients()
                testRecipients.licenceHolder.contact.type = 'organisation'
                testInput = Object.values(testRecipients)
              })

              it('should convert the contact into an array and return the organisation name', () => {
                const result = ReviewPresenter.go(testInput, page, pagination)

                const testRecipient = result.recipients.find((recipient) =>
                  recipient.licences.includes(testRecipients.licenceHolder.all_licences)
                )

                expect(testRecipient).to.equal({
                  licences: [`${testRecipients.licenceHolder.all_licences}`],
                  method: 'Letter - licence holder',
                  contact: ['Licence holder', '1', 'Privet Drive', 'Little Whinging', 'Surrey', 'WD25 7LR']
                })
              })
            })
          })
        })

        describe('the "licences" property', () => {
          describe('when the recipient has a single licence number', () => {
            it('should return licence numbers as an array', () => {
              const result = ReviewPresenter.go(testInput, page, pagination)

              const testRecipient = result.recipients.find((recipient) =>
                recipient.licences.includes(testRecipients.licenceHolder.all_licences)
              )

              expect(testRecipient.licences).to.equal([testRecipients.licenceHolder.all_licences])
            })
          })

          describe('when the recipient has multiple licence numbers', () => {
            it('should return licence numbers as an array', () => {
              const result = ReviewPresenter.go(testInput, page, pagination)

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
