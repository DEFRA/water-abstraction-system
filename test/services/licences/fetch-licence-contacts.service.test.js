'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, after, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceDocumentHeaderSeeder = require('../../support/seeders/licence-document-header.seeder.js')

// Thing under test
const FetchLicenceContactsService = require('../../../app/services/licences/fetch-licence-contacts.service.js')

describe('Licences - Fetch Licence Contacts service', () => {
  let licence
  let licenceDocumentHeader

  before(async () => {
    const { licenceHolder } = await LicenceDocumentHeaderSeeder.seed()

    licenceDocumentHeader = licenceHolder

    licence = await LicenceHelper.add({
      licenceRef: licenceDocumentHeader.licenceRef
    })
  })

  after(async () => {
    await licence.$query().delete()
  })

  describe('when the licence has a licence document header', () => {
    it('returns the matching licence and licence document header', async () => {
      const result = await FetchLicenceContactsService.go(licence.id)

      expect(result).to.equal({
        id: licence.id,
        licenceRef: licence.licenceRef,
        licenceDocumentHeader: {
          id: licenceDocumentHeader.id,
          licenceEntityRoles: [],
          metadata: {
            contacts: [
              {
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
              }
            ]
          }
        }
      })
    })
  })
})
