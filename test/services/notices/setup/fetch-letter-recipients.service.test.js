'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceDocumentHeaderSeeder = require('../../../support/seeders/licence-document-header.seeder.js')

// Thing under test
const FetchLetterRecipientsService = require('../../../../app/services/notices/setup/fetch-letter-recipients.service.js')

describe('Notices - Setup - Fetch letter recipients service', () => {
  let dueDate
  let recipients
  let session

  describe('when the licence number only has one recipient which has the "licence holder" role', () => {
    beforeEach(async () => {
      dueDate = '2025-04-29'

      recipients = await LicenceDocumentHeaderSeeder.seedLicenceHolder(dueDate)

      session = { licenceRef: recipients.licenceHolder.licenceRef }
    })

    it('correctly returns the licence holder data', async () => {
      const result = await FetchLetterRecipientsService.go(session)

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
      dueDate = '2025-05-08'

      recipients = await LicenceDocumentHeaderSeeder.seedLicenceHolderAndReturnToSameRef(dueDate)

      session = { licenceRef: recipients.licenceHolderAndReturnTo.licenceRef }
    })

    it('correctly returns the licence holder and returns to data', async () => {
      const result = await FetchLetterRecipientsService.go(session)

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
        // Returns to
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
