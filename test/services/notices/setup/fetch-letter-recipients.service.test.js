'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceDocumentHeaderSeeder = require('../../../support/seeders/licence-document-header.seeder.js')

// Thing under test
const FetchLetterRecipientsService = require('../../../../app/services/notices/setup/fetch-letter-recipients.service.js')

describe('Notices - Setup - Fetch letter recipients service', () => {
  let seedData
  let session

  before(async () => {
    session = {}

    seedData = await LicenceDocumentHeaderSeeder.seed('2025-02-')
  })

  describe('when there is a "licence holder"', () => {
    beforeEach(async () => {
      session.licenceRef = seedData.licenceHolderLetter.licenceRef
    })

    it('returns the "licence holder" ', async () => {
      const result = await FetchLetterRecipientsService.go(session)

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
          licence_refs: seedData.licenceHolderLetter.licenceRef
        }
      ])
    })

    describe('and a "returns to" with different contacts', () => {
      beforeEach(async () => {
        session.licenceRef = seedData.licenceHolderAndReturnToLetter.licenceRef
      })

      it('returns the "licence holder" and "returns to"', async () => {
        const result = await FetchLetterRecipientsService.go(session)

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
            licence_refs: seedData.licenceHolderAndReturnToLetter.licenceRef
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
            licence_refs: seedData.licenceHolderAndReturnToLetter.licenceRef
          }
        ])
      })
    })

    describe('and a "returns to" with the same contact', () => {
      beforeEach(async () => {
        session.licenceRef = seedData.licenceHolderAndReturnToLetterWithTheSameAddress.licenceRef
      })

      it('returns the "licence holder"', async () => {
        const result = await FetchLetterRecipientsService.go(session)

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
            licence_refs: seedData.licenceHolderAndReturnToLetterWithTheSameAddress.licenceRef
          }
        ])
      })
    })
  })
})
