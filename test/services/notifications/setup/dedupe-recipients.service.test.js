'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')

// Thing under test
const DedupeRecipientsService = require('../../../../app/services/notifications/setup/dedupe-recipients.service.js')

describe('Notifications Setup - Dedupe Recipients service', () => {
  let testRecipients
  let testDuplicateRecipients
  let testDuplicateContactWithDifferentType
  let testInput

  beforeEach(() => {
    testRecipients = RecipientsFixture.recipients()
    testDuplicateRecipients = RecipientsFixture.duplicateRecipients()
    testDuplicateContactWithDifferentType = RecipientsFixture.duplicateContactWithDifferentType()
    testInput = [...Object.values(testRecipients), ...Object.values(testDuplicateRecipients)]
  })

  describe('when provided with "recipients"', () => {
    it('correctly dedupes the data and leaves none duplicates as they are', () => {
      const result = DedupeRecipientsService.go(testInput)

      expect(result).to.equal([
        {
          all_licences: testRecipients.returnsTo.all_licences,
          contact: {
            addressLine1: '2',
            addressLine2: 'Privet Drive',
            addressLine3: null,
            addressLine4: null,
            country: null,
            county: 'Surrey',
            forename: 'Harry',
            initials: 'H J',
            name: 'Returns to',
            postcode: 'WD25 7LR',
            role: 'Returns to',
            salutation: 'Mr',
            town: 'Little Whinging',
            type: 'Person'
          },
          contact_hash_id: 123223,
          message_type: 'Letter - Returns To'
        },
        {
          all_licences: testDuplicateRecipients.duplicatePrimaryUser.all_licences,
          contact: null,
          contact_hash_id: 14567627,
          message_type: 'Email - both',
          recipient: 'primary.user@important.com'
        },
        {
          all_licences: testRecipients.primaryUser.all_licences,
          contact: null,
          contact_hash_id: 1178136542,
          message_type: 'Email - primary user',
          recipient: 'primary.user@important.com'
        },
        {
          all_licences: testRecipients.returnsAgent.all_licences,
          contact: null,
          contact_hash_id: -370722837,
          message_type: 'Email - returns agent',
          recipient: 'returns.agent@important.com'
        },
        {
          all_licences: testRecipients.licenceHolder.all_licences,
          contact: {
            addressLine1: '1',
            addressLine2: 'Privet Drive',
            addressLine3: null,
            addressLine4: null,
            country: null,
            county: 'Surrey',
            forename: 'Harry',
            initials: 'H J',
            name: 'Licence holder',
            postcode: 'WD25 7LR',
            role: 'Licence holder',
            salutation: 'Mr',
            town: 'Little Whinging',
            type: 'Person'
          },
          contact_hash_id: -1672785580,
          message_type: 'Letter - licence holder'
        },
        {
          all_licences: testRecipients.licenceHolderWithMultipleLicences.all_licences,
          contact: {
            addressLine1: '3',
            addressLine2: 'Privet Drive',
            addressLine3: null,
            addressLine4: null,
            country: null,
            county: 'Surrey',
            forename: 'Harry',
            initials: 'H J',
            name: 'Licence holder with multiple licences',
            postcode: 'WD25 7LR',
            role: 'Licence holder',
            salutation: 'Mr',
            town: 'Little Whinging',
            type: 'Person'
          },
          contact_hash_id: -167278576,
          message_type: 'Letter - licence holder'
        },
        {
          all_licences: testDuplicateRecipients.duplicateLicenceHolder.all_licences,
          contact: {
            addressLine1: `4`,
            addressLine2: 'Privet Drive',
            addressLine3: null,
            addressLine4: null,
            country: null,
            county: 'Surrey',
            forename: 'Harry',
            initials: 'H J',
            name: 'Duplicate Returns to',
            postcode: 'WD25 7LR',
            role: 'Returns to',
            salutation: 'Mr',
            town: 'Little Whinging',
            type: 'Person'
          },
          contact_hash_id: 167278556784,
          message_type: 'Letter - both'
        }
      ])
    })

    describe('when the recipient has a duplicate "primary user" and "returns to" contact hash', () => {
      it('correctly returns only the "primary user" with the "message_type" Email - both', () => {
        const result = DedupeRecipientsService.go([
          testDuplicateRecipients.duplicatePrimaryUser,
          testDuplicateRecipients.duplicateReturnsAgent
        ])

        expect(result).to.equal([
          {
            all_licences: testDuplicateRecipients.duplicatePrimaryUser.all_licences,
            contact: null,
            contact_hash_id: 14567627,
            message_type: 'Email - both',
            recipient: 'primary.user@important.com'
          }
        ])
      })
    })

    describe('when the recipient has a duplicate "licence holder" and "Returns to" contact hash', () => {
      it('correctly returns only the "licence holder" with the "message_type" Letter - both', () => {
        const result = DedupeRecipientsService.go([
          testDuplicateRecipients.duplicateLicenceHolder,
          testDuplicateRecipients.duplicateReturnsTo
        ])

        expect(result).to.equal([
          {
            all_licences: testDuplicateRecipients.duplicateLicenceHolder.all_licences,
            contact: {
              addressLine1: `4`,
              addressLine2: 'Privet Drive',
              addressLine3: null,
              addressLine4: null,
              country: null,
              county: 'Surrey',
              forename: 'Harry',
              initials: 'H J',
              name: 'Duplicate Returns to',
              postcode: 'WD25 7LR',
              role: 'Returns to',
              salutation: 'Mr',
              town: 'Little Whinging',
              type: 'Person'
            },
            contact_hash_id: 167278556784,
            message_type: 'Letter - both'
          }
        ])
      })
    })

    describe('when the recipient has a duplicate contact hash but a different "contact.type"', () => {
      it('correctly returns the "Organisation" contact with the "message_type" Letter - both, and the both licences merged', () => {
        const result = DedupeRecipientsService.go([
          testDuplicateContactWithDifferentType.duplicateContactOrganisationType,
          testDuplicateContactWithDifferentType.duplicateContactPersonType
        ])

        expect(result).to.equal([
          {
            all_licences: `${testDuplicateContactWithDifferentType.duplicateContactOrganisationType.all_licences},${testDuplicateContactWithDifferentType.duplicateContactPersonType.all_licences}`,
            contact: {
              addressLine1: `5`,
              addressLine2: 'Privet Drive',
              addressLine3: null,
              addressLine4: null,
              country: null,
              county: 'Surrey',
              forename: 'Harry',
              initials: 'H J',
              name: 'Duplicate contact type',
              postcode: 'WD25 7LR',
              role: 'Licence holder',
              salutation: 'Mr',
              town: 'Little Whinging',
              type: 'Organisation'
            },
            contact_hash_id: 1234756,
            message_type: 'Letter - both'
          }
        ])
      })
    })
  })
})
