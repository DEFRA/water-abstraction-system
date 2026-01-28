'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../support/fixtures/customers.fixture.js')

// Things we need to stub
const CompanyContactModel = require('../../../app/models/company-contact.model.js')
const FetchCompanyContactService = require('../../../app/services/company-contacts/fetch-company-contact.service.js')

// Thing under test
const SubmitRemoveCompanyContactService = require('../../../app/services/company-contacts/submit-remove-company-contact.service.js')

describe('Company Contacts - Submit Remove Company Contact Service', () => {
  let companyContact
  let yarStub

  beforeEach(async () => {
    companyContact = CustomersFixtures.companyContact()

    Sinon.stub(FetchCompanyContactService, 'go').resolves(companyContact)

    Sinon.stub(CompanyContactModel, 'query').returns({
      deleteById: Sinon.stub().returnsThis()
    })

    yarStub = { flash: Sinon.stub() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await SubmitRemoveCompanyContactService.go(companyContact.id, yarStub)

      expect(result).to.equal({
        companyId: companyContact.companyId
      })
    })

    it('sets a flash message', async () => {
      await SubmitRemoveCompanyContactService.go(companyContact.id, yarStub)

      // Check we add the flash message
      const [flashType, bannerMessage] = yarStub.flash.args[0]

      expect(flashType).to.equal('notification')
      expect(bannerMessage).to.equal({
        text: 'Rachael Tyrell was removed from this company.',
        titleText: 'Contact removed'
      })
    })
  })
})
