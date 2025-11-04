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
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

describe('Notices - Setup - Determine Recipients service', () => {
  let singleUseRecipient
  let testInput
  let testRecipients

  beforeEach(() => {
    testRecipients = RecipientsFixture.recipients()

    singleUseRecipient = {
      contact: null,
      contact_hash_id: '90129f6aa5bf2ad50aa3fefd3ff384',
      contact_type: 'Single use',
      email: 'somone@important.com',
      licence_refs: [generateLicenceRef()],
      message_type: 'Email',
      return_log_ids: [generateUUID()]
    }

    const singleUseDuplicate = testRecipients.primaryUser

    testInput = [...Object.values(testRecipients), singleUseRecipient, singleUseDuplicate]
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
          message_type: 'Email',
          return_log_ids: testRecipients.primaryUser.return_log_ids
        },
        {
          contact: null,
          contact_hash_id: '2e6918568dfbc1d78e2fbe279aaee990',
          contact_type: 'Returns agent',
          email: 'returns.agent@important.com',
          licence_refs: testRecipients.returnsAgent.licence_refs,
          message_type: 'Email',
          return_log_ids: testRecipients.returnsAgent.return_log_ids
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
          message_type: 'Letter',
          return_log_ids: testRecipients.licenceHolder.return_log_ids
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
          message_type: 'Letter',
          return_log_ids: testRecipients.returnsTo.return_log_ids
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
          message_type: 'Letter',
          return_log_ids: testRecipients.licenceHolderWithMultipleLicences.return_log_ids
        },
        {
          contact: null,
          contact_hash_id: '90129f6aa5bf2ad50aa3fefd3ff384',
          contact_type: 'Single use',
          email: 'somone@important.com',
          licence_refs: singleUseRecipient.licence_refs,
          message_type: 'Email',
          return_log_ids: singleUseRecipient.return_log_ids
        }
      ])
    })
  })
})
