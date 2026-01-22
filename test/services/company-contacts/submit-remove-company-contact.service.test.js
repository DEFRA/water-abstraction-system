'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../fixtures/customers.fixture.js')

// Things we need to stub
const FetchCompanyContactService = require('../../../app/services/company-contacts/fetch-company-contact.service.js')

// Thing under test
const SubmitRemoveCompanyContactService = require('../../../app/services/company-contacts/submit-remove-company-contact.service.js')

describe('Company Contacts - Submit Company Contact Service', () => {
  let companyContact

  beforeEach(async () => {
    companyContact = CustomersFixtures.companyContact()

    Sinon.stub(FetchCompanyContactService, 'go').returns(companyContact)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await SubmitRemoveCompanyContactService.go(companyContact.id)

      expect(result).to.equal({
        companyId: companyContact.companyId
      })
    })
  })
})
