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
    contacts: []
  }

  let session

  beforeEach(() => {
    session = {
      billingAccount,
      id: generateUUID(),
      fao: 'no'
    }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = CheckPresenter.go(session, companyContacts, [], null)

      expect(result).to.equal({
        accountSelected: 'Ferns Surfacing Limited',
        accountType: '',
        address: [],
        addressSelected: ['New'],
        companiesHouseName: '',
        companySearch: '',
        contactName: '',
        contactSelected: null,
        existingAccount: '',
        fao: 'no',
        links: {
          accountSelected: `/system/billing-accounts/setup/${session.id}/account`,
          accountType: `/system/billing-accounts/setup/${session.id}/account-type`,
          address: `/system/address/${session.id}/postcode`,
          addressSelected: `/system/billing-accounts/setup/${session.id}/existing-address`,
          companiesHouseName: `/system/billing-accounts/setup/${session.id}/select-company`,
          companySearch: `/system/billing-accounts/setup/${session.id}/company-search`,
          contactName: `/system/billing-accounts/setup/${session.id}/contact-name`,
          contactSelected: `/system/billing-accounts/setup/${session.id}/contact`,
          existingAccount: `/system/billing-accounts/setup/${session.id}/existing-account`,
          fao: `/system/billing-accounts/setup/${session.id}/fao`
        },
        pageTitle: 'Check billing account details',
        pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`,
        searchIndividualInput: '',
        searchInput: ''
      })
    })
  })

  describe('the "accountSelected" property', () => {
    describe('when called with the "accountSelected" set to a UUID', () => {
      it('returns the name from the billing account', () => {
        const result = CheckPresenter.go(
          {
            ...session,
            accountSelected: generateUUID()
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

  describe('the "fao" property', () => {
    describe('when "yes" was selected', () => {
      it('returns "yes"', () => {
        const result = CheckPresenter.go(
          {
            ...session,
            fao: 'yes'
          },
          companyContacts,
          address,
          companysHouseResult
        )

        expect(result.fao).to.equal('yes')
      })
    })

    describe('when "no" was selected', () => {
      it('returns "no"', () => {
        const result = CheckPresenter.go(
          {
            ...session,
            fao: 'no'
          },
          companyContacts,
          [],
          null
        )

        expect(result.fao).to.equal('no')
      })
    })
  })

  describe('the "contactSelected" property', () => {
    beforeEach(() => {
      companyContacts.contacts.push(contact)
    })

    describe('when "fao" was "no', () => {
      it('returns string for display', () => {
        const result = CheckPresenter.go(
          {
            ...session,
            fao: 'no'
          },
          companyContacts,
          address,
          companysHouseResult
        )

        expect(result.contactSelected).to.equal(null)
      })
    })

    describe('when "new" was selected', () => {
      it('returns string for display', () => {
        const result = CheckPresenter.go(
          {
            ...session,
            contactSelected: 'new',
            fao: 'yes'
          },
          companyContacts,
          address,
          companysHouseResult
        )

        expect(result.contactSelected).to.equal('New contact')
      })
    })

    describe('when an existing contact was selected', () => {
      it('returns the contact name', () => {
        const result = CheckPresenter.go(
          {
            ...session,
            contactSelected: contact.id,
            fao: 'yes'
          },
          companyContacts,
          address,
          companysHouseResult
        )

        expect(result.contactSelected).to.equal(contact.$name())
      })
    })
  })

  describe('the "contactName" property', () => {
    beforeEach(() => {
      companyContacts.contacts.push(contact)
    })

    describe('when a value is provided', () => {
      it('returns it for display', () => {
        const result = CheckPresenter.go(
          {
            ...session,
            contactSelected: contact.id,
            contactName: 'Jon Snow'
          },
          companyContacts,
          address,
          companysHouseResult
        )

        expect(result.contactName).to.equal('Jon Snow')
      })
    })

    describe('when there was no contact name entered', () => {
      it('returns the contact name', () => {
        const result = CheckPresenter.go(
          {
            ...session,
            contactSelected: contact.id
          },
          companyContacts,
          address,
          companysHouseResult
        )

        expect(result.contactName).to.equal('')
      })
    })
  })

  describe('the "address" property', () => {
    describe('when there is an address lookup value provided', () => {
      it('returns an array of address lines', () => {
        const result = CheckPresenter.go(
          {
            ...session,
            addressJourney: {
              address: {
                uprn: 12345678,
                postcode: 'BS1 5AH',
                addressLine1: 'ENVIRONMENT AGENCY',
                addressLine2: 'HORIZON HOUSE',
                addressLine3: null,
                addressLine4: 'BRISTOL'
              }
            }
          },
          [],
          [],
          null
        )

        expect(result.address).to.equal(['ENVIRONMENT AGENCY', 'HORIZON HOUSE', 'BRISTOL', 'BS1 5AH'])
      })
    })

    describe('when there is a manual entry provided', () => {
      it('returns an array of address lines', () => {
        const result = CheckPresenter.go(
          {
            ...session,
            addressJourney: {
              address: {
                postcode: 'BS1 5AH',
                addressLine1: 'ENVIRONMENT AGENCY',
                addressLine2: 'HORIZON HOUSE',
                addressLine3: null,
                addressLine4: 'BRISTOL'
              }
            }
          },
          [],
          [],
          null
        )

        expect(result.address).to.equal(['ENVIRONMENT AGENCY', 'HORIZON HOUSE', 'BRISTOL', 'BS1 5AH'])
      })
    })

    describe('when there is an international entry provided', () => {
      it('returns an array of address lines', () => {
        const result = CheckPresenter.go(
          {
            ...session,
            addressJourney: {
              address: {
                country: 'ENGLAND',
                postcode: 'BS1 5AH',
                addressLine1: 'ENVIRONMENT AGENCY',
                addressLine2: 'HORIZON HOUSE',
                addressLine3: null,
                addressLine4: 'BRISTOL'
              }
            }
          },
          [],
          [],
          null
        )

        expect(result.address).to.equal(['ENVIRONMENT AGENCY', 'HORIZON HOUSE', 'BRISTOL', 'BS1 5AH', 'ENGLAND'])
      })
    })

    describe('when there is no addressJourney provided', () => {
      it('returns an array of address lines', () => {
        const result = CheckPresenter.go(
          {
            ...session,
            addressJourney: null
          },
          [],
          [],
          null
        )

        expect(result.address).to.equal([])
      })
    })
  })
})
