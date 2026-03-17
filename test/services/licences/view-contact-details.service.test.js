'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateLicenceRef } = require('../../support/helpers/licence.helper.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Things we need to stub
const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')
const FetchLicenceCRMDataService = require('../../../app/services/licences/fetch-licence-crm-data.service.js')
const FetchLicenceService = require('../../../app/services/licences/fetch-licence.service.js')

// Thing under test
const ViewContactDetailsService = require('../../../app/services/licences/view-contact-details.service.js')

describe('Licences - View Contact Details service', () => {
  let auth
  let companyId
  let contacts
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

    contacts = [
      {
        id: companyId,
        contactType: 'licence-holder',
        contactName: 'Eldon Tyrell'
      }
    ]

    Sinon.stub(FetchLicenceService, 'go').returns({
      licenceRef
    })

    Sinon.stub(FetchLicenceCRMDataService, 'go').returns({
      contacts,
      totalNumber: contacts.length
    })

    Sinon.stub(FeatureFlagsConfig, 'enableCustomerView').value(true)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewContactDetailsService.go(licenceId, auth)

      expect(result).to.equal({
        activeSecondaryNav: 'contact-details',
        backLink: {
          href: '/',
          text: 'Go back to search'
        },
        customerContactLink: `/system/companies/${companyId}/contacts`,
        contacts: [
          {
            action: `/system/companies/${companyId}/licence-holder`,
            name: 'Eldon Tyrell',
            type: 'Licence holder'
          }
        ],
        pageTitle: 'Contact details',
        pageTitleCaption: `Licence ${licenceRef}`,
        pagination: {
          currentPageNumber: 1,
          numberOfPages: 1,
          showingMessage: 'Showing all 1 contacts'
        },
        roles: ['billing']
      })
    })
  })
})
