'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceDocumentHeaderSeeder = require('../../../support/seeders/licence-document-header.seeder.js')
const ReturnLogModel = require('../../../../app/models/return-log.model.js')

// Thing under test
const FetchDownloadRecipientsService = require('../../../../app/services/notices/setup/fetch-download-recipients.service.js')

describe.skip('Notices - Setup - Fetch Download Recipients service', () => {
  const endDate = new Date('2023-03-31')
  const startDate = new Date('2022-04-01')

  let session
  let dueDate
  let removeLicences
  let testRecipients
  let enableReturnsAgent

  describe('when there is no licence ref', () => {
    beforeEach(() => {
      removeLicences = ''

      session = {
        returnsPeriod: 'allYear',
        removeLicences,
        determinedReturnsPeriod: {
          name: 'allYear',
          dueDate: null,
          endDate: '2023-03-31',
          summer: 'false',
          startDate: '2022-04-01'
        }
      }
    })

    describe('when there are recipients', () => {
      describe('when there is a "primary user"', () => {
        beforeEach(async () => {
          dueDate = '2025-05-10'

          enableReturnsAgent = true

          testRecipients = await LicenceDocumentHeaderSeeder.seedPrimaryUser(dueDate, enableReturnsAgent)

          session.determinedReturnsPeriod.dueDate = dueDate
        })

        it('correctly returns "Primary user" and "Returns agent" contacts', async () => {
          const result = await FetchDownloadRecipientsService.go(session)

          // We need to check the length of the result as the licence refs could be in a different order, this is why
          // we do not check the whole result
          expect(result.length).to.equal(2)

          const primaryUser = result.find((item) => {
            return item.contact_type === 'Primary user'
          })
          const returnsAgent = result.find((item) => {
            return item.contact_type === 'Returns agent'
          })

          expect(primaryUser).to.equal({
            contact: null,
            contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
            contact_type: 'Primary user',
            due_date: new Date(dueDate),
            email: 'primary.user@important.com',
            end_date: endDate,
            licence_ref: testRecipients.primaryUser.licenceRef,
            return_reference: testRecipients.primaryUser.returnLog.returnReference,
            start_date: startDate
          })

          expect(returnsAgent).to.equal({
            contact: null,
            contact_hash_id: '2e6918568dfbc1d78e2fbe279aaee990',
            contact_type: 'Returns agent',
            due_date: new Date(dueDate),
            email: 'returns.agent@important.com',
            end_date: endDate,
            licence_ref: testRecipients.primaryUser.licenceRef,
            return_reference: testRecipients.primaryUser.returnLog.returnReference,
            start_date: startDate
          })
        })
      })

      describe('when the licence number only has one recipient which has the "licence holder" role', () => {
        beforeEach(async () => {
          dueDate = '2025-05-12'

          enableReturnsAgent = false

          testRecipients = await LicenceDocumentHeaderSeeder.seedLicenceHolder(dueDate)

          session.determinedReturnsPeriod.dueDate = dueDate
        })

        it('correctly returns "Licence holder" contact', async () => {
          const result = await FetchDownloadRecipientsService.go(session)

          const found = result.filter((item) => {
            return item.licence_ref === testRecipients.licenceHolder.licenceRef
          })

          expect(found).to.equal([
            {
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
              due_date: new Date(dueDate),
              email: null,
              end_date: endDate,
              licence_ref: testRecipients.licenceHolder.licenceRef,
              return_reference: testRecipients.licenceHolder.returnLog.returnReference,
              start_date: startDate
            }
          ])
        })
      })

      describe('when the licence has one recipient which has both the "licence holder" and "Returns to" role', () => {
        beforeEach(async () => {
          dueDate = '2025-05-13'

          enableReturnsAgent = false

          testRecipients = await LicenceDocumentHeaderSeeder.seedLicenceHolderAndReturnToSameRef(dueDate)

          session.determinedReturnsPeriod.dueDate = dueDate
        })

        it('correctly returns duplicate "Licence holder" and "Returns to" contacts', async () => {
          const result = await FetchDownloadRecipientsService.go(session)

          expect(result).to.equal([
            {
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
              due_date: new Date(dueDate),
              email: null,
              end_date: endDate,
              licence_ref: testRecipients.licenceHolderAndReturnTo.licenceRef,
              return_reference: testRecipients.licenceHolderAndReturnTo.returnLog.returnReference,
              start_date: startDate
            },
            {
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
              due_date: new Date(dueDate),
              email: null,
              end_date: endDate,
              licence_ref: testRecipients.licenceHolderAndReturnTo.licenceRef,
              return_reference: testRecipients.licenceHolderAndReturnTo.returnLog.returnReference,
              start_date: startDate
            }
          ])
        })
      })

      describe('and there are licence to exclude from the recipients', () => {
        beforeEach(async () => {
          dueDate = '2025-05-14'

          enableReturnsAgent = false

          enableReturnsAgent = true

          const primarySeed = await LicenceDocumentHeaderSeeder.seedPrimaryUser(dueDate, enableReturnsAgent)

          removeLicences = primarySeed.primaryUser.licenceRef

          // add a licence holder
          testRecipients = await LicenceDocumentHeaderSeeder.seedLicenceHolder(dueDate)

          session.removeLicences = removeLicences
          session.determinedReturnsPeriod.dueDate = dueDate
        })

        it('correctly returns recipients without the "removeLicences"', async () => {
          const result = await FetchDownloadRecipientsService.go(session)

          expect(result).to.equal([
            {
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
              due_date: new Date(dueDate),
              email: null,
              end_date: endDate,
              licence_ref: testRecipients.licenceHolder.licenceRef,
              return_reference: testRecipients.licenceHolder.returnLog.returnReference,
              start_date: startDate
            }
          ])
        })
      })
    })
  })

  describe('when there is a licence ref', () => {
    describe('when there are recipients', () => {
      describe('when there is a "primary user"', () => {
        beforeEach(async () => {
          dueDate = '2025-05-15'

          enableReturnsAgent = true

          testRecipients = await LicenceDocumentHeaderSeeder.seedPrimaryUser(dueDate, enableReturnsAgent)

          session = { licenceRef: testRecipients.primaryUser.licenceRef }
        })

        it('correctly returns "Primary user" and "Returns agent" contacts', async () => {
          const result = await FetchDownloadRecipientsService.go(session)

          expect(result.length).to.equal(2)

          const primaryUser = result.find((item) => {
            return item.contact_type === 'Primary user'
          })
          const returnsAgent = result.find((item) => {
            return item.contact_type === 'Returns agent'
          })

          expect(primaryUser).to.equal({
            contact: null,
            contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
            contact_type: 'Primary user',
            due_date: new Date(dueDate),
            email: 'primary.user@important.com',
            end_date: endDate,
            licence_ref: testRecipients.primaryUser.licenceRef,
            return_reference: testRecipients.primaryUser.returnLog.returnReference,
            start_date: startDate
          })

          expect(returnsAgent).to.equal({
            contact: null,
            contact_hash_id: '2e6918568dfbc1d78e2fbe279aaee990',
            contact_type: 'Returns agent',
            due_date: new Date(dueDate),
            email: 'returns.agent@important.com',
            end_date: endDate,
            licence_ref: testRecipients.primaryUser.licenceRef,
            return_reference: testRecipients.primaryUser.returnLog.returnReference,
            start_date: startDate
          })
        })
      })

      describe('when the licence number only has one recipient which has the "licence holder" role', () => {
        beforeEach(async () => {
          dueDate = '2025-05-17'

          enableReturnsAgent = true

          testRecipients = await LicenceDocumentHeaderSeeder.seedLicenceHolder(dueDate)

          session = { licenceRef: testRecipients.licenceHolder.licenceRef }
        })

        it('correctly returns "Licence holder" contact', async () => {
          const result = await FetchDownloadRecipientsService.go(session)

          expect(result).to.equal([
            {
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
              due_date: new Date(dueDate),
              email: null,
              end_date: endDate,
              licence_ref: testRecipients.licenceHolder.licenceRef,
              return_reference: testRecipients.licenceHolder.returnLog.returnReference,
              start_date: startDate
            }
          ])
        })
      })

      describe('when the licence has one recipient which has both the "licence holder" and "Returns to" role', () => {
        beforeEach(async () => {
          dueDate = '2025-05-16'

          enableReturnsAgent = true

          testRecipients = await LicenceDocumentHeaderSeeder.seedLicenceHolderAndReturnToSameRef(dueDate)

          session = { licenceRef: testRecipients.licenceHolderAndReturnTo.licenceRef }
        })

        it('correctly returns duplicate "Licence holder" and "Returns to" contacts', async () => {
          const result = await FetchDownloadRecipientsService.go(session)

          expect(result).to.equal([
            {
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
              due_date: new Date(dueDate),
              email: null,
              end_date: endDate,
              licence_ref: testRecipients.licenceHolderAndReturnTo.licenceRef,
              return_reference: testRecipients.licenceHolderAndReturnTo.returnLog.returnReference,
              start_date: startDate
            },
            {
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
              due_date: new Date(dueDate),
              email: null,
              end_date: endDate,
              licence_ref: testRecipients.licenceHolderAndReturnTo.licenceRef,
              return_reference: testRecipients.licenceHolderAndReturnTo.returnLog.returnReference,
              start_date: startDate
            }
          ])
        })
      })
    })

    describe('when the end date is greater than today', () => {
      beforeEach(async () => {
        testRecipients = await LicenceDocumentHeaderSeeder.seedPrimaryUser(dueDate)

        // Update the end date to be in the future
        await ReturnLogModel.query().findById(testRecipients.primaryUser.returnLog.id).patch({ endDate: '3000-01-01' })

        session = { licenceRef: testRecipients.primaryUser.licenceRef }
      })

      it('correctly returns an empty array (no return logs found)', async () => {
        const result = await FetchDownloadRecipientsService.go(session)

        expect(result).to.equal([])
      })
    })
  })
})
