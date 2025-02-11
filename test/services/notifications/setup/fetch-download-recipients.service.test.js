'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceDocumentHeaderSeeder = require('../../../support/seeders/licence-document-header.seeder.js')

// Thing under test
const FetchDownloadRecipientsService = require('../../../../app/services/notifications/setup/fetch-download-recipients.service.js')

describe('Notifications Setup - Fetch Download Recipients service', () => {
  // These dates match the return logs helper
  const startDate = new Date('2022-04-01')
  const endDate = new Date('2023-03-31')

  let dueDate
  let isSummer
  let removeLicences
  let testRecipients

  before(async () => {
    dueDate = '2024-04-28' // This needs to differ from any other returns log tests
    isSummer = 'false'
    removeLicences = ['']

    testRecipients = await LicenceDocumentHeaderSeeder.seed(true, dueDate)
  })

  describe('when there are recipients', () => {
    it('correctly returns "Primary user" and "Returns agent" contacts', async () => {
      const result = await FetchDownloadRecipientsService.go(dueDate, isSummer, removeLicences)

      const primaryUser = result.find((item) => item.contact_type === 'Primary user')
      const returnsAgent = result.find((item) => item.contact_type === 'Returns agent')

      expect(primaryUser).to.equal({
        contact: null,
        contact_type: 'Primary user',
        due_date: new Date(dueDate),
        email: 'primary.user@important.com',
        end_date: endDate,
        licence_ref: testRecipients.primaryUser.licenceRef,
        return_reference: testRecipients.primaryUser.returnLog.returnReference,
        start_date: startDate
      })

      expect(returnsAgent).to.equal({
        contact: null,
        contact_type: 'Returns agent',
        due_date: new Date(dueDate),
        email: 'returns.agent@important.com',
        end_date: endDate,
        licence_ref: testRecipients.primaryUser.licenceRef,
        return_reference: testRecipients.primaryUser.returnLog.returnReference,
        start_date: startDate
      })
    })

    it('correctly returns "Licence holder" contact', async () => {
      const result = await FetchDownloadRecipientsService.go(dueDate, isSummer, removeLicences)

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
          due_date: new Date(dueDate),
          email: null,
          end_date: endDate,
          licence_ref: testRecipients.licenceHolder.licenceRef,
          return_reference: testRecipients.licenceHolder.returnLog.returnReference,
          start_date: startDate
        }
      ])
    })

    it('correctly returns duplicate "Licence holder" and "Returns to" contacts', async () => {
      const result = await FetchDownloadRecipientsService.go(dueDate, isSummer, removeLicences)

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
          due_date: new Date(dueDate),
          email: null,
          end_date: endDate,
          licence_ref: testRecipients.licenceHolderAndReturnTo.licenceRef,
          return_reference: testRecipients.licenceHolderAndReturnTo.returnLog.returnReference,
          start_date: startDate
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
          due_date: new Date(dueDate),
          email: null,
          end_date: endDate,
          licence_ref: testRecipients.licenceHolderAndReturnTo.licenceRef,
          return_reference: testRecipients.licenceHolderAndReturnTo.returnLog.returnReference,
          start_date: startDate
        }
      ])
    })

    describe('and there are licence to exclude from the recipients', () => {
      beforeEach(() => {
        removeLicences = [testRecipients.primaryUser.licenceRef]
      })

      it('correctly returns recipients without the "removeLicences"', async () => {
        const result = await FetchDownloadRecipientsService.go(dueDate, isSummer, removeLicences)

        const primaryUser = result.find((item) => item.contact_type === 'Primary user')
        const returnsAgent = result.find((item) => item.contact_type === 'Returns agent')

        expect(primaryUser).to.be.undefined()

        expect(returnsAgent).to.be.undefined()
      })
    })
  })
})
