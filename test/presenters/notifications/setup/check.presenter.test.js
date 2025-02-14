'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const CheckPresenter = require('../../../../app/presenters/notifications/setup/check.presenter.js')

describe('Notifications Setup - Check presenter', () => {
  let session
  let page
  let pagination
  let testInput
  let testRecipients
  let testDuplicateRecipients

  beforeEach(() => {
    page = 1
    pagination = {
      numberOfPages: 1
    }

    session = { id: generateUUID(), journey: 'invitations' }

    testRecipients = RecipientsFixture.recipients()
    // This data is used to ensure the recipients are grouped when they have the same licence ref / name.
    // Ignore the fact that these would be considered duplicates elsewhere in the code
    // (e.g. contact hash / address being identical)
    testDuplicateRecipients = RecipientsFixture.duplicateRecipients()

    testInput = [...Object.values(testRecipients), ...Object.values(testDuplicateRecipients)].map((recipient) => {
      return {
        ...recipient,
        // The determine recipients service will add the message_type relevant to the recipient
        // This map is a simple way to add the message type without affecting the fixtures.
        // We are not concerned in this test how the message type is calculated so it is defaulted as below.
        message_type: 'Letter or email'
      }
    })
  })

  describe('when provided with "recipients"', () => {
    it('correctly presents the data (in alphabetical order)', () => {
      const result = CheckPresenter.go(testInput, page, pagination, session)

      expect(result).to.equal({
        defaultPageSize: 25,
        links: {
          download: `/system/notifications/setup/${session.id}/download`,
          removeLicences: `/system/notifications/setup/${session.id}/remove-licences`
        },
        recipients: [
          {
            contact: ['Mr H J Duplicate Licence holder', '4', 'Privet Drive', 'Little Whinging', 'Surrey', 'WD25 7LR'],
            licences: [testDuplicateRecipients.duplicateLicenceHolder.licence_refs],
            method: 'Letter or email - Licence holder'
          },
          {
            contact: ['Mr H J Duplicate Returns to', '4', 'Privet Drive', 'Little Whinging', 'Surrey', 'WD25 7LR'],
            licences: [testDuplicateRecipients.duplicateReturnsTo.licence_refs],
            method: 'Letter or email - Returns to'
          },
          {
            contact: ['Mr H J Licence holder', '1', 'Privet Drive', 'Little Whinging', 'Surrey', 'WD25 7LR'],
            licences: [testRecipients.licenceHolder.licence_refs],
            method: 'Letter or email - Licence holder'
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
          },
          {
            contact: ['Mr H J Returns to', '2', 'Privet Drive', 'Little Whinging', 'Surrey', 'WD25 7LR'],
            licences: [testRecipients.returnsTo.licence_refs],
            method: 'Letter or email - Returns to'
          },
          {
            contact: ['primary.user@important.com'],
            licences: [testRecipients.primaryUser.licence_refs],
            method: 'Letter or email - Primary user'
          },
          {
            contact: ['primary.user@important.com'],
            licences: [testDuplicateRecipients.duplicatePrimaryUser.licence_refs],
            method: 'Letter or email - Primary user'
          },
          {
            contact: ['returns.agent@important.com'],
            licences: [testRecipients.returnsAgent.licence_refs],
            method: 'Letter or email - Returns agent'
          },
          {
            contact: ['returns.agent@important.com'],
            licences: [testDuplicateRecipients.duplicateReturnsAgent.licence_refs],
            method: 'Letter or email - Returns agent'
          }
        ],
        recipientsAmount: 9,
        text: {
          continueButton: 'Send',
          readyToSend: 'Returns invitations are ready to send.',
          title: 'Check the recipients'
        }
      })
    })

    describe('when the journey is for "invitations"', () => {
      beforeEach(() => {
        session.journey = 'invitations'
      })

      describe('the "links" property', () => {
        it('should return the links for "invitations"', () => {
          const result = CheckPresenter.go(testInput, page, pagination, session)
          expect(result.links).to.equal({
            download: `/system/notifications/setup/${session.id}/download`,
            removeLicences: `/system/notifications/setup/${session.id}/remove-licences`
          })
        })
      })

      describe('the "recipients" property', () => {
        describe('format all recipient types', () => {
          it('should return the formatted recipients', () => {
            const result = CheckPresenter.go(testInput, page, pagination, session)

            expect(result.recipients).to.equal([
              {
                contact: [
                  'Mr H J Duplicate Licence holder',
                  '4',
                  'Privet Drive',
                  'Little Whinging',
                  'Surrey',
                  'WD25 7LR'
                ],
                licences: [testDuplicateRecipients.duplicateLicenceHolder.licence_refs],
                method: 'Letter or email - Licence holder'
              },
              {
                contact: ['Mr H J Duplicate Returns to', '4', 'Privet Drive', 'Little Whinging', 'Surrey', 'WD25 7LR'],
                licences: [testDuplicateRecipients.duplicateReturnsTo.licence_refs],
                method: 'Letter or email - Returns to'
              },
              {
                contact: ['Mr H J Licence holder', '1', 'Privet Drive', 'Little Whinging', 'Surrey', 'WD25 7LR'],
                licences: [testRecipients.licenceHolder.licence_refs],
                method: 'Letter or email - Licence holder'
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
              },
              {
                contact: ['Mr H J Returns to', '2', 'Privet Drive', 'Little Whinging', 'Surrey', 'WD25 7LR'],
                licences: [testRecipients.returnsTo.licence_refs],
                method: 'Letter or email - Returns to'
              },
              {
                contact: ['primary.user@important.com'],
                licences: [testRecipients.primaryUser.licence_refs],
                method: 'Letter or email - Primary user'
              },
              {
                contact: ['primary.user@important.com'],
                licences: [testDuplicateRecipients.duplicatePrimaryUser.licence_refs],
                method: 'Letter or email - Primary user'
              },
              {
                contact: ['returns.agent@important.com'],
                licences: [testRecipients.returnsAgent.licence_refs],
                method: 'Letter or email - Returns agent'
              },
              {
                contact: ['returns.agent@important.com'],
                licences: [testDuplicateRecipients.duplicateReturnsAgent.licence_refs],
                method: 'Letter or email - Returns agent'
              }
            ])
          })

          describe('the "contact" property', () => {
            describe('when the contact is an email', () => {
              it('should return the email address', () => {
                const result = CheckPresenter.go(testInput, page, pagination, session)

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
                const result = CheckPresenter.go(testInput, page, pagination, session)

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
                const result = CheckPresenter.go(testInput, page, pagination, session)

                const testRecipient = result.recipients.find((recipient) =>
                  recipient.licences.includes(testRecipients.licenceHolder.licence_refs)
                )

                expect(testRecipient.licences).to.equal([testRecipients.licenceHolder.licence_refs])
              })
            })

            describe('when the recipient has multiple licence numbers', () => {
              it('should return licence numbers as an array', () => {
                const result = CheckPresenter.go(testInput, page, pagination, session)

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
            const result = CheckPresenter.go(testInput, page, pagination, session)

            expect(result.recipients.length).to.equal(testInput.length)
          })
        })

        describe('and there are >= 25 recipients', () => {
          beforeEach(() => {
            testInput = [...testInput, ...testInput, ...testInput]

            pagination = {
              numberOfPages: 2
            }
          })

          describe('and the page is 1', () => {
            it('returns the first 25 recipients', () => {
              const result = CheckPresenter.go(testInput, page, pagination, session)

              expect(result.recipients.length).to.equal(25)
            })

            it('returns the updated "text"', () => {
              const result = CheckPresenter.go(testInput, page, pagination, session)

              expect(result.text).to.equal({
                continueButton: 'Send',
                readyToSend: 'Returns invitations are ready to send.',
                title: 'Check the recipients (page 1 of 2)'
              })
            })
          })

          describe('and there is more than one page', () => {
            beforeEach(() => {
              page = '2'
            })

            it('returns the remaining recipients', () => {
              const result = CheckPresenter.go(testInput, page, pagination, session)

              expect(result.recipients.length).to.equal(2)
            })

            it('returns the updated "text"', () => {
              const result = CheckPresenter.go(testInput, page, pagination, session)

              expect(result.text).to.equal({
                continueButton: 'Send',
                readyToSend: 'Returns invitations are ready to send.',
                title: 'Check the recipients (page 2 of 2)'
              })
            })
          })
        })
      })
    })

    describe('when the journey is for "ad-hoc"', () => {
      beforeEach(() => {
        session.journey = 'ad-hoc'
      })

      describe('the "links" property', () => {
        it('should return the links for "invitations"', () => {
          const result = CheckPresenter.go(testInput, page, pagination, session)
          expect(result.links).to.equal({
            download: `/system/notifications/setup/${session.id}/download`,
            removeLicences: ``
          })
        })
      })

      describe('the "recipients" property', () => {
        describe('format all recipient types', () => {
          it('should return the formatted recipients', () => {
            const result = CheckPresenter.go(testInput, page, pagination, session)

            expect(result.recipients).to.equal([
              {
                contact: [
                  'Mr H J Duplicate Licence holder',
                  '4',
                  'Privet Drive',
                  'Little Whinging',
                  'Surrey',
                  'WD25 7LR'
                ],
                licences: [testDuplicateRecipients.duplicateLicenceHolder.licence_refs],
                method: 'Letter or email - Licence holder'
              },
              {
                contact: ['Mr H J Duplicate Returns to', '4', 'Privet Drive', 'Little Whinging', 'Surrey', 'WD25 7LR'],
                licences: [testDuplicateRecipients.duplicateReturnsTo.licence_refs],
                method: 'Letter or email - Returns to'
              },
              {
                contact: ['Mr H J Licence holder', '1', 'Privet Drive', 'Little Whinging', 'Surrey', 'WD25 7LR'],
                licences: [testRecipients.licenceHolder.licence_refs],
                method: 'Letter or email - Licence holder'
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
              },
              {
                contact: ['Mr H J Returns to', '2', 'Privet Drive', 'Little Whinging', 'Surrey', 'WD25 7LR'],
                licences: [testRecipients.returnsTo.licence_refs],
                method: 'Letter or email - Returns to'
              },
              {
                contact: ['primary.user@important.com'],
                licences: [testRecipients.primaryUser.licence_refs],
                method: 'Letter or email - Primary user'
              },
              {
                contact: ['primary.user@important.com'],
                licences: [testDuplicateRecipients.duplicatePrimaryUser.licence_refs],
                method: 'Letter or email - Primary user'
              },
              {
                contact: ['returns.agent@important.com'],
                licences: [testRecipients.returnsAgent.licence_refs],
                method: 'Letter or email - Returns agent'
              },
              {
                contact: ['returns.agent@important.com'],
                licences: [testDuplicateRecipients.duplicateReturnsAgent.licence_refs],
                method: 'Letter or email - Returns agent'
              }
            ])
          })

          describe('the "contact" property', () => {
            describe('when the contact is an email', () => {
              it('should return the email address', () => {
                const result = CheckPresenter.go(testInput, page, pagination, session)

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
                const result = CheckPresenter.go(testInput, page, pagination, session)

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
                const result = CheckPresenter.go(testInput, page, pagination, session)

                const testRecipient = result.recipients.find((recipient) =>
                  recipient.licences.includes(testRecipients.licenceHolder.licence_refs)
                )

                expect(testRecipient.licences).to.equal([testRecipients.licenceHolder.licence_refs])
              })
            })

            describe('when the recipient has multiple licence numbers', () => {
              it('should return licence numbers as an array', () => {
                const result = CheckPresenter.go(testInput, page, pagination, session)

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
            const result = CheckPresenter.go(testInput, page, pagination, session)

            expect(result.recipients.length).to.equal(testInput.length)
          })
        })

        describe('and there are >= 25 recipients', () => {
          beforeEach(() => {
            testInput = [...testInput, ...testInput, ...testInput]

            pagination = {
              numberOfPages: 2
            }
          })

          describe('and the page is 1', () => {
            it('returns the first 25 recipients', () => {
              const result = CheckPresenter.go(testInput, page, pagination, session)

              expect(result.recipients.length).to.equal(25)
            })

            it('returns the updated "text"', () => {
              const result = CheckPresenter.go(testInput, page, pagination, session)

              expect(result.text).to.equal({
                continueButton: 'Send',
                readyToSend: 'Ad-hoc notifications are ready to send.',
                title: 'Check the recipients (page 1 of 2)'
              })
            })
          })

          describe('and there is more than one page', () => {
            beforeEach(() => {
              page = '2'
            })

            it('returns the remaining recipients', () => {
              const result = CheckPresenter.go(testInput, page, pagination, session)

              expect(result.recipients.length).to.equal(2)
            })

            it('returns the updated "text"', () => {
              const result = CheckPresenter.go(testInput, page, pagination, session)

              expect(result.text).to.equal({
                continueButton: 'Send',
                readyToSend: 'Ad-hoc notifications are ready to send.',
                title: 'Check the recipients (page 2 of 2)'
              })
            })
          })
        })
      })
    })
  })
})
