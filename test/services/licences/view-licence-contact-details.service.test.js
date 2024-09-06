'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const FetchLicenceContactDetailsService = require('../../../app/services/licences/fetch-licence-contact-details.service.js')

// Thing under test
const ViewLicenceContactDetailsService = require('../../../app/services/licences/view-licence-contact-details.service.js')

describe('View Licence Contact Details service', () => {
  const licenceId = 'fea88a95-d81f-4c5c-b497-00e5891a5861'

  before(() => {
    Sinon.stub(FetchLicenceContactDetailsService, 'go').returns(_testFetchLicenceContactDetailsData())
  })

  describe('when a licence with a matching ID exists', () => {
    it('correctly presents the data', async () => {
      const result = await ViewLicenceContactDetailsService.go(licenceId)

      expect(result).to.equal({
        activeNavBar: 'search',
        licenceContactDetails: [
          {
            address: [
              'ENVIRONMENT AGENCY',
              'HORIZON HOUSE',
              'DEANERY ROAD',
              'BRISTOL',
              'AVON',
              'BS1 5AH'
            ],
            name: 'A GUPTA',
            role: 'Licence holder'
          }
        ],
        licenceId: 'fea88a95-d81f-4c5c-b497-00e5891a5861',
        licenceRef: '01/123',
        pageTitle: 'Licence contact details'
      })
    })
  })
})

function _testFetchLicenceContactDetailsData () {
  return {
    id: 'fea88a95-d81f-4c5c-b497-00e5891a5861',
    licenceRef: '01/123',
    licenceDocumentHeader: {
      id: 'e27682b4-8c28-4db0-bb0a-685380537bc5',
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
  }
}
