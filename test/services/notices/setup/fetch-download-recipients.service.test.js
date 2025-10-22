'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceDocumentHeaderSeeder = require('../../../support/seeders/licence-document-header.seeder.js')

// Thing under test
const FetchDownloadRecipientsService = require('../../../../app/services/notices/setup/fetch-download-recipients.service.js')

// TODO: All these test use 'include', other tests like this can check the whole result as the query has been update to remove duplicates. This will be updated
describe('Notices - Setup - Fetch Download Recipients service', () => {
  let seedData
  let session

  before(async () => {
    session = {}

    seedData = await LicenceDocumentHeaderSeeder.seed('2025-03-')
  })

  describe('when the licence is registered ', () => {
    beforeEach(() => {
      session = {
        journey: 'invitations',
        returnsPeriod: 'allYear',
        determinedReturnsPeriod: {
          name: 'allYear',
          dueDate: null,
          endDate: '2024-03-31',
          summer: 'false',
          startDate: '2023-04-01'
        }
      }
    })

    describe('and there is a "primary user"', () => {
      beforeEach(async () => {
        session.determinedReturnsPeriod.dueDate = seedData.primaryUser.returnLog.dueDate
      })

      it('returns the "primary user" ', async () => {
        const result = await FetchDownloadRecipientsService.go(session)

        expect(result).to.include({
          contact: null,
          contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
          contact_type: 'Primary user',
          due_date: seedData.primaryUser.returnLog.dueDate,
          end_date: seedData.primaryUser.returnLog.endDate,
          email: 'primary.user@important.com',
          licence_ref: seedData.primaryUser.licenceRef,
          return_reference: seedData.primaryUser.returnLog.returnReference,
          start_date: seedData.primaryUser.returnLog.startDate
        })
      })

      describe('and "returns agent" with different emails', () => {
        beforeEach(async () => {
          session.determinedReturnsPeriod.dueDate = seedData.primaryUserAndReturnsAgent.returnLog.dueDate
        })

        it('returns both the "primary user" and "returns agent"', async () => {
          const result = await FetchDownloadRecipientsService.go(session)

          expect(result).to.include({
            contact: null,
            contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
            contact_type: 'Primary user',
            due_date: seedData.primaryUserAndReturnsAgent.returnLog.dueDate,
            end_date: seedData.primaryUserAndReturnsAgent.returnLog.endDate,
            email: 'primary.user@important.com',
            licence_ref: seedData.primaryUserAndReturnsAgent.licenceRef,
            return_reference: seedData.primaryUserAndReturnsAgent.returnLog.returnReference,
            start_date: seedData.primaryUserAndReturnsAgent.returnLog.startDate
          })

          expect(result).to.include({
            contact: null,
            contact_hash_id: '2e6918568dfbc1d78e2fbe279aaee990',
            contact_type: 'Returns agent',
            due_date: seedData.primaryUserAndReturnsAgent.returnLog.dueDate,
            end_date: seedData.primaryUserAndReturnsAgent.returnLog.endDate,
            email: 'returns.agent@important.com',
            licence_ref: seedData.primaryUserAndReturnsAgent.licenceRef,
            return_reference: seedData.primaryUserAndReturnsAgent.returnLog.returnReference,
            start_date: seedData.primaryUserAndReturnsAgent.returnLog.startDate
          })
        })
      })

      describe('and "returns agent" with the same email', () => {
        beforeEach(async () => {
          session.determinedReturnsPeriod.dueDate =
            seedData.primaryUserAndReturnsAgentWithTheSameEmail.returnLog.dueDate
        })

        it('returns the "primary user" ', async () => {
          const result = await FetchDownloadRecipientsService.go(session)

          expect(result).to.include({
            contact: null,
            contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
            contact_type: 'Primary user',
            due_date: seedData.primaryUserAndReturnsAgentWithTheSameEmail.returnLog.dueDate,
            end_date: seedData.primaryUserAndReturnsAgentWithTheSameEmail.returnLog.endDate,
            email: 'primary.user@important.com',
            licence_ref: seedData.primaryUserAndReturnsAgentWithTheSameEmail.licenceRef,
            return_reference: seedData.primaryUserAndReturnsAgentWithTheSameEmail.returnLog.returnReference,
            start_date: seedData.primaryUserAndReturnsAgentWithTheSameEmail.returnLog.startDate
          })

          // Returns agent contact hash / email match the primary user
          expect(result).to.include({
            contact: null,
            contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
            contact_type: 'Returns agent',
            due_date: seedData.primaryUserAndReturnsAgentWithTheSameEmail.returnLog.dueDate,
            end_date: seedData.primaryUserAndReturnsAgentWithTheSameEmail.returnLog.endDate,
            email: 'primary.user@important.com',
            licence_ref: seedData.primaryUserAndReturnsAgentWithTheSameEmail.licenceRef,
            return_reference: seedData.primaryUserAndReturnsAgentWithTheSameEmail.returnLog.returnReference,
            start_date: seedData.primaryUserAndReturnsAgentWithTheSameEmail.returnLog.startDate
          })
        })
      })
    })
  })

  describe('when the licence is unregistered', () => {
    beforeEach(() => {
      session = {
        journey: 'invitations',
        returnsPeriod: 'allYear',
        determinedReturnsPeriod: {
          name: 'allYear',
          dueDate: null,
          endDate: '2024-03-31',
          summer: 'false',
          startDate: '2023-04-01'
        }
      }
    })
    describe('and there is a "licence holder"', () => {
      beforeEach(async () => {
        session.determinedReturnsPeriod.dueDate = seedData.licenceHolder.returnLog.dueDate
      })

      it('returns the "licence holder" ', async () => {
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
            due_date: seedData.licenceHolder.returnLog.dueDate,
            email: null,
            end_date: seedData.licenceHolder.returnLog.endDate,
            licence_ref: seedData.licenceHolder.licenceRef,
            return_reference: seedData.licenceHolder.returnLog.returnReference,
            start_date: seedData.licenceHolder.returnLog.startDate
          }
        ])
      })

      describe('and a "returns to" with different contacts', () => {
        beforeEach(async () => {
          session.determinedReturnsPeriod.dueDate = seedData.licenceHolderAndReturnTo.returnLog.dueDate
        })

        it('returns the "licence holder" and "returns to"', async () => {
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
              due_date: seedData.licenceHolderAndReturnTo.returnLog.dueDate,
              email: null,
              end_date: seedData.licenceHolderAndReturnTo.returnLog.endDate,
              licence_ref: seedData.licenceHolderAndReturnTo.licenceRef,
              return_reference: seedData.licenceHolderAndReturnTo.returnLog.returnReference,
              start_date: seedData.licenceHolderAndReturnTo.returnLog.startDate
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
              due_date: seedData.licenceHolderAndReturnTo.returnLog.dueDate,
              email: null,
              end_date: seedData.licenceHolderAndReturnTo.returnLog.endDate,
              licence_ref: seedData.licenceHolderAndReturnTo.licenceRef,
              return_reference: seedData.licenceHolderAndReturnTo.returnLog.returnReference,
              start_date: seedData.licenceHolderAndReturnTo.returnLog.startDate
            }
          ])
        })
      })

      describe('and a "returns to" with the same contact', () => {
        beforeEach(async () => {
          session.determinedReturnsPeriod.dueDate =
            seedData.licenceHolderAndReturnToWithTheSameAddress.returnLog.dueDate
        })

        it('returns the "licence holder" and "returns to"', async () => {
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
                name: 'Potter',
                postcode: 'WD25 7LR',
                role: 'Licence holder',
                salutation: null,
                town: 'Little Whinging',
                type: 'Person'
              },
              contact_hash_id: '940db59e295b5e70d93ecfc3c2940b75',
              contact_type: 'Licence holder',
              due_date: seedData.licenceHolderAndReturnToWithTheSameAddress.returnLog.dueDate,
              email: null,
              end_date: seedData.licenceHolderAndReturnToWithTheSameAddress.returnLog.endDate,
              licence_ref: seedData.licenceHolderAndReturnToWithTheSameAddress.licenceRef,
              return_reference: seedData.licenceHolderAndReturnToWithTheSameAddress.returnLog.returnReference,
              start_date: seedData.licenceHolderAndReturnToWithTheSameAddress.returnLog.startDate
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
                name: 'Potter',
                postcode: 'WD25 7LR',
                role: 'Returns to',
                salutation: null,
                town: 'Little Whinging',
                type: 'Person'
              },
              contact_hash_id: '940db59e295b5e70d93ecfc3c2940b75',
              contact_type: 'Returns to',
              due_date: seedData.licenceHolderAndReturnToWithTheSameAddress.returnLog.dueDate,
              email: null,
              end_date: seedData.licenceHolderAndReturnToWithTheSameAddress.returnLog.endDate,
              licence_ref: seedData.licenceHolderAndReturnToWithTheSameAddress.licenceRef,
              return_reference: seedData.licenceHolderAndReturnToWithTheSameAddress.returnLog.returnReference,
              start_date: seedData.licenceHolderAndReturnToWithTheSameAddress.returnLog.startDate
            }
          ])
        })
      })
    })
  })

  describe('when there are licences to exclude from the recipients', () => {
    beforeEach(async () => {
      session = {
        returnsPeriod: 'allYear',
        determinedReturnsPeriod: {
          name: 'allYear',
          dueDate: seedData.primaryUser.returnLog.dueDate,
          endDate: '2024-03-31',
          summer: 'false',
          startDate: '2023-04-01'
        },
        removeLicences: seedData.primaryUser.licenceRef
      }
    })

    it('correctly returns recipients without the "removeLicences"', async () => {
      const result = await FetchDownloadRecipientsService.go(session)

      expect(result).to.equal([])
    })
  })

  describe('when there is a licence ref', () => {
    describe('and the licence is registered ', () => {
      describe('and there is a "primary user"', () => {
        beforeEach(async () => {
          session.licenceRef = seedData.primaryUser.licenceRef
        })

        it('returns the "primary user" ', async () => {
          const result = await FetchDownloadRecipientsService.go(session)

          expect(result).to.include({
            contact: null,
            contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
            contact_type: 'Primary user',
            due_date: seedData.primaryUser.returnLog.dueDate,
            end_date: seedData.primaryUser.returnLog.endDate,
            email: 'primary.user@important.com',
            licence_ref: seedData.primaryUser.licenceRef,
            return_reference: seedData.primaryUser.returnLog.returnReference,
            start_date: seedData.primaryUser.returnLog.startDate
          })
        })

        describe('and "returns agent" with different emails', () => {
          beforeEach(async () => {
            session.licenceRef = seedData.primaryUserAndReturnsAgent.licenceRef
          })

          it('returns both the "primary user" and "returns agent"', async () => {
            const result = await FetchDownloadRecipientsService.go(session)

            expect(result).to.include({
              contact: null,
              contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
              contact_type: 'Primary user',
              due_date: seedData.primaryUserAndReturnsAgent.returnLog.dueDate,
              end_date: seedData.primaryUserAndReturnsAgent.returnLog.endDate,
              email: 'primary.user@important.com',
              licence_ref: seedData.primaryUserAndReturnsAgent.licenceRef,
              return_reference: seedData.primaryUserAndReturnsAgent.returnLog.returnReference,
              start_date: seedData.primaryUserAndReturnsAgent.returnLog.startDate
            })

            expect(result).to.include({
              contact: null,
              contact_hash_id: '2e6918568dfbc1d78e2fbe279aaee990',
              contact_type: 'Returns agent',
              due_date: seedData.primaryUserAndReturnsAgent.returnLog.dueDate,
              end_date: seedData.primaryUserAndReturnsAgent.returnLog.endDate,
              email: 'returns.agent@important.com',
              licence_ref: seedData.primaryUserAndReturnsAgent.licenceRef,
              return_reference: seedData.primaryUserAndReturnsAgent.returnLog.returnReference,
              start_date: seedData.primaryUserAndReturnsAgent.returnLog.startDate
            })
          })
        })

        describe('and "returns agent" with the same email', () => {
          beforeEach(async () => {
            session.licenceRef = seedData.primaryUserAndReturnsAgentWithTheSameEmail.licenceRef
          })

          it('returns the "primary user"', async () => {
            const result = await FetchDownloadRecipientsService.go(session)

            expect(result).to.include({
              contact: null,
              contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
              contact_type: 'Primary user',
              due_date: seedData.primaryUserAndReturnsAgentWithTheSameEmail.returnLog.dueDate,
              end_date: seedData.primaryUserAndReturnsAgentWithTheSameEmail.returnLog.endDate,
              email: 'primary.user@important.com',
              licence_ref: seedData.primaryUserAndReturnsAgentWithTheSameEmail.licenceRef,
              return_reference: seedData.primaryUserAndReturnsAgentWithTheSameEmail.returnLog.returnReference,
              start_date: seedData.primaryUserAndReturnsAgentWithTheSameEmail.returnLog.startDate
            })

            expect(result).to.include({
              contact: null,
              contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
              contact_type: 'Returns agent',
              due_date: seedData.primaryUserAndReturnsAgentWithTheSameEmail.returnLog.dueDate,
              end_date: seedData.primaryUserAndReturnsAgentWithTheSameEmail.returnLog.endDate,
              email: 'primary.user@important.com',
              licence_ref: seedData.primaryUserAndReturnsAgentWithTheSameEmail.licenceRef,
              return_reference: seedData.primaryUserAndReturnsAgentWithTheSameEmail.returnLog.returnReference,
              start_date: seedData.primaryUserAndReturnsAgentWithTheSameEmail.returnLog.startDate
            })
          })
        })
      })
    })

    describe('when the licence is unregistered', () => {
      describe('and there is a "licence holder"', () => {
        beforeEach(async () => {
          session.licenceRef = seedData.licenceHolder.licenceRef
        })

        it('returns the "licence holder" ', async () => {
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
              due_date: seedData.licenceHolder.returnLog.dueDate,
              email: null,
              end_date: seedData.licenceHolder.returnLog.endDate,
              licence_ref: seedData.licenceHolder.licenceRef,
              return_reference: seedData.licenceHolder.returnLog.returnReference,
              start_date: seedData.licenceHolder.returnLog.startDate
            }
          ])
        })

        describe('and a "returns to" with different contacts', () => {
          beforeEach(async () => {
            session.licenceRef = seedData.licenceHolderAndReturnTo.licenceRef
          })

          it('returns the "licence holder" and "returns to"', async () => {
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
                due_date: seedData.licenceHolderAndReturnTo.returnLog.dueDate,
                email: null,
                end_date: seedData.licenceHolderAndReturnTo.returnLog.endDate,
                licence_ref: seedData.licenceHolderAndReturnTo.licenceRef,
                return_reference: seedData.licenceHolderAndReturnTo.returnLog.returnReference,
                start_date: seedData.licenceHolderAndReturnTo.returnLog.startDate
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
                due_date: seedData.licenceHolderAndReturnTo.returnLog.dueDate,
                email: null,
                end_date: seedData.licenceHolderAndReturnTo.returnLog.endDate,
                licence_ref: seedData.licenceHolderAndReturnTo.licenceRef,
                return_reference: seedData.licenceHolderAndReturnTo.returnLog.returnReference,
                start_date: seedData.licenceHolderAndReturnTo.returnLog.startDate
              }
            ])
          })
        })

        describe('and a "returns to" with the same contact', () => {
          beforeEach(async () => {
            session.licenceRef = seedData.licenceHolderAndReturnToWithTheSameAddress.licenceRef
          })

          it('returns the "licence holder"', async () => {
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
                  name: 'Potter',
                  postcode: 'WD25 7LR',
                  role: 'Licence holder',
                  salutation: null,
                  town: 'Little Whinging',
                  type: 'Person'
                },
                contact_hash_id: '940db59e295b5e70d93ecfc3c2940b75',
                contact_type: 'Licence holder',
                due_date: seedData.licenceHolderAndReturnToWithTheSameAddress.returnLog.dueDate,
                email: null,
                end_date: seedData.licenceHolderAndReturnToWithTheSameAddress.returnLog.endDate,
                licence_ref: seedData.licenceHolderAndReturnToWithTheSameAddress.licenceRef,
                return_reference: seedData.licenceHolderAndReturnToWithTheSameAddress.returnLog.returnReference,
                start_date: seedData.licenceHolderAndReturnToWithTheSameAddress.returnLog.startDate
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
                  name: 'Potter',
                  postcode: 'WD25 7LR',
                  role: 'Returns to',
                  salutation: null,
                  town: 'Little Whinging',
                  type: 'Person'
                },
                contact_hash_id: '940db59e295b5e70d93ecfc3c2940b75',
                contact_type: 'Returns to',
                due_date: seedData.licenceHolderAndReturnToWithTheSameAddress.returnLog.dueDate,
                email: null,
                end_date: seedData.licenceHolderAndReturnToWithTheSameAddress.returnLog.endDate,
                licence_ref: seedData.licenceHolderAndReturnToWithTheSameAddress.licenceRef,
                return_reference: seedData.licenceHolderAndReturnToWithTheSameAddress.returnLog.returnReference,
                start_date: seedData.licenceHolderAndReturnToWithTheSameAddress.returnLog.startDate
              }
            ])
          })
        })
      })
    })

    describe('when the return logs end date is greater than today', () => {
      beforeEach(async () => {
        session.licenceRef = seedData.licenceHolderReturnLogGreaterThanToday.licenceRef
      })

      it('correctly returns an empty array (no return logs found)', async () => {
        const result = await FetchDownloadRecipientsService.go(session)

        expect(result).to.equal([])
      })
    })
  })
})
