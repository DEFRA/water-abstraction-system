'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateReferenceCode } = require('../../../support/helpers/notification.helper.js')

// Test helpers
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const CheckPresenter = require('../../../../app/presenters/notices/setup/check.presenter.js')

describe('Notices - Setup - Check presenter', () => {
  let session
  let page
  let pagination
  let recipients
  let testRecipients
  let testDuplicateRecipients

  beforeEach(() => {
    page = 1
    pagination = {
      numberOfPages: 1
    }

    session = {
      id: generateUUID(),
      journey: 'standard',
      noticeType: 'invitations',
      referenceCode: generateReferenceCode('RINV')
    }

    testRecipients = RecipientsFixture.recipients()
    // This data is used to ensure the recipients are grouped when they have the same licence ref / name.
    // Ignore the fact that these would be considered duplicates elsewhere in the code
    // (e.g. contact hash / address being identical)
    testDuplicateRecipients = RecipientsFixture.duplicateRecipients()

    recipients = [...Object.values(testRecipients), ...Object.values(testDuplicateRecipients)].map((recipient) => {
      return {
        ...recipient,
        // The determine recipients service will add the message_type relevant to the recipient
        // This map is a simple way to add the message type without affecting the fixtures.
        // We are not concerned in this test how the message type is calculated so it is defaulted as below.
        message_type: 'Letter or email'
      }
    })
  })

  it('correctly presents the data', () => {
    const result = CheckPresenter.go(recipients, page, pagination, session)

    expect(result).to.equal({
      canSendNotice: true,
      links: {
        cancel: `/system/notices/setup/${session.id}/cancel`,
        download: `/system/notices/setup/${session.id}/download`,
        removeLicences: `/system/notices/setup/${session.id}/remove-licences`
      },
      pageTitle: 'Check the recipients',
      pageTitleCaption: `Notice ${session.referenceCode}`,
      readyToSend: 'Returns invitations are ready to send.',
      recipients: [
        {
          contact: ['Mr H J Duplicate Licence holder', '4', 'Privet Drive', 'Little Whinging', 'Surrey', 'WD25 7LR'],
          licences: [testDuplicateRecipients.duplicateLicenceHolder.licence_refs],
          method: 'Letter or email - Licence holder',
          previewLink: `/system/notices/setup/${session.id}/preview/${testDuplicateRecipients.duplicateLicenceHolder.contact_hash_id}`
        },
        {
          contact: ['Mr H J Duplicate Returns to', '4', 'Privet Drive', 'Little Whinging', 'Surrey', 'WD25 7LR'],
          licences: [testDuplicateRecipients.duplicateReturnsTo.licence_refs],
          method: 'Letter or email - Returns to',
          previewLink: `/system/notices/setup/${session.id}/preview/${testDuplicateRecipients.duplicateReturnsTo.contact_hash_id}`
        },
        {
          contact: ['Mr H J Licence holder', '1', 'Privet Drive', 'Little Whinging', 'Surrey', 'WD25 7LR'],
          licences: [testRecipients.licenceHolder.licence_refs],
          method: 'Letter or email - Licence holder',
          previewLink: `/system/notices/setup/${session.id}/preview/${testRecipients.licenceHolder.contact_hash_id}`
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
          method: 'Letter or email - Licence holder',
          previewLink: `/system/notices/setup/${session.id}/preview/${testRecipients.licenceHolderWithMultipleLicences.contact_hash_id}`
        },
        {
          contact: [
            'Mr H J Returns to',
            'INVALID ADDRESS - Needs a valid postcode or country outside the UK',
            '2',
            'Privet Drive',
            'Little Whinging',
            'Surrey'
          ],
          licences: [testRecipients.returnsTo.licence_refs],
          method: 'Letter or email - Returns to',
          previewLink: null
        },
        {
          contact: ['primary.user@important.com'],
          licences: [testRecipients.primaryUser.licence_refs],
          method: 'Letter or email - Primary user',
          previewLink: `/system/notices/setup/${session.id}/preview/${testRecipients.primaryUser.contact_hash_id}`
        },
        {
          contact: ['primary.user@important.com'],
          licences: [testDuplicateRecipients.duplicatePrimaryUser.licence_refs],
          method: 'Letter or email - Primary user',
          previewLink: `/system/notices/setup/${session.id}/preview/${testDuplicateRecipients.duplicatePrimaryUser.contact_hash_id}`
        },
        {
          contact: ['returns.agent@important.com'],
          licences: [testRecipients.returnsAgent.licence_refs],
          method: 'Letter or email - Returns agent',
          previewLink: `/system/notices/setup/${session.id}/preview/${testRecipients.returnsAgent.contact_hash_id}`
        },
        {
          contact: ['returns.agent@important.com'],
          licences: [testDuplicateRecipients.duplicateReturnsAgent.licence_refs],
          method: 'Letter or email - Returns agent',
          previewLink: `/system/notices/setup/${session.id}/preview/${testDuplicateRecipients.duplicateReturnsAgent.contact_hash_id}`
        }
      ],
      tableCaption: 'Showing all 9 recipients',
      warning: {
        iconFallbackText: 'Warning',
        text: 'A notification will not be sent for Mr H J Returns to because the address is invalid.'
      }
    })
  })

  describe('the "canSendNotice" property', () => {
    describe('when there are no recipients', () => {
      beforeEach(() => {
        recipients = []
      })

      it('returns false', () => {
        const result = CheckPresenter.go(recipients, page, pagination, session)

        expect(result.canSendNotice).to.be.false()
      })
    })

    describe('when there are recipients', () => {
      describe('but they all have invalid addresses', () => {
        beforeEach(() => {
          const invalidRecipient = recipients[3]

          recipients = [invalidRecipient]
        })

        it('returns false', () => {
          const result = CheckPresenter.go(recipients, page, pagination, session)

          expect(result.canSendNotice).to.be.false()
        })
      })

      describe('and some have invalid addresses but the rest are valid', () => {
        it('returns false', () => {
          const result = CheckPresenter.go(recipients, page, pagination, session)

          expect(result.canSendNotice).to.be.true()
        })
      })
    })
  })

  describe('the "links" property', () => {
    describe('when the journey is for "adhoc"', () => {
      beforeEach(() => {
        session.journey = 'adhoc'
      })

      it('should return the links for the "adhoc" journey', () => {
        const result = CheckPresenter.go(recipients, page, pagination, session)
        expect(result.links).to.equal({
          cancel: `/system/notices/setup/${session.id}/cancel`,
          download: `/system/notices/setup/${session.id}/download`,
          manage: `/system/notices/setup/${session.id}/select-recipients`
        })
      })
    })

    describe('when the journey is for "alerts"', () => {
      beforeEach(() => {
        session.journey = 'alerts'
        session.noticeType = 'abstractionAlerts'
        session.referenceCode = generateReferenceCode('WAA')
        session.monitoringStationId = '345'
      })

      it('should return the links for "alerts" journey', () => {
        const result = CheckPresenter.go(recipients, page, pagination, session)

        expect(result.links).to.equal({
          cancel: `/system/notices/setup/${session.id}/cancel`,
          download: `/system/notices/setup/${session.id}/download`
        })
      })
    })

    describe('when the journey is for "standard"', () => {
      it('should return the links for the "standard" journey', () => {
        const result = CheckPresenter.go(recipients, page, pagination, session)
        expect(result.links).to.equal({
          cancel: `/system/notices/setup/${session.id}/cancel`,
          download: `/system/notices/setup/${session.id}/download`,
          removeLicences: `/system/notices/setup/${session.id}/remove-licences`
        })
      })
    })
  })

  describe('the "readyToSend" property', () => {
    describe('when there are no recipients', () => {
      beforeEach(() => {
        recipients = []
      })

      it('returns the message "No recipients with due returns."', () => {
        const result = CheckPresenter.go(recipients, page, pagination, session)

        expect(result.readyToSend).to.equal('No recipients with due returns.')
      })
    })

    describe('when there are recipients', () => {
      describe('but they all have invalid addresses', () => {
        beforeEach(() => {
          const invalidRecipient = recipients[3]

          recipients = [invalidRecipient]
        })

        it('returns the message "No valid notifications to send."', () => {
          const result = CheckPresenter.go(recipients, page, pagination, session)

          expect(result.readyToSend).to.equal('No valid notifications to send.')
        })
      })

      describe('and some have invalid addresses but the rest are valid', () => {
        it('returns the message that the notifications "are ready to send."', () => {
          const result = CheckPresenter.go(recipients, page, pagination, session)

          expect(result.readyToSend).to.equal('Returns invitations are ready to send.')
        })
      })
    })
  })

  describe('the "pageTitle" property', () => {
    describe('and there is only one page of results', () => {
      it('returns the "pageTitle" without page info', () => {
        const result = CheckPresenter.go(recipients, page, pagination, session)

        expect(result.pageTitle).to.equal('Check the recipients')
      })
    })

    describe('and there are multiple pages of results', () => {
      beforeEach(() => {
        pagination.numberOfPages = 3
      })

      it('returns the "pageTitle" with page info', () => {
        const result = CheckPresenter.go(recipients, page, pagination, session)

        expect(result.pageTitle).to.equal('Check the recipients (page 1 of 3)')
      })
    })
  })

  describe('the "recipients" property', () => {
    describe('the "contact" property', () => {
      describe('when the contact is an email', () => {
        it('should return the email address', () => {
          const result = CheckPresenter.go(recipients, page, pagination, session)

          expect(result.recipients[5].contact).to.equal(['primary.user@important.com'])
        })
      })

      describe('when the contact is an address', () => {
        describe('and it is valid', () => {
          it('should return the postal address', () => {
            const result = CheckPresenter.go(recipients, page, pagination, session)

            expect(result.recipients[2].contact).to.equal([
              'Mr H J Licence holder',
              '1',
              'Privet Drive',
              'Little Whinging',
              'Surrey',
              'WD25 7LR'
            ])
          })
        })

        describe('and it is invalid', () => {
          it('should return the postal address flagged as INVALID', () => {
            const result = CheckPresenter.go(recipients, page, pagination, session)

            expect(result.recipients[4].contact).to.equal([
              'Mr H J Returns to',
              'INVALID ADDRESS - Needs a valid postcode or country outside the UK',
              '2',
              'Privet Drive',
              'Little Whinging',
              'Surrey'
            ])
          })
        })
      })
    })

    describe('the "licences" property', () => {
      describe('when the recipient has a single licence number', () => {
        it('should return licence numbers as an array', () => {
          const result = CheckPresenter.go(recipients, page, pagination, session)

          expect(result.recipients[2].licences).to.equal([testRecipients.licenceHolder.licence_refs])
        })
      })

      describe('when the recipient has multiple licence numbers', () => {
        it('should return licence numbers as an array', () => {
          const result = CheckPresenter.go(recipients, page, pagination, session)

          expect(result.recipients[3].licences).to.equal(
            testRecipients.licenceHolderWithMultipleLicences.licence_refs.split(',')
          )
        })
      })
    })

    describe('the "previewLink" property', () => {
      describe('when the journey is for "adhoc"', () => {
        beforeEach(() => {
          session.journey = 'adhoc'
        })

        describe('and the "noticeType" is "invitations"', () => {
          describe('and the method is "letter"', () => {
            describe('and the address is valid', () => {
              it('should return a link to the "preview" page', () => {
                const result = CheckPresenter.go(recipients, page, pagination, session)

                expect(result.recipients[0].previewLink).to.equal(
                  `/system/notices/setup/${session.id}/preview/${testDuplicateRecipients.duplicateLicenceHolder.contact_hash_id}`
                )
              })
            })

            describe('and the address is invalid', () => {
              it('should return null', () => {
                const result = CheckPresenter.go(recipients, page, pagination, session)

                expect(result.recipients[4].previewLink).to.be.null()
              })
            })
          })
        })

        describe('and the "noticeType" is "paperReturn"', () => {
          beforeEach(() => {
            session.noticeType = 'paperReturn'
            session.referenceCode = generateReferenceCode('PRTF')
          })

          it('should return null', () => {
            const result = CheckPresenter.go(recipients, page, pagination, session)

            expect(result.recipients[0].previewLink).to.equal(
              `/system/notices/setup/${session.id}/preview/${testDuplicateRecipients.duplicateLicenceHolder.contact_hash_id}/check-paper-return`
            )
          })
        })
      })

      describe('when the journey is for "alerts"', () => {
        beforeEach(() => {
          session.journey = 'alerts'
          session.noticeType = 'abstractionAlerts'
          session.referenceCode = generateReferenceCode('WAA')
          session.monitoringStationId = '345'
        })

        describe('and the method is "letter"', () => {
          describe('and the address is valid', () => {
            it('should return a link to the "check alert" page', () => {
              const result = CheckPresenter.go(recipients, page, pagination, session)

              expect(result.recipients[0].previewLink).to.equal(
                `/system/notices/setup/${session.id}/preview/${testDuplicateRecipients.duplicateLicenceHolder.contact_hash_id}/check-alert`
              )
            })
          })

          describe('and the address is invalid', () => {
            it('should return null', () => {
              const result = CheckPresenter.go(recipients, page, pagination, session)

              expect(result.recipients[4].previewLink).to.be.null()
            })
          })
        })
      })

      describe('when the journey is for "standard"', () => {
        describe('and the "noticeType" is "invitations"', () => {
          describe('and the method is "letter"', () => {
            describe('and the address is valid', () => {
              it('should return a link to the "preview" page', () => {
                const result = CheckPresenter.go(recipients, page, pagination, session)

                expect(result.recipients[0].previewLink).to.equal(
                  `/system/notices/setup/${session.id}/preview/${testDuplicateRecipients.duplicateLicenceHolder.contact_hash_id}`
                )
              })
            })

            describe('and the address is invalid', () => {
              it('should return null', () => {
                const result = CheckPresenter.go(recipients, page, pagination, session)

                expect(result.recipients[4].previewLink).to.be.null()
              })
            })
          })
        })

        describe('and the "noticeType" is "reminders"', () => {
          beforeEach(() => {
            session.noticeType = 'reminders'
            session.referenceCode = generateReferenceCode('RREM')
          })

          describe('and the method is "letter"', () => {
            describe('and the address is valid', () => {
              it('should return a link to the "preview" page', () => {
                const result = CheckPresenter.go(recipients, page, pagination, session)

                expect(result.recipients[0].previewLink).to.equal(
                  `/system/notices/setup/${session.id}/preview/${testDuplicateRecipients.duplicateLicenceHolder.contact_hash_id}`
                )
              })
            })

            describe('and the address is invalid', () => {
              it('should return null', () => {
                const result = CheckPresenter.go(recipients, page, pagination, session)

                expect(result.recipients[4].previewLink).to.be.null()
              })
            })
          })
        })
      })
    })

    describe('when there are <= 25 recipients ', () => {
      it('returns all the recipients', () => {
        const result = CheckPresenter.go(recipients, page, pagination, session)

        expect(result.recipients.length).to.equal(recipients.length)
      })
    })

    describe('when there are >= 25 recipients', () => {
      beforeEach(() => {
        recipients = [...recipients, ...recipients, ...recipients]

        pagination = {
          numberOfPages: 2
        }
      })

      describe('and the page is 1', () => {
        it('returns the first 25 recipients', () => {
          const result = CheckPresenter.go(recipients, page, pagination, session)

          expect(result.recipients.length).to.equal(25)
        })

        it('returns the updated "pageTitle"', () => {
          const result = CheckPresenter.go(recipients, page, pagination, session)

          expect(result.pageTitle).to.equal('Check the recipients (page 1 of 2)')
        })
      })

      describe('and there is more than one page', () => {
        beforeEach(() => {
          page = '2'
        })

        it('returns the remaining recipients', () => {
          const result = CheckPresenter.go(recipients, page, pagination, session)

          expect(result.recipients.length).to.equal(2)
        })

        it('returns the updated "pageTitle"', () => {
          const result = CheckPresenter.go(recipients, page, pagination, session)

          expect(result.pageTitle).to.equal('Check the recipients (page 2 of 2)')
        })
      })
    })
  })

  describe('the "tableCaption" property', () => {
    describe('when there is only one page of results', () => {
      it('returns the "tableCaption" with the "Showing all" message', () => {
        const result = CheckPresenter.go(recipients, page, pagination, session)

        expect(result.tableCaption).to.equal(`Showing all ${recipients.length} recipients`)
      })
    })

    describe('when there are multiple pages of results', () => {
      beforeEach(() => {
        for (let i = 0; i < 25; i++) {
          const padding = recipients[0]

          padding.email = `${generateUUID()}@example.com`

          recipients.push({ ...padding })
        }
      })

      it('returns the "tableCaption" with the "Showing x of y" message', () => {
        const result = CheckPresenter.go(recipients, page, pagination, session)

        expect(result.tableCaption).to.equal(`Showing 25 of ${recipients.length} recipients`)
      })
    })
  })

  describe('the "warning" property', () => {
    describe('when there are no recipients with invalid addresses', () => {
      beforeEach(() => {
        recipients[3].contact.postcode = 'WD25 7LR'
      })

      it('returns null', () => {
        const result = CheckPresenter.go(recipients, page, pagination, session)

        expect(result.warning).to.be.null()
      })
    })

    describe('when there is one recipient with an invalid address', () => {
      it('returns a warning for that recipient', () => {
        const result = CheckPresenter.go(recipients, page, pagination, session)

        expect(result.warning).to.equal({
          iconFallbackText: 'Warning',
          text: 'A notification will not be sent for Mr H J Returns to because the address is invalid.'
        })
      })
    })

    describe('when there are multiple recipients with an invalid addresses', () => {
      beforeEach(() => {
        recipients[2].contact.postcode = null
      })

      it('returns a warning that lists the recipients', () => {
        const result = CheckPresenter.go(recipients, page, pagination, session)

        expect(result.warning).to.equal({
          iconFallbackText: 'Warning',
          text: 'Notifications will not be sent for the following recipients with invalid addresses: Mr H J Licence holder, Mr H J Returns to'
        })
      })
    })
  })
})
