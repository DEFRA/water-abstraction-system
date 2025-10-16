'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceDocumentHeaderSeeder = require('../../../support/seeders/licence-document-header.seeder.js')

// Thing under test
const FetchReturnsRecipientsService = require('../../../../app/services/notices/setup/fetch-returns-recipients.service.js')

// TODO add the dedup check - licences should be squashed, primary user should override licence holder - only primary user returns
describe('Notices - Setup - Fetch returns recipients service', () => {
  let dueDate
  let recipients
  let session
  let enableReturnsAgent

  describe('when the "journey" is for notifications', () => {
    let removeLicences

    beforeEach(() => {
      session = {
        journey: 'invitations',
        returnsPeriod: 'allYear',
        removeLicences,
        determinedReturnsPeriod: {
          name: 'allYear',
          dueDate: null,
          endDate: '2024-03-31',
          summer: 'false',
          startDate: '2023-04-01'
        }
      }
    })

    describe('when there is a "primary user"', () => {
      beforeEach(async () => {
        dueDate = '2025-04-28'

        enableReturnsAgent = false

        recipients = await LicenceDocumentHeaderSeeder.seedPrimaryUser(true, dueDate, '2023-01-31', enableReturnsAgent)

        removeLicences = ''

        session.determinedReturnsPeriod.dueDate = dueDate
      })

      it('correctly returns the "primary user" instead of the "Licence holder"', async () => {
        const result = await FetchReturnsRecipientsService.go(session)

        expect(result).to.equal([
          {
            licence_refs: recipients.primaryUser.licenceRef,
            contact: null,
            contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
            contact_type: 'Primary user',
            email: 'primary.user@important.com'
          }
        ])
      })

      describe('and there is a "returns agent" (known as userReturns in the DB)', () => {
        beforeEach(async () => {
          dueDate = '2025-05-06'

          enableReturnsAgent = true

          recipients = await LicenceDocumentHeaderSeeder.seedPrimaryUser(
            true,
            dueDate,
            '2023-01-31',
            enableReturnsAgent
          )

          removeLicences = ''

          session.determinedReturnsPeriod.dueDate = dueDate
        })

        it('correctly returns the "returns agent" as well as the primary user', async () => {
          const result = await FetchReturnsRecipientsService.go(session)

          expect(result).to.equal([
            {
              licence_refs: recipients.primaryUser.licenceRef,
              contact: null,
              contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
              contact_type: 'Primary user',
              email: 'primary.user@important.com'
            },
            {
              licence_refs: recipients.primaryUser.licenceRef,
              contact: null,
              contact_hash_id: '2e6918568dfbc1d78e2fbe279aaee990',
              contact_type: 'Returns agent',
              email: 'returns.agent@important.com'
            }
          ])
        })
      })
    })

    describe('when the licence number only has one recipient which has the "licence holder" role', () => {
      beforeEach(async () => {
        dueDate = '2025-05-01'

        enableReturnsAgent = false

        recipients = await LicenceDocumentHeaderSeeder.seedLicenceHolder(true, dueDate)

        session.determinedReturnsPeriod.dueDate = dueDate
      })

      it('correctly returns the licence holder data', async () => {
        const result = await FetchReturnsRecipientsService.go(session)

        expect(result).to.equal([
          {
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
              name: 'Licence holder',
              postcode: 'WD25 7LR',
              role: 'Licence holder',
              salutation: null,
              town: 'Little Whinging',
              type: 'Person'
            },
            contact_hash_id: '0cad692217f572faede404363b2625c9',
            contact_type: 'Licence holder',
            email: null
          }
        ])
      })
    })

    describe('when the licence has one recipient which has both the "licence holder" and "Returns to" role', () => {
      beforeEach(async () => {
        dueDate = '2025-05-02'

        enableReturnsAgent = false

        recipients = await LicenceDocumentHeaderSeeder.seedLicenceHolderAndReturnToSameRef(true, dueDate)

        session.determinedReturnsPeriod.dueDate = dueDate
      })

      it('correctly returns the licence holder and returns to data (the contact hash does not match)', async () => {
        const result = await FetchReturnsRecipientsService.go(session)

        expect(result).to.equal([
          {
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
              name: 'Licence holder',
              postcode: 'WD25 7LR',
              role: 'Licence holder',
              salutation: null,
              town: 'Little Whinging',
              type: 'Person'
            },
            contact_hash_id: '0cad692217f572faede404363b2625c9',
            contact_type: 'Licence holder',
            email: null
          },
          {
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
              name: 'Returns to',
              postcode: 'WD25 7LR',
              role: 'Returns to',
              salutation: null,
              town: 'Little Whinging',
              type: 'Person'
            },
            contact_hash_id: 'b046e48491a53f02ea02c4f05e1b0711',
            contact_type: 'Returns to',
            email: null
          }
        ])
      })
    })

    describe('when there are licence to exclude from the recipients', () => {
      beforeEach(async () => {
        dueDate = '2025-05-03'

        enableReturnsAgent = false

        recipients = await LicenceDocumentHeaderSeeder.seedPrimaryUser(true, dueDate, '2023-01-31', enableReturnsAgent)

        removeLicences = recipients.primaryUser.licenceRef

        session.removeLicences = removeLicences
        session.determinedReturnsPeriod.dueDate = dueDate
      })

      it('correctly returns recipients without the "removeLicences"', async () => {
        const result = await FetchReturnsRecipientsService.go(session)

        const [testRecipient] = result.filter((res) => {
          return res.licence_refs.includes(recipients.primaryUser.licenceRef)
        })

        expect(testRecipient).to.be.undefined()
      })
    })
  })

  describe('when the a licence ref has been chosen', () => {
    describe('when there is a "primary user"', () => {
      beforeEach(async () => {
        dueDate = '2025-05-04'

        enableReturnsAgent = false

        recipients = await LicenceDocumentHeaderSeeder.seedPrimaryUser(true, dueDate, '2023-01-31', enableReturnsAgent)

        session = { licenceRef: recipients.primaryUser.licenceRef }
      })

      it('correctly returns the "primary user" instead of the "Licence holder"', async () => {
        const result = await FetchReturnsRecipientsService.go(session)

        expect(result).to.equal([
          {
            licence_refs: recipients.primaryUser.licenceRef,
            contact: null,
            contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
            contact_type: 'Primary user',
            email: 'primary.user@important.com'
          }
        ])
      })

      describe('and there is a "returns agent" (known as userReturns in the DB)', () => {
        beforeEach(async () => {
          dueDate = '2025-05-04'

          enableReturnsAgent = true

          recipients = await LicenceDocumentHeaderSeeder.seedPrimaryUser(
            true,
            dueDate,
            '2023-01-31',
            enableReturnsAgent
          )

          session = { licenceRef: recipients.primaryUser.licenceRef }
        })

        it('correctly returns the "returns agent" as well as the primary user', async () => {
          const result = await FetchReturnsRecipientsService.go(session)

          expect(result).to.equal([
            {
              licence_refs: recipients.primaryUser.licenceRef,
              contact: null,
              contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
              contact_type: 'Primary user',
              email: 'primary.user@important.com'
            },
            {
              licence_refs: recipients.primaryUser.licenceRef,
              contact: null,
              contact_hash_id: '2e6918568dfbc1d78e2fbe279aaee990',
              contact_type: 'Returns agent',
              email: 'returns.agent@important.com'
            }
          ])
        })
      })
    })

    describe('when the licence number only has one recipient which has the "licence holder" role', () => {
      beforeEach(async () => {
        dueDate = '2025-05-05'

        enableReturnsAgent = true

        recipients = await LicenceDocumentHeaderSeeder.seedLicenceHolder(true, dueDate, '2023-01-31')

        session = { licenceRef: recipients.licenceHolder.licenceRef }
      })

      it('correctly returns the licence holder data', async () => {
        const result = await FetchReturnsRecipientsService.go(session)

        expect(result).to.equal([
          {
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
              name: 'Licence holder',
              postcode: 'WD25 7LR',
              role: 'Licence holder',
              salutation: null,
              town: 'Little Whinging',
              type: 'Person'
            },
            contact_hash_id: '0cad692217f572faede404363b2625c9',
            contact_type: 'Licence holder',
            email: null
          }
        ])
      })
    })

    describe('when the licence has one recipient which has both the "licence holder" and "Returns to" role', () => {
      beforeEach(async () => {
        dueDate = '2025-05-05'

        enableReturnsAgent = true

        recipients = await LicenceDocumentHeaderSeeder.seedLicenceHolderAndReturnToSameRef(true, dueDate, '2023-01-31')

        session = { licenceRef: recipients.licenceHolderAndReturnTo.licenceRef }
      })

      it('correctly returns the licence holder and returns to data', async () => {
        const result = await FetchReturnsRecipientsService.go(session)

        expect(result).to.equal([
          {
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
              name: 'Licence holder',
              postcode: 'WD25 7LR',
              role: 'Licence holder',
              salutation: null,
              town: 'Little Whinging',
              type: 'Person'
            },
            contact_hash_id: '0cad692217f572faede404363b2625c9',
            contact_type: 'Licence holder',
            email: null
          },
          {
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
              name: 'Returns to',
              postcode: 'WD25 7LR',
              role: 'Returns to',
              salutation: null,
              town: 'Little Whinging',
              type: 'Person'
            },
            contact_hash_id: 'b046e48491a53f02ea02c4f05e1b0711',
            contact_type: 'Returns to',
            email: null
          }
        ])
      })
    })
  })
})
