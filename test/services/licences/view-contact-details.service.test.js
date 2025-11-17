'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../app/lib/general.lib.js')
const { generateLicenceRef } = require('../../support/helpers/licence.helper.js')

// Things we need to stub
const FetchLicenceContactDetailsService = require('../../../app/services/licences/fetch-licence-contact-details.service.js')

// Thing under test
const ViewContactDetailsService = require('../../../app/services/licences/view-contact-details.service.js')

describe('Licences - View Contact Details service', () => {
  let licenceId
  let licenceRef

  beforeEach(() => {
    licenceId = generateUUID()
    licenceRef = generateLicenceRef()

    Sinon.stub(FetchLicenceContactDetailsService, 'go').returns(
      _testFetchLicenceContactDetailsData(licenceId, licenceRef)
    )
  })

  describe('when a licence with a matching ID exists', () => {
    it('correctly presents the data', async () => {
      const result = await ViewContactDetailsService.go(licenceId)

      expect(result).to.equal({
        activeNavBar: 'search',
        backLink: {
          href: `/system/licences/${licenceId}/summary`,
          text: 'Go back to summary'
        },
        licenceContactDetails: [
          {
            address: ['ENVIRONMENT AGENCY', 'HORIZON HOUSE', 'DEANERY ROAD', 'BRISTOL', 'AVON', 'BS1 5AH'],
            name: 'A GUPTA',
            role: 'Licence holder'
          }
        ],
        pageTitle: 'Licence contact details',
        pageTitleCaption: `Licence ${licenceRef}`
      })
    })
  })
})

function _testFetchLicenceContactDetailsData(licenceId, licenceRef) {
  return {
    id: licenceId,
    licenceRef,
    licenceDocumentHeader: {
      id: generateUUID(),
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
      },
      licenceEntityRoles: []
    }
  }
}
