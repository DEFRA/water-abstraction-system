'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceDocumentHeaderSeeder = require('../../../support/seeders/licence-document-header.seeder.js')

// Thing under test
const FetchDownloadRecipientsService = require('../../../../app/services/notifications/setup/fetch-download-recipients.service.js')

describe('Notifications Setup - Fetch Download Recipients service', () => {
  let dueDate
  let isSummer
  let testRecipients

  before(async () => {
    dueDate = '2024-04-28' // This needs to differ from any other returns log tests
    isSummer = 'false'

    testRecipients = await LicenceDocumentHeaderSeeder.seed(true, dueDate)
  })

  describe('when there are recipients', () => {
    it('correctly returns "Primary user" and "Returns agent" contacts', async () => {
      const result = await FetchDownloadRecipientsService.go(dueDate, isSummer)

      const primaryUser = result.find((item) => item.contact_type === 'Primary user')
      const returnsAgent = result.find((item) => item.contact_type === 'Returns agent')

      expect(primaryUser).to.equal({
        contact: null,
        contact_type: 'Primary user',
        email: 'primary.user@important.com',
        licence_ref: testRecipients.primaryUser.licenceRef,
        return_reference: testRecipients.primaryUser.returnLog.returnReference
      })

      expect(returnsAgent).to.equal({
        contact: null,
        contact_type: 'Returns agent',
        email: 'returns.agent@important.com',
        licence_ref: testRecipients.primaryUser.licenceRef,
        return_reference: testRecipients.primaryUser.returnLog.returnReference
      })
    })

    it('correctly returns "Licence holder" contact', async () => {
      const result = await FetchDownloadRecipientsService.go(dueDate, isSummer)

      const found = result.filter((item) => item.licence_ref === testRecipients.licenceHolder.licenceRef)

      expect(found).to.equal([
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
            name: 'Licence holder only',
            postcode: 'WD25 7LR',
            role: 'Licence holder',
            salutation: null,
            town: 'Little Whinging',
            type: 'Person'
          },
          contact_type: 'Licence holder',
          email: null,
          licence_ref: testRecipients.licenceHolder.licenceRef,
          return_reference: testRecipients.licenceHolder.returnLog.returnReference
        }
      ])
    })

    it('correctly returns duplicate "Licence holder" and "Returns to" contacts', async () => {
      const result = await FetchDownloadRecipientsService.go(dueDate, isSummer)

      const found = result.filter((item) => item.licence_ref === testRecipients.licenceHolderAndReturnTo.licenceRef)

      expect(found).to.equal([
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
            name: 'Licence holder and returns to',
            postcode: 'WD25 7LR',
            role: 'Licence holder',
            salutation: null,
            town: 'Little Whinging',
            type: 'Person'
          },
          contact_type: 'Licence holder',
          email: null,
          licence_ref: testRecipients.licenceHolderAndReturnTo.licenceRef,
          return_reference: testRecipients.licenceHolderAndReturnTo.returnLog.returnReference
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
            name: 'Licence holder and returns to',
            postcode: 'WD25 7LR',
            role: 'Returns to',
            salutation: null,
            town: 'Little Whinging',
            type: 'Person'
          },
          contact_type: 'Returns to',
          email: null,
          licence_ref: testRecipients.licenceHolderAndReturnTo.licenceRef,
          return_reference: testRecipients.licenceHolderAndReturnTo.returnLog.returnReference
        }
      ])
    })
  })
})
