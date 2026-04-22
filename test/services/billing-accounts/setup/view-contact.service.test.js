'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillingAccountsFixture = require('../../../support/fixtures/billing-accounts.fixture.js')
const CustomersFixture = require('../../../support/fixtures/customers.fixture.js')
const SessionModelStub = require('../../../support/stubs/session.stub.js')

// Things we need to stub
const FetchCompanyContactsService = require('../../../../app/services/billing-accounts/setup/fetch-company-contacts.service.js')
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const ViewContactService = require('../../../../app/services/billing-accounts/setup/view-contact.service.js')

describe('Billing Accounts - Setup - Contact Service', () => {
  const billingAccount = BillingAccountsFixture.billingAccount().billingAccount
  const exampleContacts = CustomersFixture.companyContacts()
  const contact = exampleContacts[0].contact
  const companyContacts = {
    company: billingAccount.company,
    contacts: [contact]
  }

  let session
  let sessionData

  beforeEach(() => {
    Sinon.stub(FetchCompanyContactsService, 'go').resolves(companyContacts)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('and the contact is for the existing account', () => {
      beforeEach(() => {
        sessionData = {
          accountSelected: billingAccount.company.id,
          billingAccount
        }

        session = SessionModelStub.build(Sinon, sessionData)

        Sinon.stub(FetchSessionDal, 'go').resolves(session)
      })

      it('returns page data for the view', async () => {
        const result = await ViewContactService.go(session.id)

        expect(result).to.equal({
          backLink: {
            href: `/system/billing-accounts/setup/${session.id}/fao`,
            text: 'Back'
          },
          contactSelected: null,
          items: [
            {
              id: contact.id,
              value: contact.id,
              text: contact.$name(),
              checked: false
            },
            {
              divider: 'or'
            },
            {
              id: 'new',
              value: 'new',
              text: 'Add a new contact',
              checked: false
            }
          ],
          pageTitle: `Set up a contact for ${session.billingAccount.company.name}`,
          pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`
        })
      })
    })

    describe('and the contact is for a new account', () => {
      beforeEach(() => {
        sessionData = {
          accountSelected: 'another',
          billingAccount,
          existingAccount: billingAccount.company.id
        }

        session = SessionModelStub.build(Sinon, sessionData)

        Sinon.stub(FetchSessionDal, 'go').resolves(session)
      })

      it('returns page data for the view', async () => {
        const result = await ViewContactService.go(session.id)

        expect(result).to.equal({
          backLink: {
            href: `/system/billing-accounts/setup/${session.id}/fao`,
            text: 'Back'
          },
          contactSelected: null,
          items: [
            {
              id: contact.id,
              value: contact.id,
              text: contact.$name(),
              checked: false
            },
            {
              divider: 'or'
            },
            {
              id: 'new',
              value: 'new',
              text: 'Add a new contact',
              checked: false
            }
          ],
          pageTitle: `Set up a contact for ${session.billingAccount.company.name}`,
          pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`
        })
      })
    })
  })
})
