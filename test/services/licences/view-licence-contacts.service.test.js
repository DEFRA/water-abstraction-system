'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../app/lib/general.lib.js')
const { generateLicenceRef } = require('../../support/helpers/licence.helper.js')

// Things we need to stub
const FetchLicenceContactsService = require('../../../app/services/licences/fetch-licence-contacts.service.js')

// Thing under test
const ViewLicenceContactService = require('../../../app/services/licences/view-licence-contacts.service.js')

describe('Licences - View Licence Contacts service', () => {
  let licenceId
  let licenceRef

  beforeEach(() => {
    licenceId = generateUUID()
    licenceRef = generateLicenceRef()

    Sinon.stub(FetchLicenceContactsService, 'go').returns(_testFetchLicenceContactsData(licenceId, licenceRef))
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when a licence with a matching ID exists', () => {
    it('correctly presents the data', async () => {
      const result = await ViewLicenceContactService.go(licenceId)

      expect(result).to.equal({
        backLink: {
          href: `/system/licences/${licenceId}/summary`,
          text: 'Go back to summary'
        },
        licenceContacts: [
          {
            address: ['ENVIRONMENT AGENCY', 'HORIZON HOUSE', 'DEANERY ROAD', 'BRISTOL', 'AVON', 'BS1 5AH'],
            name: 'A GUPTA',
            role: 'Licence holder'
          }
        ],
        pageTitle: 'Licence contacts',
        pageTitleCaption: `Licence ${licenceRef}`
      })
    })
  })
})

function _testFetchLicenceContactsData(licenceId, licenceRef) {
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
