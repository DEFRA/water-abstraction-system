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
const FetchLicenceContactDetailsService = require('../../../app/services/licences/fetch-licence-contact-details.service.js')

describe('Fetch Licence Contact Details service', () => {
  let licence
  let licenceId
  let licenceRef
  let licenceDocumentHeaderId

  describe('when the licence has a licence document header', () => {
    before(async () => {
      const { primaryUser: licenceDocumentHeader } = await LicenceDocumentHeaderSeeder.seed()

      licence = await LicenceHelper.add({
        licenceRef: licenceDocumentHeader.licenceRef
      })

      licenceId = licence.id
      licenceRef = licence.licenceRef
      licenceDocumentHeaderId = licenceDocumentHeader.id
    })

    it('returns the matching licence and licence document header', async () => {
      const result = await FetchLicenceContactDetailsService.go(licenceId)

      expect(result).to.equal({
        id: licenceId,
        licenceRef,
        licenceDocumentHeader: {
          id: licenceDocumentHeaderId,
          licenceEntityRoles: [
            {
              role: 'primary_user',
              licenceEntity: {
                name: 'primary.user@important.com'
              }
            }
          ],
          metadata: {
            AddressLine1: 'ENVIRONMENT AGENCY',
            AddressLine2: 'HORIZON HOUSE',
            AddressLine3: 'DEANERY ROAD',
            AddressLine4: '',
            Country: '',
            County: 'AVON',
            Expires: null,
            Forename: 'AMARA',
            Initials: 'A',
            Modified: '20080327',
            Name: 'GUPTA',
            Postcode: 'BS1 5AH',
            Salutation: '',
            Town: 'BRISTOL',
            contacts: [
              {
                addressLine1: 'ENVIRONMENT AGENCY',
                addressLine2: 'HORIZON HOUSE',
                addressLine3: 'DEANERY ROAD',
                addressLine4: null,
                country: null,
                county: 'AVON',
                forename: 'AMARA',
                initials: 'A',
                name: 'GUPTA',
                postcode: 'BS1 5AH',
                role: 'Licence holder',
                salutation: null,
                town: 'BRISTOL',
                type: 'Person'
              }
            ],
            isCurrent: true,
            isSummer: true
          }
        }
      })
    })
  })
})
