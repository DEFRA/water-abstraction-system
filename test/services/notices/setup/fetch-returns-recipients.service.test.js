'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceDocumentHeaderSeeder = require('../../../support/seeders/licence-document-header.seeder.js')

// Thing under test
const FetchReturnsRecipientsService = require('../../../../app/services/notices/setup/fetch-returns-recipients.service.js')

// TODO add the dedup check - add more seed data to add duplcuiate recipeints but differnet return log / licence ref
describe('Notices - Setup - Fetch returns recipients service', () => {
  let seedData
  let session

  before(async () => {
    session = {}

    seedData = await LicenceDocumentHeaderSeeder.seed('2025-01-')
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
        const result = await FetchReturnsRecipientsService.go(session)

        expect(result).to.equal([
          {
            licence_refs: seedData.primaryUser.licenceRef,
            contact: null,
            contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
            contact_type: 'Primary user',
            email: 'primary.user@important.com'
          }
        ])
      })

      describe('and "returns agent" with different emails', () => {
        beforeEach(async () => {
          session.determinedReturnsPeriod.dueDate = seedData.primaryUserAndReturnsAgent.returnLog.dueDate
        })

        it('returns both the "primary user" and "returns agent"', async () => {
          const result = await FetchReturnsRecipientsService.go(session)

          expect(result).to.equal([
            {
              licence_refs: seedData.primaryUserAndReturnsAgent.licenceRef,
              contact: null,
              contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
              contact_type: 'Primary user',
              email: 'primary.user@important.com'
            },
            {
              contact: null,
              contact_hash_id: '2e6918568dfbc1d78e2fbe279aaee990',
              contact_type: 'Returns agent',
              email: 'returns.agent@important.com',
              licence_refs: seedData.primaryUserAndReturnsAgent.licenceRef
            }
          ])
        })
      })

      describe('and "returns agent" with the same email', () => {
        beforeEach(async () => {
          session.determinedReturnsPeriod.dueDate =
            seedData.primaryUserAndReturnsAgentWithTheSameEmail.returnLog.dueDate
        })

        it('returns the "primary user" ', async () => {
          const result = await FetchReturnsRecipientsService.go(session)

          expect(result).to.equal([
            {
              licence_refs: seedData.primaryUserAndReturnsAgentWithTheSameEmail.licenceRef,
              contact: null,
              contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
              contact_type: 'Primary user',
              email: 'primary.user@important.com'
            }
          ])
        })
      })
    })
  })

  describe('when the licence is unregistered', () => {
    describe('and there is a "licence holder"', () => {
      beforeEach(async () => {
        session.determinedReturnsPeriod.dueDate = seedData.licenceHolder.returnLog.dueDate
      })

      it('returns the "licence holder" ', async () => {
        const result = await FetchReturnsRecipientsService.go(session)

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
            email: null,
            licence_refs: seedData.licenceHolder.licenceRef
          }
        ])
      })

      describe('and a "returns to" with different contacts', () => {
        beforeEach(async () => {
          session.determinedReturnsPeriod.dueDate = seedData.licenceHolderAndReturnTo.returnLog.dueDate
        })

        it('returns the "licence holder" and "returns to"', async () => {
          const result = await FetchReturnsRecipientsService.go(session)

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
              email: null,
              licence_refs: seedData.licenceHolderAndReturnTo.licenceRef
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
              email: null,
              licence_refs: seedData.licenceHolderAndReturnTo.licenceRef
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
          const result = await FetchReturnsRecipientsService.go(session)

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
              email: null,
              licence_refs: seedData.licenceHolderAndReturnToWithTheSameAddress.licenceRef
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
      const result = await FetchReturnsRecipientsService.go(session)

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
          const result = await FetchReturnsRecipientsService.go(session)

          expect(result).to.equal([
            {
              licence_refs: seedData.primaryUser.licenceRef,
              contact: null,
              contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
              contact_type: 'Primary user',
              email: 'primary.user@important.com'
            }
          ])
        })

        describe('and "returns agent" with different emails', () => {
          beforeEach(async () => {
            session.licenceRef = seedData.primaryUserAndReturnsAgent.licenceRef
          })

          it('returns both the "primary user" and "returns agent"', async () => {
            const result = await FetchReturnsRecipientsService.go(session)

            expect(result).to.equal([
              {
                licence_refs: seedData.primaryUserAndReturnsAgent.licenceRef,
                contact: null,
                contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
                contact_type: 'Primary user',
                email: 'primary.user@important.com'
              },
              {
                contact: null,
                contact_hash_id: '2e6918568dfbc1d78e2fbe279aaee990',
                contact_type: 'Returns agent',
                email: 'returns.agent@important.com',
                licence_refs: seedData.primaryUserAndReturnsAgent.licenceRef
              }
            ])
          })
        })

        describe('and "returns agent" with the same email', () => {
          beforeEach(async () => {
            session.licenceRef = seedData.primaryUserAndReturnsAgentWithTheSameEmail.licenceRef
          })

          it('returns the "primary user" ', async () => {
            const result = await FetchReturnsRecipientsService.go(session)

            expect(result).to.equal([
              {
                licence_refs: seedData.primaryUserAndReturnsAgentWithTheSameEmail.licenceRef,
                contact: null,
                contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
                contact_type: 'Primary user',
                email: 'primary.user@important.com'
              }
            ])
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
          const result = await FetchReturnsRecipientsService.go(session)

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
              email: null,
              licence_refs: seedData.licenceHolder.licenceRef
            }
          ])
        })

        describe('and a "returns to" with different contacts', () => {
          beforeEach(async () => {
            session.licenceRef = seedData.licenceHolderAndReturnTo.licenceRef
          })

          it('returns the "licence holder" and "returns to"', async () => {
            const result = await FetchReturnsRecipientsService.go(session)

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
                email: null,
                licence_refs: seedData.licenceHolderAndReturnTo.licenceRef
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
                email: null,
                licence_refs: seedData.licenceHolderAndReturnTo.licenceRef
              }
            ])
          })
        })

        describe('and a "returns to" with the same contact', () => {
          beforeEach(async () => {
            session.licenceRef = seedData.licenceHolderAndReturnToWithTheSameAddress.licenceRef
          })

          it('returns the "licence holder"', async () => {
            const result = await FetchReturnsRecipientsService.go(session)

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
                email: null,
                licence_refs: seedData.licenceHolderAndReturnToWithTheSameAddress.licenceRef
              }
            ])
          })
        })
      })
    })
  })
})
