'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Test helpers
const BillingAccountsFixture = require('../../../support/fixtures/billing-accounts.fixtures.js')
const CustomersFixture = require('../../../support/fixtures/customers.fixture.js')

// Thing under test
const ContactPresenter = require('../../../../app/presenters/billing-accounts/setup/contact.presenter.js')

describe('Billing Accounts - Setup - Contact Presenter', () => {
  const exampleContacts = CustomersFixture.companyContacts()
  const contact = exampleContacts[0].contact

  let session

  describe('when called', () => {
    beforeEach(() => {
      session = {
        billingAccount: BillingAccountsFixture.billingAccount().billingAccount
      }
    })

    it('returns page data for the view', () => {
      const result = ContactPresenter.go(session, exampleContacts)

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

  describe('the "contactSelected" property', () => {
    describe('when no contact has been selected', () => {
      beforeEach(() => {
        session = {
          billingAccount: BillingAccountsFixture.billingAccount().billingAccount
        }
      })
      it('returns null', () => {
        const result = ContactPresenter.go(session, exampleContacts)

        expect(result.contactSelected).to.equal(null)
      })
    })

    describe('when a contact has been selected', () => {
      beforeEach(() => {
        session = {
          billingAccount: BillingAccountsFixture.billingAccount().billingAccount,
          contactSelected: generateUUID()
        }
      })
      it('returns the selected contact ID', () => {
        const result = ContactPresenter.go(session, exampleContacts)

        expect(result.contactSelected).to.equal(session.contactSelected)
      })
    })
  })
})
