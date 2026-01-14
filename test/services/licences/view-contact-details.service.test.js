'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../fixtures/customers.fixture.js')
const { generateLicenceRef } = require('../../support/helpers/licence.helper.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Things we need to stub
const FetchCompanyContactsService = require('../../../app/services/licences/fetch-company-contacts.service.js')
const FetchContactDetailsService = require('../../../app/services/licences/fetch-contact-details.service.js')
const FetchLicenceService = require('../../../app/services/licences/fetch-licence.service.js')
const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')

// Thing under test
const ViewContactDetailsService = require('../../../app/services/licences/view-contact-details.service.js')

describe('Licences - View Contact Details service', () => {
  let auth
  let companyId
  let licenceId
  let licenceRef

  beforeEach(() => {
    licenceId = generateUUID()
    licenceRef = generateLicenceRef()

    auth = {
      credentials: {
        roles: [
          {
            role: 'billing'
          }
        ]
      }
    }

    companyId = generateUUID()

    Sinon.stub(FetchLicenceService, 'go').returns({
      licenceRef
    })

    Sinon.stub(FetchContactDetailsService, 'go').returns([
      {
        communicationType: 'Licence Holder',
        companyId,
        companyName: 'Acme ltd',
        contactId: null,
        firstName: null,
        lastName: null,
        address1: '34 Eastgate',
        address2: null,
        address3: null,
        address4: null,
        address5: null,
        address6: null,
        postcode: 'CF71 7DG',
        country: 'United Kingdom'
      }
    ])

    Sinon.stub(FetchCompanyContactsService, 'go').returns(CustomersFixtures.companyContacts())

    Sinon.stub(FeatureFlagsConfig, 'enableCustomerView').value(true)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewContactDetailsService.go(licenceId, auth)

      expect(result).to.equal({
        activeNavBar: 'search',
        activeSecondaryNav: 'contact-details',
        backLink: {
          href: '/',
          text: 'Go back to search'
        },
        companyContacts: [
          {
            communicationType: 'Additional Contact',
            email: 'rachael.tyrell@tyrellcorp.com',
            name: 'Rachael Tyrell'
          }
        ],
        customerId: companyId,
        customerContactLink: `/system/customers/${companyId}/contacts`,
        licenceContacts: [
          {
            address: {
              address1: '34 Eastgate',
              address2: null,
              address3: null,
              address4: null,
              address5: null,
              address6: null,
              country: 'United Kingdom',
              postcode: 'CF71 7DG'
            },
            communicationType: 'Licence Holder',
            name: 'Acme ltd'
          }
        ],
        pageTitle: 'Contact details',
        pageTitleCaption: `Licence ${licenceRef}`,
        roles: ['billing']
      })
    })
  })
})
