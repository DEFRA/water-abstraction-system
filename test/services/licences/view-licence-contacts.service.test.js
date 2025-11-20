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
const FetchLicenceContactsService = require('../../../app/services/licences/fetch-licence-contacts.service.js')
const FetchCustomerContactsService = require('../../../app/services/licences/fetch-customer-contacts.service.js')

// Thing under test
const ViewLicenceContactsService = require('../../../app/services/licences/view-licence-contacts.service.js')

describe('Licences - View Licence Contacts service', () => {
  let auth
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

    Sinon.stub(FetchLicenceContactsService, 'go').returns({
      licence: {
        licenceRef
      },
      licenceContacts: [
        {
          communicationType: 'Licence Holder',
          companyId: 'ebe95a21-c6f6-4f15-8856-a48ffc737731',
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
      ]
    })

    Sinon.stub(FetchCustomerContactsService, 'go').returns([
      {
        communicationType: 'Additional Contact',
        email: 'dfd@email.com',
        firstName: 'Donald',
        initials: null,
        lastName: 'Duck',
        middleInitials: null,
        salutation: null,
        suffix: null
      }
    ])
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewLicenceContactsService.go(licenceId, auth)

      expect(result).to.equal({
        activeNavBar: 'search',
        activeTab: 'contact-details',
        backLink: {
          href: '/licences',
          text: 'Go back to search'
        },
        customerContacts: [
          {
            communicationType: 'Additional Contact',
            email: 'dfd@email.com',
            name: 'Donald Duck'
          }
        ],
        customerId: 'ebe95a21-c6f6-4f15-8856-a48ffc737731',
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
