'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillingAccountsFixture = require('../../../support/fixtures/billing-accounts.fixture.js')
const CustomersFixture = require('../../../support/fixtures/customers.fixture.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const CheckPresenter = require('../../../../app/presenters/billing-accounts/setup/check.presenter.js')

describe('Billing Accounts - Setup - Check Presenter', () => {
  const billingAccount = BillingAccountsFixture.billingAccount().billingAccount
  const address = billingAccount.billingAccountAddresses[0].address
  const companysHouseResult = {
    companiesHouseNumber: '12345678',
    title: 'ENVIRONMENT AGENCY'
  }
  const exampleContacts = CustomersFixture.companyContacts()
  const contact = exampleContacts[0].contact
  const companyContacts = {
    company: billingAccount.company,
    contacts: [contact]
  }

  let session

  beforeEach(() => {
    session = {
      billingAccount,
      id: generateUUID()
    }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = CheckPresenter.go(session, companyContacts, [], null)

      expect(result).to.equal({
        accountSelected: 'Another billing account',
        accountType: '',
        addressSelected: ['New'],
        companiesHouseName: '',
        companySearch: '',
        existingAccount: '',
        links: {
          accountSelected: `/system/billing-accounts/setup/${session.id}/account`,
          accountType: `/system/billing-accounts/setup/${session.id}/account-type`,
          addressSelected: `/system/billing-accounts/setup/${session.id}/existing-address`,
          companiesHouseName: `/system/billing-accounts/setup/${session.id}/select-company`,
          companySearch: `/system/billing-accounts/setup/${session.id}/company-search`,
          existingAccount: `/system/billing-accounts/setup/${session.id}/existing-account`
        },
        pageTitle: 'Check billing account details',
        pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`,
        searchIndividualInput: '',
        searchInput: ''
      })
    })
  })

  describe('the "accountSelected" property', () => {
    describe('when called with the "accountSelected" set to "customer"', () => {
      it('returns the name from the billing account', () => {
        const result = CheckPresenter.go(
          {
            ...session,
            accountSelected: 'customer'
          },
          companyContacts,
          address,
          companysHouseResult
        )

        expect(result.accountSelected).to.equal(session.billingAccount.company.name)
      })
    })

    describe('when called with the "accountSelected" set to "another"', () => {
      it('returns the name from the billing account', () => {
        const result = CheckPresenter.go(
          {
            ...session,
            accountSelected: 'another'
          },
          companyContacts,
          address,
          companysHouseResult
        )

        expect(result.accountSelected).to.equal('Another billing account')
      })
    })
  })

  describe('the "searchInput" property', () => {
    describe('when called with the "searchInput" set', () => {
      it('returns the saved search input', () => {
        const result = CheckPresenter.go(
          {
            ...session,
            searchInput: 'Customer name'
          },
          companyContacts,
          address,
          companysHouseResult
        )

        expect(result.searchInput).to.equal('Customer name')
      })
    })

    describe('when called with the "searchInput" set to null', () => {
      it('returns an empty string', () => {
        const result = CheckPresenter.go(
          {
            ...session,
            searchInput: null
          },
          companyContacts,
          address,
          companysHouseResult
        )

        expect(result.searchInput).to.equal('')
      })
    })
  })

  describe('the "existingAccount" property', () => {
    describe('when called with the "existingAccount" set to new', () => {
      it('returns "New billing account"', () => {
        const result = CheckPresenter.go(
          {
            ...session,
            existingAccount: 'new'
          },
          companyContacts,
          address,
          companysHouseResult
        )

        expect(result.existingAccount).to.equal('New billing account')
      })
    })

    describe('when called with the "existingAccount" set to null', () => {
      it('returns an empty string', () => {
        const result = CheckPresenter.go(
          {
            ...session,
            existingAccount: null
          },
          companyContacts,
          address,
          companysHouseResult
        )

        expect(result.existingAccount).to.equal('')
      })
    })

    describe('when called with the "existingAccount" set to an existing comapny id', () => {
      it('returns the name of that company', () => {
        const result = CheckPresenter.go(
          {
            ...session,
            existingAccount: billingAccount.company.id
          },
          companyContacts,
          address,
          companysHouseResult
        )

        expect(result.existingAccount).to.equal('Ferns Surfacing Limited')
      })
    })
  })

  describe('the "accountType" property', () => {
    describe('when called with the "accountType" set to "company"', () => {
      it('returns "company"', () => {
        const result = CheckPresenter.go(
          {
            ...session,
            accountType: 'company'
          },
          companyContacts,
          address,
          companysHouseResult
        )

        expect(result.accountType).to.equal('company')
      })
    })

    describe('when called with the "accountType" set to "individual"', () => {
      it('returns "individual"', () => {
        const result = CheckPresenter.go(
          {
            ...session,
            accountType: 'individual'
          },
          companyContacts,
          address,
          companysHouseResult
        )

        expect(result.accountType).to.equal('individual')
      })
    })
  })

  describe('the "searchIndividualInput" property', () => {
    describe('when called with the "searchIndividualInput" set', () => {
      it('returns the saved search input', () => {
        const result = CheckPresenter.go(
          {
            ...session,
            searchIndividualInput: 'Customer name'
          },
          companyContacts,
          address,
          companysHouseResult
        )

        expect(result.searchIndividualInput).to.equal('Customer name')
      })
    })

    describe('when called with the "searchIndividualInput" set to null', () => {
      it('returns an empty string', () => {
        const result = CheckPresenter.go(
          {
            ...session,
            searchIndividualInput: null
          },
          companyContacts,
          address,
          companysHouseResult
        )

        expect(result.searchIndividualInput).to.equal('')
      })
    })
  })

  describe('the "addressSelected" property', () => {
    describe('when called with a address selected', () => {
      it('returns an array of address lines', () => {
        const result = CheckPresenter.go(
          {
            ...session,
            addressSelected: generateUUID()
          },
          companyContacts,
          address,
          companysHouseResult
        )

        expect(result.addressSelected).to.equal(['Tutsham Farm', 'West Farleigh', 'Maidstone', 'Kent', 'ME15 0NE'])
      })
    })

    describe('when called with the "addressSelected" set to "new"', () => {
      it('returns an array with the string "New"', () => {
        const result = CheckPresenter.go(
          {
            ...session,
            addressSelected: 'new'
          },
          companyContacts,
          [],
          companysHouseResult
        )

        expect(result.addressSelected).to.equal(['New'])
      })
    })
  })

  describe('the "companySearch" property', () => {
    describe('when a company has been searched for', () => {
      it('returns the term used in the search', () => {
        const result = CheckPresenter.go(
          {
            ...session,
            companySearch: 'Company name'
          },
          companyContacts,
          address,
          companysHouseResult
        )

        expect(result.companySearch).to.equal('Company name')
      })
    })

    describe('when a company has not been searched for', () => {
      it('returns an empty string', () => {
        const result = CheckPresenter.go(
          {
            ...session,
            companySearch: null
          },
          companyContacts,
          [],
          companysHouseResult
        )

        expect(result.companySearch).to.equal('')
      })
    })
  })

  describe('the "companiesHouseName" property', () => {
    describe('when a company has been selected', () => {
      it('returns the name of the company', () => {
        const result = CheckPresenter.go(
          {
            ...session
          },
          companyContacts,
          address,
          companysHouseResult
        )

        expect(result.companiesHouseName).to.equal(companysHouseResult.title)
      })
    })

    describe('when a company has not been searched for', () => {
      it('returns an empty string', () => {
        const result = CheckPresenter.go(
          {
            ...session
          },
          companyContacts,
          [],
          null
        )

        expect(result.companiesHouseName).to.equal('')
      })
    })
  })
})
