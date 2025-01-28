'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')

// Thing under test
const DedupeRecipientsService = require('../../../../app/services/notifications/setup/determine-recipients.service.js')

describe('Notifications Setup - Dedupe Recipients service', () => {
  let testRecipients
  let testDuplicateRecipients
  let testInput

  beforeEach(() => {
    testRecipients = RecipientsFixture.recipients()
    testDuplicateRecipients = RecipientsFixture.duplicateRecipients()
    testInput = [...Object.values(testRecipients), ...Object.values(testDuplicateRecipients)]
  })

  describe('when provided with "recipients"', () => {
    it('correctly dedupes the data and leaves none duplicates as they are', () => {
      const result = DedupeRecipientsService.go(testInput)

      expect(result).to.equal([
        {
          contact: null,
          contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
          contact_type: 'Primary user',
          email: 'primary.user@important.com',
          licence_refs: testRecipients.primaryUser.licence_refs
        },
        {
          contact: null,
          contact_hash_id: '2e6918568dfbc1d78e2fbe279aaee990',
          email: 'returns.agent@important.com',
          licence_refs: testRecipients.returnsAgent.licence_refs,
          message_type: 'Returns agent'
        },
        {
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
          contact_hash_id: '22f6457b6be9fd63d8a9a8dd2ed61214',
          contact_type: 'Licence holder',
          licence_refs: testRecipients.licenceHolder.licence_refs
        },
        {
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
          contact_hash_id: '22f6457b6be9fd63d8a9a8dd2ed679893',
          contact_type: 'Returns to',
          licence_refs: testRecipients.returnsTo.licence_refs
        },
        {
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
          contact_hash_id: '22f6457b6be9fd63d8a9a8dd2ed09878075',
          contact_type: 'Licence holder',
          licence_refs: testRecipients.licenceHolderWithMultipleLicences.licence_refs
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
            initials: 'H J',
            name: 'Duplicate Licence holder',
            postcode: 'WD25 7LR',
            role: 'Licence holder',
            salutation: 'Mr',
            town: 'Little Whinging',
            type: 'Person'
          },
          contact_hash_id: 'b1b355491c7d42778890c545e08797ea',
          contact_type: 'Licence holder',
          licence_refs: testDuplicateRecipients.duplicateLicenceHolder.licence_refs,
          message: 'Letter - both'
        },
        {
          contact: null,
          contact_hash_id: '2e6918568dfbc1d78e2fbe279fftt990',
          contact_type: 'Primary user',
          email: 'primary.user@important.com',
          licence_refs: testDuplicateRecipients.duplicatePrimaryUser.licence_refs,
          message: 'Email - both'
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
            contact: null,
            contact_hash_id: '2e6918568dfbc1d78e2fbe279fftt990',
            contact_type: 'Primary user',
            email: 'primary.user@important.com',
            licence_refs: testDuplicateRecipients.duplicatePrimaryUser.licence_refs,
            message: 'Email - both'
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
            contact: {
              addressLine1: '4',
              addressLine2: 'Privet Drive',
              addressLine3: null,
              addressLine4: null,
              country: null,
              county: 'Surrey',
              forename: 'Harry',
              initials: 'H J',
              name: 'Duplicate Licence holder',
              postcode: 'WD25 7LR',
              role: 'Licence holder',
              salutation: 'Mr',
              town: 'Little Whinging',
              type: 'Person'
            },
            contact_hash_id: 'b1b355491c7d42778890c545e08797ea',
            contact_type: 'Licence holder',
            licence_refs: testDuplicateRecipients.duplicateLicenceHolder.licence_refs,
            message: 'Letter - both'
          }
        ])
      })
    })
  })
})
