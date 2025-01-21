'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')

// Thing under test
const DeDupeRecipientsService = require('../../../../app/services/notifications/setup/dedupe-recipients.service.js')

describe('Notifications Setup - De Dupe recipients service', () => {
  let testRecipients
  let testDuplicateRecipients
  let testInput

  beforeEach(() => {
    testRecipients = RecipientsFixture.recipients()
    testDuplicateRecipients = RecipientsFixture.duplicateRecipients()
    testInput = [...Object.values(testRecipients), ...Object.values(testDuplicateRecipients)]
  })

  describe('when provided with "recipients"', () => {
    it('correctly de dupes the data', () => {
      const result = DeDupeRecipientsService.go(testInput)

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
            initials: 'J',
            name: 'Returner Guy',
            postcode: 'WD25 7LR',
            role: 'Returns to',
            salutation: null,
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
            initials: 'J',
            name: 'Licence Guy',
            postcode: 'WD25 7LR',
            role: 'Licence holder',
            salutation: null,
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
            initials: 'J',
            name: 'Multiple Licence Guy',
            postcode: 'WD25 7LR',
            role: 'Licence holder',
            salutation: null,
            town: 'Little Whinging',
            type: 'Person'
          },
          contact_hash_id: -167278576,
          message_type: 'Letter - licence holder'
        },
        {
          all_licences: testDuplicateRecipients.duplicateLicenceHolder.all_licences,
          contact: {
            addressLine1: '4',
            addressLine2: 'Privet Drive',
            addressLine3: null,
            addressLine4: null,
            country: null,
            county: 'Surrey',
            forename: 'Harry',
            initials: 'J',
            name: 'Duplicate contact',
            postcode: 'WD25 7LR',
            role: 'Licence holder',
            salutation: null,
            town: 'Little Whinging',
            type: 'Person'
          },
          contact_hash_id: 167278556784,
          message_type: 'Letter - both'
        }
      ])
    })

    describe('when the recipient has a duplicate "primary user" and "returns to" contact hash', () => {
      it('correctly returns only the "primary user"', () => {
        const result = DeDupeRecipientsService.go([
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

      it('correctly returns only the "primary user" (irrelevant of order)', () => {
        const result = DeDupeRecipientsService.go([
          testDuplicateRecipients.duplicateReturnsAgent,
          testDuplicateRecipients.duplicatePrimaryUser
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
      it('correctly changes the "message_type" to "Letter - both" ', () => {
        const result = DeDupeRecipientsService.go([
          testDuplicateRecipients.duplicateLicenceHolder,
          testDuplicateRecipients.duplicateReturnsTo
        ])

        const duplicateLicenceHolder = result[result.length - 1]
        expect(duplicateLicenceHolder.message_type).to.equal('Letter - both')
      })

      it('correctly changes the "message_type" to "Letter - both" (irrelevant of order)', () => {
        const result = DeDupeRecipientsService.go([
          testDuplicateRecipients.duplicateReturnsTo,
          testDuplicateRecipients.duplicateLicenceHolder
        ])

        const duplicateLicenceHolder = result[result.length - 1]
        expect(duplicateLicenceHolder.message_type).to.equal('Letter - both')
      })
    })
  })
})
