'use strict'

// Test helpers
const BillingAccountsFixture = require('../../../support/fixtures/billing-accounts.fixture.js')
const CustomersFixture = require('../../../support/fixtures/customers.fixture.js')

// Thing under test
const ContactPresenter = require('../../../../app/presenters/billing-accounts/setup/contact.presenter.js')

describe('Billing Accounts - Setup - Contact Presenter', () => {
  const billingAccount = BillingAccountsFixture.billingAccount().billingAccount
  const exampleContacts = CustomersFixture.companyContacts()
  const company = billingAccount.company
  const contact = exampleContacts[0].contact
  const companyContacts = {
    company,
    contacts: [contact]
  }

  let session

  beforeEach(() => {
    session = {
      billingAccount
    }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = ContactPresenter(session, companyContacts)

      expect(result).toEqual({
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
        pageTitle: `Set up a contact for ${company.name}`,
        pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`
      })
    })
  })

  describe('the "contactSelected" property', () => {
    describe('when no contact has been selected', () => {
      it('returns null', () => {
        const result = ContactPresenter(session, companyContacts)

        expect(result.contactSelected).toEqual(null)
      })
    })

    describe('when a contact has been selected', () => {
      beforeEach(() => {
        session.contactSelected = contact.id
      })

      it('returns the selected contact ID', () => {
        const result = ContactPresenter(session, companyContacts)

        expect(result.contactSelected).toEqual(session.contactSelected)
      })
    })
  })

  describe('"pageTitle" property', () => {
    describe('when there are contacts returned', () => {
      it('returns the correct page title', () => {
        const result = ContactPresenter(session, companyContacts)

        expect(result.pageTitle).toEqual(`Set up a contact for ${company.name}`)
      })
    })

    describe('when there are no contacts returned', () => {
      beforeEach(() => {
        companyContacts.contacts = []
      })

      it('returns the correct page title', () => {
        const result = ContactPresenter(session, companyContacts)

        expect(result.pageTitle).toEqual(`No company contacts found for "${company.name}"`)
      })
    })
  })

  describe('"backLink" property', () => {
    describe('when check page has not been visited', () => {
      beforeEach(() => {
        session = {
          billingAccount,
          contactSelected: contact.id
        }
      })

      it('returns the correct back link', () => {
        const result = ContactPresenter(session, companyContacts)

        expect(result.backLink.href).toEqual(`/system/billing-accounts/setup/${session.id}/fao`)
      })
    })

    describe('when check page has been visited', () => {
      beforeEach(() => {
        session = {
          billingAccount,
          checkPageVisited: true,
          contactSelected: contact.id
        }
      })

      it('returns the correct back link', () => {
        const result = ContactPresenter(session, companyContacts)

        expect(result.backLink.href).toEqual(`/system/billing-accounts/setup/${session.id}/check`)
      })
    })
  })
})
