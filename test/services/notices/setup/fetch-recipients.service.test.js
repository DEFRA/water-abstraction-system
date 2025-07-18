'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceDocumentHeaderSeeder = require('../../../support/seeders/licence-document-header.seeder.js')

// Thing under test
const FetchRecipientsService = require('../../../../app/services/notices/setup/fetch-recipients.service.js')

describe('Notices - Setup - Fetch recipients service', () => {
  const dueDate = '2025-04-28'

  let recipients
  let session

  before(async () => {
    recipients = await LicenceDocumentHeaderSeeder.seed(true, dueDate)
  })

  describe('when the "journey" is for notifications', () => {
    let removeLicences

    beforeEach(() => {
      removeLicences = ''
      session = {
        journey: 'invitations',
        returnsPeriod: 'allYear',
        removeLicences,
        determinedReturnsPeriod: {
          name: 'allYear',
          dueDate,
          endDate: '2024-03-31',
          summer: 'false',
          startDate: '2023-04-01'
        }
      }
    })

    describe('when there is a "primary user"', () => {
      it('correctly returns the "primary user" instead of the "Licence holder"', async () => {
        const result = await FetchRecipientsService.go(session)

        const [testRecipient] = result.filter((res) => {
          return res.licence_refs.includes(recipients.primaryUser.licenceRef)
        })

        expect(testRecipient).to.equal({
          licence_refs: recipients.primaryUser.licenceRef,
          contact: null,
          contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
          contact_type: 'Primary user',
          email: 'primary.user@important.com'
        })
      })

      describe('and there is a "returns agent" (known as userReturns in the DB)', () => {
        it('correctly returns the "returns agent" as well as the primary user', async () => {
          const result = await FetchRecipientsService.go(session)

          const [, testRecipientReturnsAgent] = result.filter((res) => {
            return res.licence_refs.includes(recipients.primaryUser.licenceRef)
          })

          expect(testRecipientReturnsAgent).to.equal({
            licence_refs: recipients.primaryUser.licenceRef,
            contact: null,
            contact_hash_id: '2e6918568dfbc1d78e2fbe279aaee990',
            contact_type: 'Returns agent',
            email: 'returns.agent@important.com'
          })
        })
      })
    })

    describe('when the licence number only has one recipient which has the "licence holder" role', () => {
      it('correctly returns the licence holder data', async () => {
        const result = await FetchRecipientsService.go(session)

        const [testRecipient] = result.filter((res) => {
          return res.licence_refs.includes(recipients.licenceHolder.licenceRef)
        })

        expect(testRecipient).to.equal({
          licence_refs: recipients.licenceHolder.licenceRef,
          contact: {
            addressLine1: '4',
            addressLine2: 'Privet Drive',
            addressLine3: null,
            addressLine4: null,
            country: null,
            county: 'Surrey',
            forename: 'Harry',
            initials: 'J',
            name: 'Licence holder only',
            postcode: 'WD25 7LR',
            role: 'Licence holder',
            salutation: null,
            town: 'Little Whinging',
            type: 'Person'
          },
          contact_hash_id: '22f6457b6be9fd63d8a9a8dd2ed61214',
          contact_type: 'Licence holder',
          email: null
        })
      })
    })

    describe('when the licence has one recipient which has both the "licence holder" and "Returns to" role', () => {
      it('correctly returns the licence holder and returns to data', async () => {
        const result = await FetchRecipientsService.go(session)

        const [licenceHolder, returnsTo] = result.filter((res) => {
          return res.licence_refs.includes(recipients.licenceHolderAndReturnTo.licenceRef)
        })

        expect(licenceHolder).to.equal({
          licence_refs: recipients.licenceHolderAndReturnTo.licenceRef,
          contact: {
            addressLine1: '4',
            addressLine2: 'Privet Drive',
            addressLine3: null,
            addressLine4: null,
            country: null,
            county: 'Surrey',
            forename: 'Harry',
            initials: 'J',
            name: 'Licence holder and returns to',
            postcode: 'WD25 7LR',
            role: 'Licence holder',
            salutation: null,
            town: 'Little Whinging',
            type: 'Person'
          },
          contact_hash_id: 'b1b355491c7d42778890c545e08797ea',
          contact_type: 'Licence holder',
          email: null
        })

        expect(returnsTo).to.equal({
          licence_refs: recipients.licenceHolderAndReturnTo.licenceRef,
          contact: {
            addressLine1: '4',
            addressLine2: 'Privet Drive',
            addressLine3: null,
            addressLine4: null,
            country: null,
            county: 'Surrey',
            forename: 'Harry',
            initials: 'J',
            name: 'Licence holder and returns to',
            postcode: 'WD25 7LR',
            role: 'Returns to',
            salutation: null,
            town: 'Little Whinging',
            type: 'Person'
          },
          contact_hash_id: 'b1b355491c7d42778890c545e08797ea',
          contact_type: 'Returns to',
          email: null
        })
      })
    })

    describe('when there are licence to exclude from the recipients', () => {
      beforeEach(() => {
        removeLicences = recipients.primaryUser.licenceRef

        session.removeLicences = removeLicences
      })

      it('correctly returns recipients without the "removeLicences"', async () => {
        const result = await FetchRecipientsService.go(session)

        const [testRecipient] = result.filter((res) => {
          return res.licence_refs.includes(recipients.primaryUser.licenceRef)
        })

        expect(testRecipient).to.be.undefined()
      })
    })
  })

  describe('when the a licence ref has been chosen', () => {
    describe('when there is a "primary user"', () => {
      beforeEach(() => {
        session = { licenceRef: recipients.primaryUser.licenceRef }
      })

      it('correctly returns the "primary user" instead of the "Licence holder"', async () => {
        const result = await FetchRecipientsService.go(session)

        const [testRecipient] = result.filter((res) => {
          return res.licence_refs.includes(recipients.primaryUser.licenceRef)
        })

        expect(testRecipient).to.equal({
          licence_refs: recipients.primaryUser.licenceRef,
          contact: null,
          contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
          contact_type: 'Primary user',
          email: 'primary.user@important.com'
        })
      })

      describe('and there is a "returns agent" (known as userReturns in the DB)', () => {
        beforeEach(() => {
          session = { licenceRef: recipients.primaryUser.licenceRef }
        })

        it('correctly returns the "returns agent" as well as the primary user', async () => {
          const result = await FetchRecipientsService.go(session)

          const [, testRecipientReturnsAgent] = result.filter((res) => {
            return res.licence_refs.includes(recipients.primaryUser.licenceRef)
          })

          expect(testRecipientReturnsAgent).to.equal({
            licence_refs: recipients.primaryUser.licenceRef,
            contact: null,
            contact_hash_id: '2e6918568dfbc1d78e2fbe279aaee990',
            contact_type: 'Returns agent',
            email: 'returns.agent@important.com'
          })
        })
      })
    })

    describe('when the licence number only has one recipient which has the "licence holder" role', () => {
      beforeEach(() => {
        session = { licenceRef: recipients.licenceHolder.licenceRef }
      })

      it('correctly returns the licence holder data', async () => {
        const result = await FetchRecipientsService.go(session)

        const [testRecipient] = result.filter((res) => {
          return res.licence_refs.includes(recipients.licenceHolder.licenceRef)
        })

        expect(testRecipient).to.equal({
          licence_refs: recipients.licenceHolder.licenceRef,
          contact: {
            addressLine1: '4',
            addressLine2: 'Privet Drive',
            addressLine3: null,
            addressLine4: null,
            country: null,
            county: 'Surrey',
            forename: 'Harry',
            initials: 'J',
            name: 'Licence holder only',
            postcode: 'WD25 7LR',
            role: 'Licence holder',
            salutation: null,
            town: 'Little Whinging',
            type: 'Person'
          },
          contact_hash_id: '22f6457b6be9fd63d8a9a8dd2ed61214',
          contact_type: 'Licence holder',
          email: null
        })
      })
    })

    describe('when the licence has one recipient which has both the "licence holder" and "Returns to" role', () => {
      beforeEach(() => {
        session = { licenceRef: recipients.licenceHolderAndReturnTo.licenceRef }
      })

      it('correctly returns the licence holder and returns to data', async () => {
        const result = await FetchRecipientsService.go(session)

        const [licenceHolder, returnsTo] = result.filter((res) => {
          return res.licence_refs.includes(recipients.licenceHolderAndReturnTo.licenceRef)
        })

        expect(licenceHolder).to.equal({
          licence_refs: recipients.licenceHolderAndReturnTo.licenceRef,
          contact: {
            addressLine1: '4',
            addressLine2: 'Privet Drive',
            addressLine3: null,
            addressLine4: null,
            country: null,
            county: 'Surrey',
            forename: 'Harry',
            initials: 'J',
            name: 'Licence holder and returns to',
            postcode: 'WD25 7LR',
            role: 'Licence holder',
            salutation: null,
            town: 'Little Whinging',
            type: 'Person'
          },
          contact_hash_id: 'b1b355491c7d42778890c545e08797ea',
          contact_type: 'Licence holder',
          email: null
        })

        expect(returnsTo).to.equal({
          licence_refs: recipients.licenceHolderAndReturnTo.licenceRef,
          contact: {
            addressLine1: '4',
            addressLine2: 'Privet Drive',
            addressLine3: null,
            addressLine4: null,
            country: null,
            county: 'Surrey',
            forename: 'Harry',
            initials: 'J',
            name: 'Licence holder and returns to',
            postcode: 'WD25 7LR',
            role: 'Returns to',
            salutation: null,
            town: 'Little Whinging',
            type: 'Person'
          },
          contact_hash_id: 'b1b355491c7d42778890c545e08797ea',
          contact_type: 'Returns to',
          email: null
        })
      })
    })
  })
})
