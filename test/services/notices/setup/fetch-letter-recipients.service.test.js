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
  let recipients
  let session

  before(async () => {
    recipients = await LicenceDocumentHeaderSeeder.seed(true)
  })

  describe('when the licence number only has one recipient which has the "licence holder" role', () => {
    beforeEach(() => {
      session = { licenceRef: recipients.licenceHolder.licenceRef }
    })

    it('correctly returns the licence holder data', async () => {
      const result = await FetchLetterRecipientsService.go(session)

      const [testRecipient] = result.filter((res) => {
        return res.licence_refs.includes(recipients.licenceHolder.licenceRef)
      })

      expect(testRecipient).to.equal({
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
          name: 'Licence holder only',
          postcode: 'WD25 7LR',
          role: 'Licence holder',
          salutation: null,
          town: 'Little Whinging',
          type: 'Person'
        },
        contact_hash_id: '22f6457b6be9fd63d8a9a8dd2ed61214',
        contact_type: 'Licence holder',
        email: null
      })
    })
  })

  describe('when the licence has one recipient which has both the "licence holder" and "Returns to" role', () => {
    beforeEach(() => {
      session = { licenceRef: recipients.licenceHolderAndReturnTo.licenceRef }
    })

    it('correctly returns the licence holder and returns to data', async () => {
      const result = await FetchLetterRecipientsService.go(session)

      const [licenceHolder, returnsTo] = result.filter((res) => {
        return res.licence_refs.includes(recipients.licenceHolderAndReturnTo.licenceRef)
      })

      expect(licenceHolder).to.equal({
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
          name: 'Licence holder and returns to',
          postcode: 'WD25 7LR',
          role: 'Licence holder',
          salutation: null,
          town: 'Little Whinging',
          type: 'Person'
        },
        contact_hash_id: 'b1b355491c7d42778890c545e08797ea',
        contact_type: 'Licence holder',
        email: null
      })

      expect(returnsTo).to.equal({
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
          name: 'Licence holder and returns to',
          postcode: 'WD25 7LR',
          role: 'Returns to',
          salutation: null,
          town: 'Little Whinging',
          type: 'Person'
        },
        contact_hash_id: 'b1b355491c7d42778890c545e08797ea',
        contact_type: 'Returns to',
        email: null
      })
    })
  })
})
