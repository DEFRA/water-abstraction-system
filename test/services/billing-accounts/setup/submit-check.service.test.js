// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import AddressHelper from '../../../support/helpers/address.helper.js'
import BillingAccountAddressHelper from '../../../support/helpers/billing-account-address.helper.js'
import BillingAccountHelper from '../../../support/helpers/billing-account.helper.js'
import CompanyHelper from '../../../support/helpers/company.helper.js'
import ContactHelper from '../../../support/helpers/contact.helper.js'
import CustomersFixture from '../../../support/fixtures/customers.fixture.js'
import SessionModelStub from '../../../support/stubs/session.stub.js'

// Things to stub
import * as FetchCompanyContactsService from '../../../../app/services/billing-accounts/setup/fetch-company-contacts.service.js'
import * as FetchCompanyService from '../../../../app/services/billing-accounts/setup/fetch-company.service.js'
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'
import * as SendCustomerChangeService from '../../../../app/services/billing-accounts/send-customer-change.service.js'

// Thing under test
import SubmitCheckService from '../../../../app/services/billing-accounts/setup/submit-check.service.js'

describe('Billing Accounts - Setup - Submit Check Service', () => {
  let address
  let billingAccount
  let billingAccountAddress
  let company
  let companyContacts
  let contact
  let existingCompany
  let session
  let sessionData

  const exampleContacts = CustomersFixture.companyContacts()

  const companySearchResult = {
    address: 'HORIZON HOUSE, DEANERY ROAD, BRISTOL, BS1 5AH',
    number: '12345678',
    title: 'ENVIRONMENT AGENCY'
  }

  beforeEach(async () => {
    address = await AddressHelper.add()
    company = await CompanyHelper.add()
    contact = await ContactHelper.add({
      ...exampleContacts[0].contact
    })
    billingAccount = await BillingAccountHelper.add({ companyId: company.id })
    billingAccountAddress = await BillingAccountAddressHelper.add({
      addressId: address.id,
      billingAccountId: billingAccount.id,
      companyId: company.id,
      contactId: contact.id
    })

    sessionData = {
      billingAccount: {
        ...billingAccount,
        billingAccountAddresses: [billingAccountAddress],
        company
      }
    }

    companyContacts = {
      company: sessionData.billingAccount.company,
      contacts: [contact]
    }

    vi.spyOn(FetchCompanyContactsService, 'default').mockResolvedValue(companyContacts)
    vi.spyOn(SendCustomerChangeService, 'default').mockResolvedValue()
  })

  afterEach(async () => {
    await address.$query().delete()
    await company.$query().delete()
    await contact.$query().delete()
    await billingAccount.$query().delete()
    await billingAccountAddress.$query().delete()
    await session.$query().delete()
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('and the user has selected the existing billing account', () => {
      beforeEach(async () => {
        sessionData.accountSelected = billingAccount.id
      })

      describe('and selected an existing address', () => {
        beforeEach(async () => {
          sessionData.addressSelected = address.id
        })

        describe('and added an FAO', () => {
          beforeEach(async () => {
            sessionData.fao = 'yes'
            sessionData.contactName = 'Contact Name'
            sessionData.contactSelected = 'new'

            session = SessionModelStub(sessionData)

            vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
          })

          it('creates a new billing account address', async () => {
            const result = await SubmitCheckService(session.id)

            expect(result.redirectUrl).toEqual(`/system/billing-accounts/${billingAccount.id}`)
            expect(result.billingAccountAddress.billingAccountId).toEqual(billingAccount.id)
            expect(result.billingAccountAddress.addressId).toEqual(address.id)
            expect(result.billingAccountAddress.companyId).toEqual(company.id)
            expect(result.billingAccountAddress.contactId).not.toEqual(contact.id)
            expect(result.billingAccountAddress.contactId).toBeDefined()
            expect(result.address.id).toEqual(address.id)
            expect(result.agentCompany.id).toEqual(company.id)
            expect(result.contact.contactType).toEqual('department')
            expect(result.contact.department).toEqual(sessionData.contactName)
          })
        })

        describe('and has not added an FAO', () => {
          beforeEach(async () => {
            sessionData.fao = 'no'
            sessionData.contactName = null
            sessionData.contactSelected = null

            session = SessionModelStub(sessionData)

            vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
          })

          it('creates a new billing account address', async () => {
            const result = await SubmitCheckService(session.id)

            expect(result.billingAccountAddress.billingAccountId).toEqual(billingAccount.id)
            expect(result.billingAccountAddress.addressId).toEqual(address.id)
            expect(result.billingAccountAddress.companyId).toEqual(company.id)
            expect(result.billingAccountAddress.contactId).toBeUndefined()
            expect(result.address.id).toEqual(address.id)
            expect(result.agentCompany.id).toEqual(company.id)
            expect(result.contact).toBeNull()
          })
        })

        describe('and selected an existing contact as an FAO', () => {
          beforeEach(async () => {
            sessionData.fao = 'yes'
            sessionData.contactName = null
            sessionData.contactSelected = contact.id

            session = SessionModelStub(sessionData)

            vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
          })

          it('creates a new billing account address', async () => {
            const result = await SubmitCheckService(session.id)

            expect(result.billingAccountAddress.billingAccountId).toEqual(billingAccount.id)
            expect(result.billingAccountAddress.addressId).toEqual(address.id)
            expect(result.billingAccountAddress.companyId).toEqual(company.id)
            expect(result.billingAccountAddress.contactId).not.toEqual(contact.id)
            expect(result.billingAccountAddress.contactId).toBeDefined()
            expect(result.address.id).toEqual(address.id)
            expect(result.agentCompany.id).toEqual(company.id)
            expect(result.contact.contactType).toEqual('department')
            expect(result.contact.department).toEqual(contact.$name())
          })
        })
      })

      describe('and selected to create a new address', () => {
        beforeEach(async () => {
          sessionData.addressSelected = 'new'
          sessionData.addressJourney = _addressJourney()
        })

        describe('and added an FAO', () => {
          beforeEach(async () => {
            sessionData.fao = 'yes'
            sessionData.contactName = 'Contact Name'
            sessionData.contactSelected = 'new'

            session = SessionModelStub(sessionData)

            vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
          })

          it('creates a new billing account address', async () => {
            const result = await SubmitCheckService(session.id)

            expect(result.billingAccountAddress.billingAccountId).toEqual(billingAccount.id)
            expect(result.billingAccountAddress.addressId).not.toEqual(address.id)
            expect(result.billingAccountAddress.addressId).toBeDefined()
            expect(result.billingAccountAddress.companyId).toEqual(company.id)
            expect(result.billingAccountAddress.contactId).not.toEqual(contact.id)
            expect(result.billingAccountAddress.contactId).toBeDefined()
            expect(result.address.uprn).toEqual(sessionData.addressJourney.address.uprn)
            expect(result.address.address1).toEqual(sessionData.addressJourney.address.addressLine1)
            expect(result.address.address2).toEqual(sessionData.addressJourney.address.addressLine2)
            expect(result.address.address3).toEqual(sessionData.addressJourney.address.addressLine3)
            expect(result.address.address4).toEqual(sessionData.addressJourney.address.addressLine4)
            expect(result.address.postcode).toEqual(sessionData.addressJourney.address.postcode)
            expect(result.agentCompany.id).toEqual(company.id)
            expect(result.contact.contactType).toEqual('department')
            expect(result.contact.department).toEqual(sessionData.contactName)
          })
        })

        describe('and has not added an FAO', () => {
          beforeEach(async () => {
            sessionData.fao = 'no'
            sessionData.contactName = null
            sessionData.contactSelected = null

            session = SessionModelStub(sessionData)

            vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
          })

          it('creates a new billing account address', async () => {
            const result = await SubmitCheckService(session.id)

            expect(result.billingAccountAddress.billingAccountId).toEqual(billingAccount.id)
            expect(result.billingAccountAddress.addressId).not.toEqual(address.id)
            expect(result.billingAccountAddress.addressId).toBeDefined()
            expect(result.billingAccountAddress.companyId).toEqual(company.id)
            expect(result.billingAccountAddress.contactId).toBeUndefined()
            expect(result.address.uprn).toEqual(sessionData.addressJourney.address.uprn)
            expect(result.address.address1).toEqual(sessionData.addressJourney.address.addressLine1)
            expect(result.address.address2).toEqual(sessionData.addressJourney.address.addressLine2)
            expect(result.address.address3).toEqual(sessionData.addressJourney.address.addressLine3)
            expect(result.address.address4).toEqual(sessionData.addressJourney.address.addressLine4)
            expect(result.address.postcode).toEqual(sessionData.addressJourney.address.postcode)
            expect(result.agentCompany.id).toEqual(company.id)
            expect(result.contact).toBeNull()
          })
        })

        describe('and selected an existing contact as an FAO', () => {
          beforeEach(async () => {
            sessionData.fao = 'yes'
            sessionData.contactSelected = contact.id

            session = SessionModelStub(sessionData)

            vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
          })

          it('creates a new billing account address', async () => {
            const result = await SubmitCheckService(session.id)

            expect(result.billingAccountAddress.billingAccountId).toEqual(billingAccount.id)
            expect(result.billingAccountAddress.addressId).not.toEqual(address.id)
            expect(result.billingAccountAddress.addressId).toBeDefined()
            expect(result.billingAccountAddress.companyId).toEqual(company.id)
            expect(result.billingAccountAddress.contactId).not.toEqual(contact.id)
            expect(result.billingAccountAddress.contactId).toBeDefined()
            expect(result.address.uprn).toEqual(sessionData.addressJourney.address.uprn)
            expect(result.address.address1).toEqual(sessionData.addressJourney.address.addressLine1)
            expect(result.address.address2).toEqual(sessionData.addressJourney.address.addressLine2)
            expect(result.address.address3).toEqual(sessionData.addressJourney.address.addressLine3)
            expect(result.address.address4).toEqual(sessionData.addressJourney.address.addressLine4)
            expect(result.address.postcode).toEqual(sessionData.addressJourney.address.postcode)
            expect(result.agentCompany.id).toEqual(company.id)
            expect(result.contact.contactType).toEqual('department')
            expect(result.contact.department).toEqual(contact.$name())
          })
        })
      })
    })

    describe('and the user has searched for and chosen an existing billing account', () => {
      beforeEach(async () => {
        existingCompany = await CompanyHelper.add()

        sessionData.accountSelected = 'another'
        sessionData.existingAccount = existingCompany.id
      })

      describe('and selected an existing address', () => {
        beforeEach(async () => {
          sessionData.addressSelected = address.id
        })

        describe('and added an FAO', () => {
          beforeEach(async () => {
            sessionData.fao = 'yes'
            sessionData.contactName = 'Contact Name'
            sessionData.contactSelected = 'new'

            session = SessionModelStub(sessionData)

            vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
          })

          it('creates a new billing account address', async () => {
            const result = await SubmitCheckService(session.id)

            expect(result.billingAccountAddress.billingAccountId).toEqual(billingAccount.id)
            expect(result.billingAccountAddress.addressId).toEqual(address.id)
            expect(result.billingAccountAddress.companyId).toEqual(existingCompany.id)
            expect(result.billingAccountAddress.companyId).toBeDefined()
            expect(result.billingAccountAddress.contactId).not.toEqual(contact.id)
            expect(result.billingAccountAddress.contactId).toBeDefined()
            expect(result.address.id).toEqual(address.id)
            expect(result.agentCompany.id).toEqual(existingCompany.id)
            expect(result.contact.contactType).toEqual('department')
            expect(result.contact.department).toEqual(sessionData.contactName)
          })
        })

        describe('and has not added an FAO', () => {
          beforeEach(async () => {
            sessionData.fao = 'no'
            sessionData.contactName = null
            sessionData.contactSelected = null

            session = SessionModelStub(sessionData)

            vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
          })

          it('creates a new billing account address', async () => {
            const result = await SubmitCheckService(session.id)

            expect(result.billingAccountAddress.billingAccountId).toEqual(billingAccount.id)
            expect(result.billingAccountAddress.addressId).toEqual(address.id)
            expect(result.billingAccountAddress.companyId).toEqual(existingCompany.id)
            expect(result.billingAccountAddress.companyId).toBeDefined()
            expect(result.billingAccountAddress.contactId).toBeUndefined()
            expect(result.address.id).toEqual(address.id)
            expect(result.agentCompany.id).toEqual(existingCompany.id)
            expect(result.contact).toBeNull()
          })
        })

        describe('and selected an existing contact as an FAO', () => {
          beforeEach(async () => {
            sessionData.fao = 'yes'
            sessionData.contactSelected = contact.id

            session = SessionModelStub(sessionData)

            vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
          })

          it('creates a new billing account address', async () => {
            const result = await SubmitCheckService(session.id)

            expect(result.billingAccountAddress.billingAccountId).toEqual(billingAccount.id)
            expect(result.billingAccountAddress.addressId).toEqual(address.id)
            expect(result.billingAccountAddress.companyId).toEqual(existingCompany.id)
            expect(result.billingAccountAddress.companyId).toBeDefined()
            expect(result.billingAccountAddress.contactId).not.toEqual(contact.id)
            expect(result.billingAccountAddress.contactId).toBeDefined()
            expect(result.address.id).toEqual(address.id)
            expect(result.agentCompany.id).toEqual(existingCompany.id)
            expect(result.contact.contactType).toEqual('department')
            expect(result.contact.department).toEqual(contact.$name())
          })
        })
      })

      describe('and selected to create a new address', () => {
        beforeEach(async () => {
          sessionData.addressSelected = 'new'
          sessionData.addressJourney = _addressJourney()
        })

        describe('and added an FAO', () => {
          beforeEach(async () => {
            sessionData.fao = 'yes'
            sessionData.contactName = 'Contact Name'
            sessionData.contactSelected = 'new'

            session = SessionModelStub(sessionData)

            vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
          })

          it('creates a new billing account address', async () => {
            const result = await SubmitCheckService(session.id)

            expect(result.billingAccountAddress.billingAccountId).toEqual(billingAccount.id)
            expect(result.billingAccountAddress.addressId).not.toEqual(address.id)
            expect(result.billingAccountAddress.addressId).toBeDefined()
            expect(result.billingAccountAddress.companyId).toEqual(existingCompany.id)
            expect(result.billingAccountAddress.companyId).toBeDefined()
            expect(result.billingAccountAddress.contactId).not.toEqual(contact.id)
            expect(result.billingAccountAddress.contactId).toBeDefined()
            expect(result.address.uprn).toEqual(sessionData.addressJourney.address.uprn)
            expect(result.address.address1).toEqual(sessionData.addressJourney.address.addressLine1)
            expect(result.address.address2).toEqual(sessionData.addressJourney.address.addressLine2)
            expect(result.address.address3).toEqual(sessionData.addressJourney.address.addressLine3)
            expect(result.address.address4).toEqual(sessionData.addressJourney.address.addressLine4)
            expect(result.address.postcode).toEqual(sessionData.addressJourney.address.postcode)
            expect(result.agentCompany.id).toEqual(existingCompany.id)
            expect(result.contact.contactType).toEqual('department')
            expect(result.contact.department).toEqual(sessionData.contactName)
          })
        })

        describe('and has not added an FAO', () => {
          beforeEach(async () => {
            sessionData.fao = 'no'
            sessionData.contactName = null
            sessionData.contactSelected = null

            session = SessionModelStub(sessionData)

            vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
          })

          it('creates a new billing account address', async () => {
            const result = await SubmitCheckService(session.id)

            expect(result.billingAccountAddress.billingAccountId).toEqual(billingAccount.id)
            expect(result.billingAccountAddress.addressId).not.toEqual(address.id)
            expect(result.billingAccountAddress.addressId).toBeDefined()
            expect(result.billingAccountAddress.companyId).toEqual(existingCompany.id)
            expect(result.billingAccountAddress.companyId).toBeDefined()
            expect(result.billingAccountAddress.contactId).toBeUndefined()
            expect(result.address.uprn).toEqual(sessionData.addressJourney.address.uprn)
            expect(result.address.address1).toEqual(sessionData.addressJourney.address.addressLine1)
            expect(result.address.address2).toEqual(sessionData.addressJourney.address.addressLine2)
            expect(result.address.address3).toEqual(sessionData.addressJourney.address.addressLine3)
            expect(result.address.address4).toEqual(sessionData.addressJourney.address.addressLine4)
            expect(result.address.postcode).toEqual(sessionData.addressJourney.address.postcode)
            expect(result.agentCompany.id).toEqual(existingCompany.id)
            expect(result.contact).toBeNull()
          })
        })

        describe('and selected an existing contact as an FAO', () => {
          beforeEach(async () => {
            sessionData.fao = 'yes'
            sessionData.contactSelected = contact.id

            session = SessionModelStub(sessionData)

            vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
          })

          it('creates a new billing account address', async () => {
            const result = await SubmitCheckService(session.id)

            expect(result.billingAccountAddress.billingAccountId).toEqual(billingAccount.id)
            expect(result.billingAccountAddress.addressId).not.toEqual(address.id)
            expect(result.billingAccountAddress.addressId).toBeDefined()
            expect(result.billingAccountAddress.companyId).toEqual(existingCompany.id)
            expect(result.billingAccountAddress.companyId).toBeDefined()
            expect(result.billingAccountAddress.contactId).not.toEqual(contact.id)
            expect(result.billingAccountAddress.contactId).toBeDefined()
            expect(result.address.uprn).toEqual(sessionData.addressJourney.address.uprn)
            expect(result.address.address1).toEqual(sessionData.addressJourney.address.addressLine1)
            expect(result.address.address2).toEqual(sessionData.addressJourney.address.addressLine2)
            expect(result.address.address3).toEqual(sessionData.addressJourney.address.addressLine3)
            expect(result.address.address4).toEqual(sessionData.addressJourney.address.addressLine4)
            expect(result.address.postcode).toEqual(sessionData.addressJourney.address.postcode)
            expect(result.agentCompany.id).toEqual(existingCompany.id)
            expect(result.contact.contactType).toEqual('department')
            expect(result.contact.department).toEqual(contact.$name())
          })
        })
      })
    })

    describe('and the user has searched for an existing billing account but chose to create a new one', () => {
      beforeEach(async () => {
        existingCompany = null
        sessionData.accountSelected = 'another'
        sessionData.existingAccount = 'new'
      })

      describe('and selected "company" as the account type', () => {
        beforeEach(async () => {
          sessionData.accountType = 'company'
          sessionData.companiesHouseNumber = '12345678'

          vi.spyOn(FetchCompanyService, 'default').mockReturnValue(companySearchResult)
        })

        describe('and selected an existing address', () => {
          beforeEach(async () => {
            sessionData.addressSelected = address.id
          })

          describe('and added an FAO', () => {
            beforeEach(async () => {
              sessionData.fao = 'yes'
              sessionData.contactName = 'Contact Name'
              sessionData.contactSelected = 'new'

              session = SessionModelStub(sessionData)

              vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
            })

            it('creates a new billing account address', async () => {
              const result = await SubmitCheckService(session.id)

              expect(result.billingAccountAddress.billingAccountId).toEqual(billingAccount.id)
              expect(result.billingAccountAddress.addressId).toEqual(address.id)
              expect(result.billingAccountAddress.companyId).not.toEqual(company.id)
              expect(result.billingAccountAddress.companyId).toBeDefined()
              expect(result.billingAccountAddress.contactId).not.toEqual(contact.id)
              expect(result.billingAccountAddress.contactId).toBeDefined()
              expect(result.address.id).toEqual(address.id)
              expect(result.agentCompany.id).not.toEqual(company.id)
              expect(result.agentCompany.type).toEqual('organisation')
              expect(result.agentCompany.companyNumber).toEqual(companySearchResult.number)
              expect(result.agentCompany.name).toEqual(companySearchResult.title)
              expect(result.contact.contactType).toEqual('department')
              expect(result.contact.department).toEqual(sessionData.contactName)
            })
          })

          describe('and has not added an FAO', () => {
            beforeEach(async () => {
              sessionData.fao = 'no'
              sessionData.contactName = null
              sessionData.contactSelected = null

              session = SessionModelStub(sessionData)

              vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
            })

            it('creates a new billing account address', async () => {
              const result = await SubmitCheckService(session.id)

              expect(result.billingAccountAddress.billingAccountId).toEqual(billingAccount.id)
              expect(result.billingAccountAddress.addressId).toEqual(address.id)
              expect(result.billingAccountAddress.companyId).not.toEqual(company.id)
              expect(result.billingAccountAddress.companyId).toBeDefined()
              expect(result.billingAccountAddress.contactId).toBeUndefined()
              expect(result.address.id).toEqual(address.id)
              expect(result.agentCompany.id).not.toEqual(company.id)
              expect(result.agentCompany.type).toEqual('organisation')
              expect(result.agentCompany.companyNumber).toEqual(companySearchResult.number)
              expect(result.agentCompany.name).toEqual(companySearchResult.title)
              expect(result.contact).toBeNull()
            })
          })

          describe('and selected an existing contact as an FAO', () => {
            beforeEach(async () => {
              sessionData.fao = 'yes'
              sessionData.contactSelected = contact.id

              session = SessionModelStub(sessionData)

              vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
            })

            it('creates a new billing account address', async () => {
              const result = await SubmitCheckService(session.id)

              expect(result.billingAccountAddress.billingAccountId).toEqual(billingAccount.id)
              expect(result.billingAccountAddress.addressId).toEqual(address.id)
              expect(result.billingAccountAddress.companyId).not.toEqual(company.id)
              expect(result.billingAccountAddress.companyId).toBeDefined()
              expect(result.billingAccountAddress.contactId).not.toEqual(contact.id)
              expect(result.billingAccountAddress.contactId).toBeDefined()
              expect(result.address.id).toEqual(address.id)
              expect(result.agentCompany.id).not.toEqual(company.id)
              expect(result.agentCompany.type).toEqual('organisation')
              expect(result.agentCompany.companyNumber).toEqual(companySearchResult.number)
              expect(result.agentCompany.name).toEqual(companySearchResult.title)
              expect(result.contact.contactType).toEqual('department')
              expect(result.contact.department).toEqual(contact.$name())
            })
          })
        })

        describe('and selected to create a new address', () => {
          beforeEach(async () => {
            sessionData.addressSelected = 'new'
            sessionData.addressJourney = _addressJourney()
          })

          describe('and added an FAO', () => {
            beforeEach(async () => {
              sessionData.fao = 'yes'
              sessionData.contactName = 'Contact Name'
              sessionData.contactSelected = 'new'

              session = SessionModelStub(sessionData)

              vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
            })

            it('creates a new billing account address', async () => {
              const result = await SubmitCheckService(session.id)

              expect(result.billingAccountAddress.billingAccountId).toEqual(billingAccount.id)
              expect(result.billingAccountAddress.addressId).not.toEqual(address.id)
              expect(result.billingAccountAddress.addressId).toBeDefined()
              expect(result.billingAccountAddress.companyId).not.toEqual(company.id)
              expect(result.billingAccountAddress.companyId).toBeDefined()
              expect(result.billingAccountAddress.contactId).not.toEqual(contact.id)
              expect(result.billingAccountAddress.contactId).toBeDefined()
              expect(result.address.uprn).toEqual(sessionData.addressJourney.address.uprn)
              expect(result.address.address1).toEqual(sessionData.addressJourney.address.addressLine1)
              expect(result.address.address2).toEqual(sessionData.addressJourney.address.addressLine2)
              expect(result.address.address3).toEqual(sessionData.addressJourney.address.addressLine3)
              expect(result.address.address4).toEqual(sessionData.addressJourney.address.addressLine4)
              expect(result.address.postcode).toEqual(sessionData.addressJourney.address.postcode)
              expect(result.agentCompany.id).not.toEqual(company.id)
              expect(result.agentCompany.type).toEqual('organisation')
              expect(result.agentCompany.companyNumber).toEqual(companySearchResult.number)
              expect(result.agentCompany.name).toEqual(companySearchResult.title)
              expect(result.contact.contactType).toEqual('department')
              expect(result.contact.department).toEqual(sessionData.contactName)
            })
          })

          describe('and has not added an FAO', () => {
            beforeEach(async () => {
              sessionData.fao = 'no'
              sessionData.contactName = null
              sessionData.contactSelected = null

              session = SessionModelStub(sessionData)

              vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
            })

            it('creates a new billing account address', async () => {
              const result = await SubmitCheckService(session.id)

              expect(result.billingAccountAddress.billingAccountId).toEqual(billingAccount.id)
              expect(result.billingAccountAddress.addressId).not.toEqual(address.id)
              expect(result.billingAccountAddress.addressId).toBeDefined()
              expect(result.billingAccountAddress.companyId).not.toEqual(company.id)
              expect(result.billingAccountAddress.companyId).toBeDefined()
              expect(result.billingAccountAddress.contactId).toBeUndefined()
              expect(result.address.uprn).toEqual(sessionData.addressJourney.address.uprn)
              expect(result.address.address1).toEqual(sessionData.addressJourney.address.addressLine1)
              expect(result.address.address2).toEqual(sessionData.addressJourney.address.addressLine2)
              expect(result.address.address3).toEqual(sessionData.addressJourney.address.addressLine3)
              expect(result.address.address4).toEqual(sessionData.addressJourney.address.addressLine4)
              expect(result.address.postcode).toEqual(sessionData.addressJourney.address.postcode)
              expect(result.agentCompany.id).not.toEqual(company.id)
              expect(result.agentCompany.type).toEqual('organisation')
              expect(result.agentCompany.companyNumber).toEqual(companySearchResult.number)
              expect(result.agentCompany.name).toEqual(companySearchResult.title)
              expect(result.contact).toBeNull()
            })
          })

          describe('and selected an existing contact as an FAO', () => {
            beforeEach(async () => {
              sessionData.fao = 'yes'
              sessionData.contactSelected = contact.id

              session = SessionModelStub(sessionData)

              vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
            })

            it('creates a new billing account address', async () => {
              const result = await SubmitCheckService(session.id)

              expect(result.billingAccountAddress.billingAccountId).toEqual(billingAccount.id)
              expect(result.billingAccountAddress.addressId).not.toEqual(address.id)
              expect(result.billingAccountAddress.addressId).toBeDefined()
              expect(result.billingAccountAddress.companyId).not.toEqual(company.id)
              expect(result.billingAccountAddress.companyId).toBeDefined()
              expect(result.billingAccountAddress.contactId).not.toEqual(contact.id)
              expect(result.billingAccountAddress.contactId).toBeDefined()
              expect(result.address.uprn).toEqual(sessionData.addressJourney.address.uprn)
              expect(result.address.address1).toEqual(sessionData.addressJourney.address.addressLine1)
              expect(result.address.address2).toEqual(sessionData.addressJourney.address.addressLine2)
              expect(result.address.address3).toEqual(sessionData.addressJourney.address.addressLine3)
              expect(result.address.address4).toEqual(sessionData.addressJourney.address.addressLine4)
              expect(result.address.postcode).toEqual(sessionData.addressJourney.address.postcode)
              expect(result.agentCompany.id).not.toEqual(company.id)
              expect(result.agentCompany.type).toEqual('organisation')
              expect(result.agentCompany.companyNumber).toEqual(companySearchResult.number)
              expect(result.agentCompany.name).toEqual(companySearchResult.title)
              expect(result.contact.contactType).toEqual('department')
              expect(result.contact.department).toEqual(contact.$name())
            })
          })
        })
      })

      describe('and selected "individual" as the account type', () => {
        beforeEach(async () => {
          sessionData.accountType = 'individual'
          sessionData.individualName = 'Full Name'
        })

        describe('and selected an existing address', () => {
          beforeEach(async () => {
            sessionData.addressSelected = address.id
          })

          describe('and added an FAO', () => {
            beforeEach(async () => {
              sessionData.fao = 'yes'
              sessionData.contactName = 'Contact Name'
              sessionData.contactSelected = 'new'

              session = SessionModelStub(sessionData)

              vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
            })

            it('creates a new billing account address', async () => {
              const result = await SubmitCheckService(session.id)

              expect(result.billingAccountAddress.billingAccountId).toEqual(billingAccount.id)
              expect(result.billingAccountAddress.addressId).toEqual(address.id)
              expect(result.billingAccountAddress.companyId).not.toEqual(company.id)
              expect(result.billingAccountAddress.companyId).toBeDefined()
              expect(result.billingAccountAddress.contactId).not.toEqual(contact.id)
              expect(result.billingAccountAddress.contactId).toBeDefined()
              expect(result.address.id).toEqual(address.id)
              expect(result.agentCompany.id).not.toEqual(company.id)
              expect(result.agentCompany.type).toEqual('person')
              expect(result.agentCompany.companyNumber).toBeNull()
              expect(result.agentCompany.name).toEqual(sessionData.individualName)
              expect(result.contact.contactType).toEqual('department')
              expect(result.contact.department).toEqual(sessionData.contactName)
            })
          })

          describe('and has not added an FAO', () => {
            beforeEach(async () => {
              sessionData.fao = 'no'
              sessionData.contactName = null
              sessionData.contactSelected = null

              session = SessionModelStub(sessionData)

              vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
            })

            it('creates a new billing account address', async () => {
              const result = await SubmitCheckService(session.id)

              expect(result.billingAccountAddress.billingAccountId).toEqual(billingAccount.id)
              expect(result.billingAccountAddress.addressId).toEqual(address.id)
              expect(result.billingAccountAddress.companyId).not.toEqual(company.id)
              expect(result.billingAccountAddress.companyId).toBeDefined()
              expect(result.billingAccountAddress.contactId).toBeUndefined()
              expect(result.address.id).toEqual(address.id)
              expect(result.agentCompany.id).not.toEqual(company.id)
              expect(result.agentCompany.type).toEqual('person')
              expect(result.agentCompany.companyNumber).toBeNull()
              expect(result.agentCompany.name).toEqual(sessionData.individualName)
              expect(result.contact).toBeNull()
            })
          })

          describe('and selected an existing contact as an FAO', () => {
            beforeEach(async () => {
              sessionData.fao = 'yes'
              sessionData.contactSelected = contact.id

              session = SessionModelStub(sessionData)

              vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
            })

            it('creates a new billing account address', async () => {
              const result = await SubmitCheckService(session.id)

              expect(result.billingAccountAddress.billingAccountId).toEqual(billingAccount.id)
              expect(result.billingAccountAddress.addressId).toEqual(address.id)
              expect(result.billingAccountAddress.companyId).not.toEqual(company.id)
              expect(result.billingAccountAddress.companyId).toBeDefined()
              expect(result.billingAccountAddress.contactId).not.toEqual(contact.id)
              expect(result.billingAccountAddress.contactId).toBeDefined()
              expect(result.address.id).toEqual(address.id)
              expect(result.agentCompany.id).not.toEqual(company.id)
              expect(result.agentCompany.type).toEqual('person')
              expect(result.agentCompany.companyNumber).toBeNull()
              expect(result.agentCompany.name).toEqual(sessionData.individualName)
              expect(result.contact.contactType).toEqual('department')
              expect(result.contact.department).toEqual(contact.$name())
            })
          })
        })

        describe('and selected to create a new address', () => {
          beforeEach(async () => {
            sessionData.addressSelected = 'new'
            sessionData.addressJourney = _addressJourney()
          })

          describe('and added an FAO', () => {
            beforeEach(async () => {
              sessionData.fao = 'yes'
              sessionData.contactName = 'Contact Name'
              sessionData.contactSelected = 'new'

              session = SessionModelStub(sessionData)

              vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
            })

            it('creates a new billing account address', async () => {
              const result = await SubmitCheckService(session.id)

              expect(result.billingAccountAddress.billingAccountId).toEqual(billingAccount.id)
              expect(result.billingAccountAddress.addressId).not.toEqual(address.id)
              expect(result.billingAccountAddress.addressId).toBeDefined()
              expect(result.billingAccountAddress.companyId).not.toEqual(company.id)
              expect(result.billingAccountAddress.companyId).toBeDefined()
              expect(result.billingAccountAddress.contactId).not.toEqual(contact.id)
              expect(result.billingAccountAddress.contactId).toBeDefined()
              expect(result.address.uprn).toEqual(sessionData.addressJourney.address.uprn)
              expect(result.address.address1).toEqual(sessionData.addressJourney.address.addressLine1)
              expect(result.address.address2).toEqual(sessionData.addressJourney.address.addressLine2)
              expect(result.address.address3).toEqual(sessionData.addressJourney.address.addressLine3)
              expect(result.address.address4).toEqual(sessionData.addressJourney.address.addressLine4)
              expect(result.address.postcode).toEqual(sessionData.addressJourney.address.postcode)
              expect(result.agentCompany.id).not.toEqual(company.id)
              expect(result.agentCompany.type).toEqual('person')
              expect(result.agentCompany.companyNumber).toBeNull()
              expect(result.agentCompany.name).toEqual(sessionData.individualName)
              expect(result.contact.contactType).toEqual('department')
              expect(result.contact.department).toEqual(sessionData.contactName)
            })
          })

          describe('and has not added an FAO', () => {
            beforeEach(async () => {
              sessionData.fao = 'no'
              sessionData.contactName = null
              sessionData.contactSelected = null

              session = SessionModelStub(sessionData)

              vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
            })

            it('creates a new billing account address', async () => {
              const result = await SubmitCheckService(session.id)

              expect(result.billingAccountAddress.billingAccountId).toEqual(billingAccount.id)
              expect(result.billingAccountAddress.addressId).not.toEqual(address.id)
              expect(result.billingAccountAddress.addressId).toBeDefined()
              expect(result.billingAccountAddress.companyId).not.toEqual(company.id)
              expect(result.billingAccountAddress.companyId).toBeDefined()
              expect(result.billingAccountAddress.contactId).toBeUndefined()
              expect(result.address.uprn).toEqual(sessionData.addressJourney.address.uprn)
              expect(result.address.address1).toEqual(sessionData.addressJourney.address.addressLine1)
              expect(result.address.address2).toEqual(sessionData.addressJourney.address.addressLine2)
              expect(result.address.address3).toEqual(sessionData.addressJourney.address.addressLine3)
              expect(result.address.address4).toEqual(sessionData.addressJourney.address.addressLine4)
              expect(result.address.postcode).toEqual(sessionData.addressJourney.address.postcode)
              expect(result.agentCompany.id).not.toEqual(company.id)
              expect(result.agentCompany.type).toEqual('person')
              expect(result.agentCompany.companyNumber).toBeNull()
              expect(result.agentCompany.name).toEqual(sessionData.individualName)
              expect(result.contact).toBeNull()
            })
          })

          describe('and selected an existing contact as an FAO', () => {
            beforeEach(async () => {
              sessionData.fao = 'yes'
              sessionData.contactSelected = contact.id

              session = SessionModelStub(sessionData)

              vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
            })

            it('creates a new billing account address', async () => {
              const result = await SubmitCheckService(session.id)

              expect(result.billingAccountAddress.billingAccountId).toEqual(billingAccount.id)
              expect(result.billingAccountAddress.addressId).not.toEqual(address.id)
              expect(result.billingAccountAddress.addressId).toBeDefined()
              expect(result.billingAccountAddress.companyId).not.toEqual(company.id)
              expect(result.billingAccountAddress.companyId).toBeDefined()
              expect(result.billingAccountAddress.contactId).not.toEqual(contact.id)
              expect(result.billingAccountAddress.contactId).toBeDefined()
              expect(result.address.uprn).toEqual(sessionData.addressJourney.address.uprn)
              expect(result.address.address1).toEqual(sessionData.addressJourney.address.addressLine1)
              expect(result.address.address2).toEqual(sessionData.addressJourney.address.addressLine2)
              expect(result.address.address3).toEqual(sessionData.addressJourney.address.addressLine3)
              expect(result.address.address4).toEqual(sessionData.addressJourney.address.addressLine4)
              expect(result.address.postcode).toEqual(sessionData.addressJourney.address.postcode)
              expect(result.agentCompany.id).not.toEqual(company.id)
              expect(result.agentCompany.type).toEqual('person')
              expect(result.agentCompany.companyNumber).toBeNull()
              expect(result.agentCompany.name).toEqual(sessionData.individualName)
              expect(result.contact.contactType).toEqual('department')
              expect(result.contact.department).toEqual(contact.$name())
            })
          })
        })
      })
    })
  })
})

function _addressJourney() {
  return {
    address: {
      uprn: 12345678,
      postcode: 'BS1 5AH',
      addressLine1: 'ENVIRONMENT AGENCY',
      addressLine2: 'HORIZON HOUSE',
      addressLine3: null,
      addressLine4: 'BRISTOL'
    }
  }
}
