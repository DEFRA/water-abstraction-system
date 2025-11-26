'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceDocumentHeaderSeeder = require('../../support/seeders/licence-document-header.seeder.js')

// Thing under test
const FetchLicenceContactsService = require('../../../app/services/licences/fetch-licence-contacts.service.js')

describe('Fetch Licence Contact service', () => {
  let licence
  let licenceId
  let licenceRef
  let licenceDocumentHeaderId

  describe('when the licence has a licence document header', () => {
    before(async () => {
      const { licenceHolder: licenceDocumentHeader } = await LicenceDocumentHeaderSeeder.seed()

      licence = await LicenceHelper.add({
        licenceRef: licenceDocumentHeader.licenceRef
      })

      licenceId = licence.id
      licenceRef = licence.licenceRef
      licenceDocumentHeaderId = licenceDocumentHeader.id
    })

    it('returns the matching licence and licence document header', async () => {
      const result = await FetchLicenceContactsService.go(licenceId)

      expect(result).to.equal({
        id: licenceId,
        licenceRef,
        licenceDocumentHeader: {
          id: licenceDocumentHeaderId,
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
