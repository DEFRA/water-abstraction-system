// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import BillingAccountsFixture from '../../../support/fixtures/billing-accounts.fixture.js'
import CustomersFixture from '../../../support/fixtures/customers.fixture.js'
import GenerateHelper from '../../../support/helpers/generate.helper.js'
import { generateUUID } from '../../../../app/lib/general.lib.js'

// Thing under test
import CheckPresenter from '../../../../app/presenters/billing-accounts/setup/check.presenter.js'

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
      const result = CheckPresenter(session, companyContacts, [], null)

      expect(result).toEqual({
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
        impactedLicences: undefined,
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
        individualName: '',
        searchInput: ''
      })
    })
  })

  describe('the "accountSelected" property', () => {
    describe('when called with the "accountSelected" set to a UUID', () => {
      it('returns the name from the billing account', () => {
        const result = CheckPresenter(
          {
            ...session,
            accountSelected: generateUUID()
          },
          companyContacts,
          address,
          companysHouseResult
        )

        expect(result.accountSelected).toEqual(session.billingAccount.company.name)
      })
    })

    describe('when called with the "accountSelected" set to "another"', () => {
      it('returns the name from the billing account', () => {
        const result = CheckPresenter(
          {
            ...session,
            accountSelected: 'another'
          },
          companyContacts,
          address,
          companysHouseResult
        )

        expect(result.accountSelected).toEqual('Another billing account')
      })
    })
  })

  describe('the "searchInput" property', () => {
    describe('when called with the "searchInput" set', () => {
      it('returns the saved search input', () => {
        const result = CheckPresenter(
          {
            ...session,
            searchInput: 'Customer name'
          },
          companyContacts,
          address,
          companysHouseResult
        )

        expect(result.searchInput).toEqual('Customer name')
      })
    })

    describe('when called with the "searchInput" set to null', () => {
      it('returns an empty string', () => {
        const result = CheckPresenter(
          {
            ...session,
            searchInput: null
          },
          companyContacts,
          address,
          companysHouseResult
        )

        expect(result.searchInput).toEqual('')
      })
    })
  })

  describe('the "existingAccount" property', () => {
    describe('when called with the "existingAccount" set to new', () => {
      it('returns "New billing account"', () => {
        const result = CheckPresenter(
          {
            ...session,
            existingAccount: 'new'
          },
          companyContacts,
          address,
          companysHouseResult
        )

        expect(result.existingAccount).toEqual('New billing account')
      })
    })

    describe('when called with the "existingAccount" set to null', () => {
      it('returns an empty string', () => {
        const result = CheckPresenter(
          {
            ...session,
            existingAccount: null
          },
          companyContacts,
          address,
          companysHouseResult
        )

        expect(result.existingAccount).toEqual('')
      })
    })

    describe('when called with the "existingAccount" set to an existing comapny id', () => {
      it('returns the name of that company', () => {
        const result = CheckPresenter(
          {
            ...session,
            existingAccount: billingAccount.company.id
          },
          companyContacts,
          address,
          companysHouseResult
        )

        expect(result.existingAccount).toEqual('Ferns Surfacing Limited')
      })
    })
  })

  describe('the "accountType" property', () => {
    describe('when called with the "accountType" set to "company"', () => {
      it('returns "company"', () => {
        const result = CheckPresenter(
          {
            ...session,
            accountType: 'company'
          },
          companyContacts,
          address,
          companysHouseResult
        )

        expect(result.accountType).toEqual('company')
      })
    })

    describe('when called with the "accountType" set to "individual"', () => {
      it('returns "individual"', () => {
        const result = CheckPresenter(
          {
            ...session,
            accountType: 'individual'
          },
          companyContacts,
          address,
          companysHouseResult
        )

        expect(result.accountType).toEqual('individual')
      })
    })
  })

  describe('the "individualName" property', () => {
    describe('when called with the "individualName" set', () => {
      it('returns the saved search input', () => {
        const result = CheckPresenter(
          {
            ...session,
            individualName: 'Customer name'
          },
          companyContacts,
          address,
          companysHouseResult
        )

        expect(result.individualName).toEqual('Customer name')
      })
    })

    describe('when called with the "individualName" set to null', () => {
      it('returns an empty string', () => {
        const result = CheckPresenter(
          {
            ...session,
            individualName: null
          },
          companyContacts,
          address,
          companysHouseResult
        )

        expect(result.individualName).toEqual('')
      })
    })
  })

  describe('the "addressSelected" property', () => {
    describe('when called with a address selected', () => {
      it('returns an array of address lines', () => {
        const result = CheckPresenter(
          {
            ...session,
            addressSelected: generateUUID()
          },
          companyContacts,
          address,
          companysHouseResult
        )

        expect(result.addressSelected).toEqual(['Tutsham Farm', 'West Farleigh', 'Maidstone', 'Kent', 'ME15 0NE'])
      })
    })

    describe('when called with the "addressSelected" set to "new"', () => {
      it('returns an array with the string "New"', () => {
        const result = CheckPresenter(
          {
            ...session,
            addressSelected: 'new'
          },
          companyContacts,
          [],
          companysHouseResult
        )

        expect(result.addressSelected).toEqual(['New'])
      })
    })
  })

  describe('the "companySearch" property', () => {
    describe('when a company has been searched for', () => {
      it('returns the term used in the search', () => {
        const result = CheckPresenter(
          {
            ...session,
            companySearch: 'Company name'
          },
          companyContacts,
          address,
          companysHouseResult
        )

        expect(result.companySearch).toEqual('Company name')
      })
    })

    describe('when a company has not been searched for', () => {
      it('returns an empty string', () => {
        const result = CheckPresenter(
          {
            ...session,
            companySearch: null
          },
          companyContacts,
          [],
          companysHouseResult
        )

        expect(result.companySearch).toEqual('')
      })
    })
  })

  describe('the "companiesHouseName" property', () => {
    describe('when a company has been selected', () => {
      it('returns the name of the company', () => {
        const result = CheckPresenter(
          {
            ...session
          },
          companyContacts,
          address,
          companysHouseResult
        )

        expect(result.companiesHouseName).toEqual(companysHouseResult.title)
      })
    })

    describe('when a company has not been searched for', () => {
      it('returns an empty string', () => {
        const result = CheckPresenter(
          {
            ...session
          },
          companyContacts,
          [],
          null
        )

        expect(result.companiesHouseName).toEqual('')
      })
    })
  })

  describe('the "fao" property', () => {
    describe('when "yes" was selected', () => {
      it('returns "yes"', () => {
        const result = CheckPresenter(
          {
            ...session,
            fao: 'yes'
          },
          companyContacts,
          address,
          companysHouseResult
        )

        expect(result.fao).toEqual('yes')
      })
    })

    describe('when "no" was selected', () => {
      it('returns "no"', () => {
        const result = CheckPresenter(
          {
            ...session,
            fao: 'no'
          },
          companyContacts,
          [],
          null
        )

        expect(result.fao).toEqual('no')
      })
    })
  })

  describe('the "contactSelected" property', () => {
    beforeEach(() => {
      companyContacts.contacts.push(contact)
    })

    describe('when "fao" was "no', () => {
      it('returns string for display', () => {
        const result = CheckPresenter(
          {
            ...session,
            fao: 'no'
          },
          companyContacts,
          address,
          companysHouseResult
        )

        expect(result.contactSelected).toEqual(null)
      })
    })

    describe('when "new" was selected', () => {
      it('returns string for display', () => {
        const result = CheckPresenter(
          {
            ...session,
            contactSelected: 'new',
            fao: 'yes'
          },
          companyContacts,
          address,
          companysHouseResult
        )

        expect(result.contactSelected).toEqual('New contact')
      })
    })

    describe('when an existing contact was selected', () => {
      it('returns the contact name', () => {
        const result = CheckPresenter(
          {
            ...session,
            contactSelected: contact.id,
            fao: 'yes'
          },
          companyContacts,
          address,
          companysHouseResult
        )

        expect(result.contactSelected).toEqual(contact.$name())
      })
    })
  })

  describe('the "contactName" property', () => {
    beforeEach(() => {
      companyContacts.contacts.push(contact)
    })

    describe('when a value is provided', () => {
      it('returns it for display', () => {
        const result = CheckPresenter(
          {
            ...session,
            contactSelected: contact.id,
            contactName: 'Jon Snow'
          },
          companyContacts,
          address,
          companysHouseResult
        )

        expect(result.contactName).toEqual('Jon Snow')
      })
    })

    describe('when there was no contact name entered', () => {
      it('returns the contact name', () => {
        const result = CheckPresenter(
          {
            ...session,
            contactSelected: contact.id
          },
          companyContacts,
          address,
          companysHouseResult
        )

        expect(result.contactName).toEqual('')
      })
    })
  })

  describe('the "impactedLicences" property', () => {
    describe('when an array is provided', () => {
      it('returns it for display', () => {
        const impactedLicences = [
          { licenceRef: GenerateHelper.generateLicenceRef() },
          { licenceRef: GenerateHelper.generateLicenceRef() }
        ]

        const result = CheckPresenter(
          {
            ...session
          },
          companyContacts,
          address,
          companysHouseResult,
          impactedLicences
        )

        expect(result.impactedLicences).toEqual(impactedLicences)
      })
    })

    describe('when there was no impacted licences', () => {
      it('returns undefined', () => {
        const result = CheckPresenter(
          {
            ...session
          },
          companyContacts,
          address,
          companysHouseResult
        )

        expect(result.impactedLicences).toBeUndefined()
      })
    })
  })

  describe('the "address" property', () => {
    describe('when there is an address lookup value provided', () => {
      it('returns an array of address lines', () => {
        const result = CheckPresenter(
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

        expect(result.address).toEqual(['ENVIRONMENT AGENCY', 'HORIZON HOUSE', 'BRISTOL', 'BS1 5AH'])
      })
    })

    describe('when there is a manual entry provided', () => {
      it('returns an array of address lines', () => {
        const result = CheckPresenter(
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

        expect(result.address).toEqual(['ENVIRONMENT AGENCY', 'HORIZON HOUSE', 'BRISTOL', 'BS1 5AH'])
      })
    })

    describe('when there is an international entry provided', () => {
      it('returns an array of address lines', () => {
        const result = CheckPresenter(
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

        expect(result.address).toEqual(['ENVIRONMENT AGENCY', 'HORIZON HOUSE', 'BRISTOL', 'BS1 5AH', 'ENGLAND'])
      })
    })

    describe('when there is no addressJourney provided', () => {
      it('returns an array of address lines', () => {
        const result = CheckPresenter(
          {
            ...session,
            addressJourney: null
          },
          [],
          [],
          null
        )

        expect(result.address).toEqual([])
      })
    })
  })
})
