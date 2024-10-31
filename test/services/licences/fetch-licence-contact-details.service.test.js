'use strict'

// Test framework dependencies

const Code = require('@hapi/code')

const { describe, it, before } = require('node:test')
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceDocumentHeaderHelper = require('../../support/helpers/licence-document-header.helper.js')

// Thing under test
const FetchLicenceContactDetailsService = require('../../../app/services/licences/fetch-licence-contact-details.service.js')

describe('Fetch Licence Contact Details service', () => {
  let licence
  let licenceId
  let licenceRef
  let licenceDocumentHeader
  let licenceDocumentHeaderId

  describe('when the licence has a licence document header', () => {
    before(async () => {
      licence = await LicenceHelper.add()
      licenceId = licence.id
      licenceRef = licence.licenceRef

      licenceDocumentHeader = await LicenceDocumentHeaderHelper.add({ licenceRef })
      licenceDocumentHeaderId = licenceDocumentHeader.id
    })

    it('returns the matching licence and licence document header', async () => {
      const result = await FetchLicenceContactDetailsService.go(licenceId)

      expect(result).to.equal({
        id: licenceId,
        licenceRef,
        licenceDocumentHeader: {
          id: licenceDocumentHeaderId,
          metadata: {
            Name: 'GUPTA',
            Town: 'BRISTOL',
            County: 'AVON',
            Country: '',
            Expires: null,
            Forename: 'AMARA',
            Initials: 'A',
            Modified: '20080327',
            Postcode: 'BS1 5AH',
            contacts: [
              {
                name: 'GUPTA',
                role: 'Licence holder',
                town: 'BRISTOL',
                type: 'Person',
                county: 'AVON',
                country: null,
                forename: 'AMARA',
                initials: 'A',
                postcode: 'BS1 5AH',
                salutation: null,
                addressLine1: 'ENVIRONMENT AGENCY',
                addressLine2: 'HORIZON HOUSE',
                addressLine3: 'DEANERY ROAD',
                addressLine4: null
              }
            ],
            IsCurrent: true,
            Salutation: '',
            AddressLine1: 'ENVIRONMENT AGENCY',
            AddressLine2: 'HORIZON HOUSE',
            AddressLine3: 'DEANERY ROAD',
            AddressLine4: ''
          }
        }
      })
    })
  })
})
