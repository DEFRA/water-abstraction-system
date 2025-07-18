'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')

// Thing under test
const DetermineRecipientsService = require('../../../../app/services/notices/setup/determine-recipients.service.js')

describe('Notices - Setup - Determine Recipients service', () => {
  let testRecipients
  let testDuplicateRecipients
  let testInput

  beforeEach(() => {
    testRecipients = RecipientsFixture.recipients()
    testDuplicateRecipients = RecipientsFixture.duplicateRecipients()
    testInput = [...Object.values(testRecipients), ...Object.values(testDuplicateRecipients)]
  })

  describe('when provided with "contacts"', () => {
    it('correctly determines the "recipients", merging any duplicate contacts and leaving non-duplicates as is', () => {
      const result = DetermineRecipientsService.go(testInput)

      expect(result).to.equal([
        {
          contact: null,
          contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
          contact_type: 'Primary user',
          email: 'primary.user@important.com',
          licence_refs: testRecipients.primaryUser.licence_refs,
          message_type: 'Email'
        },
        {
          contact: null,
          contact_hash_id: '2e6918568dfbc1d78e2fbe279aaee990',
          contact_type: 'Returns agent',
          email: 'returns.agent@important.com',
          licence_refs: testRecipients.returnsAgent.licence_refs,
          message_type: 'Email'
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
          email: null,
          licence_refs: testRecipients.licenceHolder.licence_refs,
          message_type: 'Letter'
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
            postcode: null,
            role: 'Returns to',
            salutation: 'Mr',
            town: 'Little Whinging',
            type: 'Person'
          },
          contact_hash_id: '22f6457b6be9fd63d8a9a8dd2ed679893',
          contact_type: 'Returns to',
          email: null,
          licence_refs: testRecipients.returnsTo.licence_refs,
          message_type: 'Letter'
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
          email: null,
          licence_refs: testRecipients.licenceHolderWithMultipleLicences.licence_refs,
          message_type: 'Letter'
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
          contact_type: 'both',
          email: null,
          licence_refs: testDuplicateRecipients.duplicateLicenceHolder.licence_refs,
          message_type: 'Letter'
        },
        {
          contact: null,
          contact_hash_id: '2e6918568dfbc1d78e2fbe279fftt990',
          contact_type: 'both',
          email: 'primary.user@important.com',
          licence_refs: testDuplicateRecipients.duplicatePrimaryUser.licence_refs,
          message_type: 'Email'
        }
      ])
    })

    describe('when a "Primary user" and a "Returns agent" contact have the same hash ID', () => {
      it('merges them into one "recipient" with the "contact_type" set to "both"', () => {
        const result = DetermineRecipientsService.go([
          testDuplicateRecipients.duplicatePrimaryUser,
          testDuplicateRecipients.duplicateReturnsAgent
        ])

        expect(result).to.equal([
          {
            contact: null,
            contact_hash_id: '2e6918568dfbc1d78e2fbe279fftt990',
            contact_type: 'both',
            email: 'primary.user@important.com',
            licence_refs: testDuplicateRecipients.duplicatePrimaryUser.licence_refs,
            message_type: 'Email'
          }
        ])
      })
    })

    describe('when a "Licence holder" and a "Returns to" contact have the same hash ID', () => {
      it('merges them into one "recipient" with the contact type set to "both"', () => {
        const result = DetermineRecipientsService.go([
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
            contact_type: 'both',
            email: null,
            licence_refs: testDuplicateRecipients.duplicateLicenceHolder.licence_refs,
            message_type: 'Letter'
          }
        ])
      })
    })

    describe('when an "Additional contact" is present', () => {
      beforeEach(() => {
        testRecipients = RecipientsFixture.alertsRecipients()
      })

      it('returns the additional contact', () => {
        const result = DetermineRecipientsService.go([testRecipients.additionalContact])

        expect(result).to.equal([
          {
            contact: null,
            contact_hash_id: '90129f6aa5b98734aa3fefd3f8cf86a',
            contact_type: 'Additional contact',
            email: 'additional.contact@important.com',
            licence_refs: testRecipients.additionalContact.licence_refs,
            message_type: 'Email'
          }
        ])
      })
    })

    describe('when an "Additional contact" is present again', () => {
      let testRecipients2
      beforeEach(() => {
        testRecipients = RecipientsFixture.alertsRecipients()
        testRecipients2 = RecipientsFixture.alertsRecipients()

        testInput = [
          testRecipients.additionalContact,
          // this should make it fail with duplicate licence ref
          testRecipients.additionalContact,
          testRecipients2.additionalContact
        ]
      })

      it('returns the additional contact', () => {
        const result = DetermineRecipientsService.go(testInput)

        expect(result).to.equal([
          {
            contact: null,
            contact_hash_id: '90129f6aa5b98734aa3fefd3f8cf86a',
            contact_type: 'Additional contact',
            email: 'additional.contact@important.com',
            licence_refs: `${testRecipients.additionalContact.licence_refs},${testRecipients2.additionalContact.licence_refs}`,
            message_type: 'Email'
          }
        ])
      })
    })
  })
})
