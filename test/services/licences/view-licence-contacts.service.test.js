'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const FetchLicenceContactsService = require('../../../app/services/licences/fetch-licence-contacts.service.js')
const FetchCustomerContactsService = require('../../../app/services/licences/fetch-customer-contacts.service.js')
const ViewLicenceService = require('../../../app/services/licences/view-licence.service.js')

// Thing under test
const ViewLicenceContactsService = require('../../../app/services/licences/view-licence-contacts.service.js')

describe('View Licence Contacts service', () => {
  const auth = {}
  const testId = '2c80bd22-a005-4cf4-a2a2-73812a9861de'

  beforeEach(() => {
    Sinon.stub(FetchLicenceContactsService, 'go').returns([{
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
    }])

    Sinon.stub(FetchCustomerContactsService, 'go').returns([{
      communicationType: 'Additional Contact',
      email: 'dfd@email.com',
      firstName: 'Donald',
      initials: null,
      lastName: 'Duck',
      middleInitials: null,
      salutation: null,
      suffix: null
    }])

    Sinon.stub(ViewLicenceService, 'go').resolves({ licenceName: 'fake licence' })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewLicenceContactsService.go(testId, auth)

      expect(result).to.equal({
        activeTab: 'contact-details',
        customerContacts: [{
          communicationType: 'Additional Contact',
          email: 'dfd@email.com',
          name: 'Donald Duck'
        }],
        licenceName: 'fake licence',
        customerId: 'ebe95a21-c6f6-4f15-8856-a48ffc737731',
        licenceContacts: [{
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
        }]
      })
    })
  })
})
