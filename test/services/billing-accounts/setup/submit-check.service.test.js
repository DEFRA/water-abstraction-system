'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AddressHelper = require('../../../support/helpers/address.helper.js')
const BillingAccountAddressHelper = require('../../../support/helpers/billing-account-address.helper.js')
const BillingAccountHelper = require('../../../support/helpers/billing-account.helper.js')
const CompanyHelper = require('../../../support/helpers/company.helper.js')
const ContactHelper = require('../../../support/helpers/contact.helper.js')
const CustomersFixture = require('../../../support/fixtures/customers.fixture.js')
const SessionModelStub = require('../../../support/stubs/session.stub.js')

// Things to stub
const FetchCompanyContactsService = require('../../../../app/services/billing-accounts/setup/fetch-company-contacts.service.js')
const FetchCompanyService = require('../../../../app/services/billing-accounts/setup/fetch-company.service.js')
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')
const SendCustomerChangeService = require('../../../../app/services/billing-accounts/send-customer-change.service.js')

// Thing under test
const SubmitCheckService = require('../../../../app/services/billing-accounts/setup/submit-check.service.js')

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

    Sinon.stub(FetchCompanyContactsService, 'go').resolves(companyContacts)
    Sinon.stub(SendCustomerChangeService, 'go').resolves()
  })

  afterEach(async () => {
    await address.$query().delete()
    await company.$query().delete()
    await contact.$query().delete()
    await billingAccount.$query().delete()
    await billingAccountAddress.$query().delete()
    await session.$query().delete()
    Sinon.restore()
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

            session = SessionModelStub.build(Sinon, sessionData)

            Sinon.stub(FetchSessionDal, 'go').resolves(session)
          })

          it('creates a new billing account address', async () => {
            const result = await SubmitCheckService.go(session.id)

            expect(result.redirectUrl).to.equal(`/system/billing-accounts/${billingAccount.id}`)
            expect(result.billingAccountAddress.billingAccountId).to.equal(billingAccount.id)
            expect(result.billingAccountAddress.addressId).to.equal(address.id)
            expect(result.billingAccountAddress.companyId).to.equal(company.id)
            expect(result.billingAccountAddress.contactId).to.not.equal(contact.id)
            expect(result.billingAccountAddress.contactId).to.exist()
            expect(result.address.id).to.equal(address.id)
            expect(result.agentCompany.id).to.equal(company.id)
            expect(result.contact.contactType).to.equal('department')
            expect(result.contact.department).to.equal(sessionData.contactName)
          })
        })

        describe('and has not added an FAO', () => {
          beforeEach(async () => {
            sessionData.fao = 'no'
            sessionData.contactName = null
            sessionData.contactSelected = null

            session = SessionModelStub.build(Sinon, sessionData)

            Sinon.stub(FetchSessionDal, 'go').resolves(session)
          })

          it('creates a new billing account address', async () => {
            const result = await SubmitCheckService.go(session.id)

            expect(result.billingAccountAddress.billingAccountId).to.equal(billingAccount.id)
            expect(result.billingAccountAddress.addressId).to.equal(address.id)
            expect(result.billingAccountAddress.companyId).to.equal(company.id)
            expect(result.billingAccountAddress.contactId).to.not.exist()
            expect(result.address.id).to.equal(address.id)
            expect(result.agentCompany.id).to.equal(company.id)
            expect(result.contact).to.not.exist()
          })
        })

        describe('and selected an existing contact as an FAO', () => {
          beforeEach(async () => {
            sessionData.fao = 'yes'
            sessionData.contactName = null
            sessionData.contactSelected = contact.id

            session = SessionModelStub.build(Sinon, sessionData)

            Sinon.stub(FetchSessionDal, 'go').resolves(session)
          })

          it('creates a new billing account address', async () => {
            const result = await SubmitCheckService.go(session.id)

            expect(result.billingAccountAddress.billingAccountId).to.equal(billingAccount.id)
            expect(result.billingAccountAddress.addressId).to.equal(address.id)
            expect(result.billingAccountAddress.companyId).to.equal(company.id)
            expect(result.billingAccountAddress.contactId).to.not.equal(contact.id)
            expect(result.billingAccountAddress.contactId).to.exist()
            expect(result.address.id).to.equal(address.id)
            expect(result.agentCompany.id).to.equal(company.id)
            expect(result.contact.contactType).to.equal('department')
            expect(result.contact.department).to.equal(contact.$name())
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

            session = SessionModelStub.build(Sinon, sessionData)

            Sinon.stub(FetchSessionDal, 'go').resolves(session)
          })

          it('creates a new billing account address', async () => {
            const result = await SubmitCheckService.go(session.id)

            expect(result.billingAccountAddress.billingAccountId).to.equal(billingAccount.id)
            expect(result.billingAccountAddress.addressId).to.not.equal(address.id)
            expect(result.billingAccountAddress.addressId).to.exist()
            expect(result.billingAccountAddress.companyId).to.equal(company.id)
            expect(result.billingAccountAddress.contactId).to.not.equal(contact.id)
            expect(result.billingAccountAddress.contactId).to.exist()
            expect(result.address.uprn).to.equal(sessionData.addressJourney.address.uprn)
            expect(result.address.address1).to.equal(sessionData.addressJourney.address.addressLine1)
            expect(result.address.address2).to.equal(sessionData.addressJourney.address.addressLine2)
            expect(result.address.address3).to.equal(sessionData.addressJourney.address.addressLine3)
            expect(result.address.address4).to.equal(sessionData.addressJourney.address.addressLine4)
            expect(result.address.postcode).to.equal(sessionData.addressJourney.address.postcode)
            expect(result.agentCompany.id).to.equal(company.id)
            expect(result.contact.contactType).to.equal('department')
            expect(result.contact.department).to.equal(sessionData.contactName)
          })
        })

        describe('and has not added an FAO', () => {
          beforeEach(async () => {
            sessionData.fao = 'no'
            sessionData.contactName = null
            sessionData.contactSelected = null

            session = SessionModelStub.build(Sinon, sessionData)

            Sinon.stub(FetchSessionDal, 'go').resolves(session)
          })

          it('creates a new billing account address', async () => {
            const result = await SubmitCheckService.go(session.id)

            expect(result.billingAccountAddress.billingAccountId).to.equal(billingAccount.id)
            expect(result.billingAccountAddress.addressId).to.not.equal(address.id)
            expect(result.billingAccountAddress.addressId).to.exist()
            expect(result.billingAccountAddress.companyId).to.equal(company.id)
            expect(result.billingAccountAddress.contactId).to.not.exist()
            expect(result.address.uprn).to.equal(sessionData.addressJourney.address.uprn)
            expect(result.address.address1).to.equal(sessionData.addressJourney.address.addressLine1)
            expect(result.address.address2).to.equal(sessionData.addressJourney.address.addressLine2)
            expect(result.address.address3).to.equal(sessionData.addressJourney.address.addressLine3)
            expect(result.address.address4).to.equal(sessionData.addressJourney.address.addressLine4)
            expect(result.address.postcode).to.equal(sessionData.addressJourney.address.postcode)
            expect(result.agentCompany.id).to.equal(company.id)
            expect(result.contact).to.not.exist()
          })
        })

        describe('and selected an existing contact as an FAO', () => {
          beforeEach(async () => {
            sessionData.fao = 'yes'
            sessionData.contactSelected = contact.id

            session = SessionModelStub.build(Sinon, sessionData)

            Sinon.stub(FetchSessionDal, 'go').resolves(session)
          })

          it('creates a new billing account address', async () => {
            const result = await SubmitCheckService.go(session.id)

            expect(result.billingAccountAddress.billingAccountId).to.equal(billingAccount.id)
            expect(result.billingAccountAddress.addressId).to.not.equal(address.id)
            expect(result.billingAccountAddress.addressId).to.exist()
            expect(result.billingAccountAddress.companyId).to.equal(company.id)
            expect(result.billingAccountAddress.contactId).to.not.equal(contact.id)
            expect(result.billingAccountAddress.contactId).to.exist()
            expect(result.address.uprn).to.equal(sessionData.addressJourney.address.uprn)
            expect(result.address.address1).to.equal(sessionData.addressJourney.address.addressLine1)
            expect(result.address.address2).to.equal(sessionData.addressJourney.address.addressLine2)
            expect(result.address.address3).to.equal(sessionData.addressJourney.address.addressLine3)
            expect(result.address.address4).to.equal(sessionData.addressJourney.address.addressLine4)
            expect(result.address.postcode).to.equal(sessionData.addressJourney.address.postcode)
            expect(result.agentCompany.id).to.equal(company.id)
            expect(result.contact.contactType).to.equal('department')
            expect(result.contact.department).to.equal(contact.$name())
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

            session = SessionModelStub.build(Sinon, sessionData)

            Sinon.stub(FetchSessionDal, 'go').resolves(session)
          })

          it('creates a new billing account address', async () => {
            const result = await SubmitCheckService.go(session.id)

            expect(result.billingAccountAddress.billingAccountId).to.equal(billingAccount.id)
            expect(result.billingAccountAddress.addressId).to.equal(address.id)
            expect(result.billingAccountAddress.companyId).to.equal(existingCompany.id)
            expect(result.billingAccountAddress.companyId).to.exist()
            expect(result.billingAccountAddress.contactId).to.not.equal(contact.id)
            expect(result.billingAccountAddress.contactId).to.exist()
            expect(result.address.id).to.equal(address.id)
            expect(result.agentCompany.id).to.equal(existingCompany.id)
            expect(result.contact.contactType).to.equal('department')
            expect(result.contact.department).to.equal(sessionData.contactName)
          })
        })

        describe('and has not added an FAO', () => {
          beforeEach(async () => {
            sessionData.fao = 'no'
            sessionData.contactName = null
            sessionData.contactSelected = null

            session = SessionModelStub.build(Sinon, sessionData)

            Sinon.stub(FetchSessionDal, 'go').resolves(session)
          })

          it('creates a new billing account address', async () => {
            const result = await SubmitCheckService.go(session.id)

            expect(result.billingAccountAddress.billingAccountId).to.equal(billingAccount.id)
            expect(result.billingAccountAddress.addressId).to.equal(address.id)
            expect(result.billingAccountAddress.companyId).to.equal(existingCompany.id)
            expect(result.billingAccountAddress.companyId).to.exist()
            expect(result.billingAccountAddress.contactId).to.not.exist()
            expect(result.address.id).to.equal(address.id)
            expect(result.agentCompany.id).to.equal(existingCompany.id)
            expect(result.contact).to.not.exist()
          })
        })

        describe('and selected an existing contact as an FAO', () => {
          beforeEach(async () => {
            sessionData.fao = 'yes'
            sessionData.contactSelected = contact.id

            session = SessionModelStub.build(Sinon, sessionData)

            Sinon.stub(FetchSessionDal, 'go').resolves(session)
          })

          it('creates a new billing account address', async () => {
            const result = await SubmitCheckService.go(session.id)

            expect(result.billingAccountAddress.billingAccountId).to.equal(billingAccount.id)
            expect(result.billingAccountAddress.addressId).to.equal(address.id)
            expect(result.billingAccountAddress.companyId).to.equal(existingCompany.id)
            expect(result.billingAccountAddress.companyId).to.exist()
            expect(result.billingAccountAddress.contactId).to.not.equal(contact.id)
            expect(result.billingAccountAddress.contactId).to.exist()
            expect(result.address.id).to.equal(address.id)
            expect(result.agentCompany.id).to.equal(existingCompany.id)
            expect(result.contact.contactType).to.equal('department')
            expect(result.contact.department).to.equal(contact.$name())
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

            session = SessionModelStub.build(Sinon, sessionData)

            Sinon.stub(FetchSessionDal, 'go').resolves(session)
          })

          it('creates a new billing account address', async () => {
            const result = await SubmitCheckService.go(session.id)

            expect(result.billingAccountAddress.billingAccountId).to.equal(billingAccount.id)
            expect(result.billingAccountAddress.addressId).to.not.equal(address.id)
            expect(result.billingAccountAddress.addressId).to.exist()
            expect(result.billingAccountAddress.companyId).to.equal(existingCompany.id)
            expect(result.billingAccountAddress.companyId).to.exist()
            expect(result.billingAccountAddress.contactId).to.not.equal(contact.id)
            expect(result.billingAccountAddress.contactId).to.exist()
            expect(result.address.uprn).to.equal(sessionData.addressJourney.address.uprn)
            expect(result.address.address1).to.equal(sessionData.addressJourney.address.addressLine1)
            expect(result.address.address2).to.equal(sessionData.addressJourney.address.addressLine2)
            expect(result.address.address3).to.equal(sessionData.addressJourney.address.addressLine3)
            expect(result.address.address4).to.equal(sessionData.addressJourney.address.addressLine4)
            expect(result.address.postcode).to.equal(sessionData.addressJourney.address.postcode)
            expect(result.agentCompany.id).to.equal(existingCompany.id)
            expect(result.contact.contactType).to.equal('department')
            expect(result.contact.department).to.equal(sessionData.contactName)
          })
        })

        describe('and has not added an FAO', () => {
          beforeEach(async () => {
            sessionData.fao = 'no'
            sessionData.contactName = null
            sessionData.contactSelected = null

            session = SessionModelStub.build(Sinon, sessionData)

            Sinon.stub(FetchSessionDal, 'go').resolves(session)
          })

          it('creates a new billing account address', async () => {
            const result = await SubmitCheckService.go(session.id)

            expect(result.billingAccountAddress.billingAccountId).to.equal(billingAccount.id)
            expect(result.billingAccountAddress.addressId).to.not.equal(address.id)
            expect(result.billingAccountAddress.addressId).to.exist()
            expect(result.billingAccountAddress.companyId).to.equal(existingCompany.id)
            expect(result.billingAccountAddress.companyId).to.exist()
            expect(result.billingAccountAddress.contactId).to.not.exist()
            expect(result.address.uprn).to.equal(sessionData.addressJourney.address.uprn)
            expect(result.address.address1).to.equal(sessionData.addressJourney.address.addressLine1)
            expect(result.address.address2).to.equal(sessionData.addressJourney.address.addressLine2)
            expect(result.address.address3).to.equal(sessionData.addressJourney.address.addressLine3)
            expect(result.address.address4).to.equal(sessionData.addressJourney.address.addressLine4)
            expect(result.address.postcode).to.equal(sessionData.addressJourney.address.postcode)
            expect(result.agentCompany.id).to.equal(existingCompany.id)
            expect(result.contact).to.not.exist()
          })
        })

        describe('and selected an existing contact as an FAO', () => {
          beforeEach(async () => {
            sessionData.fao = 'yes'
            sessionData.contactSelected = contact.id

            session = SessionModelStub.build(Sinon, sessionData)

            Sinon.stub(FetchSessionDal, 'go').resolves(session)
          })

          it('creates a new billing account address', async () => {
            const result = await SubmitCheckService.go(session.id)

            expect(result.billingAccountAddress.billingAccountId).to.equal(billingAccount.id)
            expect(result.billingAccountAddress.addressId).to.not.equal(address.id)
            expect(result.billingAccountAddress.addressId).to.exist()
            expect(result.billingAccountAddress.companyId).to.equal(existingCompany.id)
            expect(result.billingAccountAddress.companyId).to.exist()
            expect(result.billingAccountAddress.contactId).to.not.equal(contact.id)
            expect(result.billingAccountAddress.contactId).to.exist()
            expect(result.address.uprn).to.equal(sessionData.addressJourney.address.uprn)
            expect(result.address.address1).to.equal(sessionData.addressJourney.address.addressLine1)
            expect(result.address.address2).to.equal(sessionData.addressJourney.address.addressLine2)
            expect(result.address.address3).to.equal(sessionData.addressJourney.address.addressLine3)
            expect(result.address.address4).to.equal(sessionData.addressJourney.address.addressLine4)
            expect(result.address.postcode).to.equal(sessionData.addressJourney.address.postcode)
            expect(result.agentCompany.id).to.equal(existingCompany.id)
            expect(result.contact.contactType).to.equal('department')
            expect(result.contact.department).to.equal(contact.$name())
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

          Sinon.stub(FetchCompanyService, 'go').returns(companySearchResult)
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

              session = SessionModelStub.build(Sinon, sessionData)

              Sinon.stub(FetchSessionDal, 'go').resolves(session)
            })

            it('creates a new billing account address', async () => {
              const result = await SubmitCheckService.go(session.id)

              expect(result.billingAccountAddress.billingAccountId).to.equal(billingAccount.id)
              expect(result.billingAccountAddress.addressId).to.equal(address.id)
              expect(result.billingAccountAddress.companyId).to.not.equal(company.id)
              expect(result.billingAccountAddress.companyId).to.exist()
              expect(result.billingAccountAddress.contactId).to.not.equal(contact.id)
              expect(result.billingAccountAddress.contactId).to.exist()
              expect(result.address.id).to.equal(address.id)
              expect(result.agentCompany.id).to.not.equal(company.id)
              expect(result.agentCompany.type).to.equal('organisation')
              expect(result.agentCompany.companyNumber).to.equal(companySearchResult.number)
              expect(result.agentCompany.name).to.equal(companySearchResult.title)
              expect(result.contact.contactType).to.equal('department')
              expect(result.contact.department).to.equal(sessionData.contactName)
            })
          })

          describe('and has not added an FAO', () => {
            beforeEach(async () => {
              sessionData.fao = 'no'
              sessionData.contactName = null
              sessionData.contactSelected = null

              session = SessionModelStub.build(Sinon, sessionData)

              Sinon.stub(FetchSessionDal, 'go').resolves(session)
            })

            it('creates a new billing account address', async () => {
              const result = await SubmitCheckService.go(session.id)

              expect(result.billingAccountAddress.billingAccountId).to.equal(billingAccount.id)
              expect(result.billingAccountAddress.addressId).to.equal(address.id)
              expect(result.billingAccountAddress.companyId).to.not.equal(company.id)
              expect(result.billingAccountAddress.companyId).to.exist()
              expect(result.billingAccountAddress.contactId).to.not.exist()
              expect(result.address.id).to.equal(address.id)
              expect(result.agentCompany.id).to.not.equal(company.id)
              expect(result.agentCompany.type).to.equal('organisation')
              expect(result.agentCompany.companyNumber).to.equal(companySearchResult.number)
              expect(result.agentCompany.name).to.equal(companySearchResult.title)
              expect(result.contact).to.not.exist()
            })
          })

          describe('and selected an existing contact as an FAO', () => {
            beforeEach(async () => {
              sessionData.fao = 'yes'
              sessionData.contactSelected = contact.id

              session = SessionModelStub.build(Sinon, sessionData)

              Sinon.stub(FetchSessionDal, 'go').resolves(session)
            })

            it('creates a new billing account address', async () => {
              const result = await SubmitCheckService.go(session.id)

              expect(result.billingAccountAddress.billingAccountId).to.equal(billingAccount.id)
              expect(result.billingAccountAddress.addressId).to.equal(address.id)
              expect(result.billingAccountAddress.companyId).to.not.equal(company.id)
              expect(result.billingAccountAddress.companyId).to.exist()
              expect(result.billingAccountAddress.contactId).to.not.equal(contact.id)
              expect(result.billingAccountAddress.contactId).to.exist()
              expect(result.address.id).to.equal(address.id)
              expect(result.agentCompany.id).to.not.equal(company.id)
              expect(result.agentCompany.type).to.equal('organisation')
              expect(result.agentCompany.companyNumber).to.equal(companySearchResult.number)
              expect(result.agentCompany.name).to.equal(companySearchResult.title)
              expect(result.contact.contactType).to.equal('department')
              expect(result.contact.department).to.equal(contact.$name())
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

              session = SessionModelStub.build(Sinon, sessionData)

              Sinon.stub(FetchSessionDal, 'go').resolves(session)
            })

            it('creates a new billing account address', async () => {
              const result = await SubmitCheckService.go(session.id)

              expect(result.billingAccountAddress.billingAccountId).to.equal(billingAccount.id)
              expect(result.billingAccountAddress.addressId).to.not.equal(address.id)
              expect(result.billingAccountAddress.addressId).to.exist()
              expect(result.billingAccountAddress.companyId).to.not.equal(company.id)
              expect(result.billingAccountAddress.companyId).to.exist()
              expect(result.billingAccountAddress.contactId).to.not.equal(contact.id)
              expect(result.billingAccountAddress.contactId).to.exist()
              expect(result.address.uprn).to.equal(sessionData.addressJourney.address.uprn)
              expect(result.address.address1).to.equal(sessionData.addressJourney.address.addressLine1)
              expect(result.address.address2).to.equal(sessionData.addressJourney.address.addressLine2)
              expect(result.address.address3).to.equal(sessionData.addressJourney.address.addressLine3)
              expect(result.address.address4).to.equal(sessionData.addressJourney.address.addressLine4)
              expect(result.address.postcode).to.equal(sessionData.addressJourney.address.postcode)
              expect(result.agentCompany.id).to.not.equal(company.id)
              expect(result.agentCompany.type).to.equal('organisation')
              expect(result.agentCompany.companyNumber).to.equal(companySearchResult.number)
              expect(result.agentCompany.name).to.equal(companySearchResult.title)
              expect(result.contact.contactType).to.equal('department')
              expect(result.contact.department).to.equal(sessionData.contactName)
            })
          })

          describe('and has not added an FAO', () => {
            beforeEach(async () => {
              sessionData.fao = 'no'
              sessionData.contactName = null
              sessionData.contactSelected = null

              session = SessionModelStub.build(Sinon, sessionData)

              Sinon.stub(FetchSessionDal, 'go').resolves(session)
            })

            it('creates a new billing account address', async () => {
              const result = await SubmitCheckService.go(session.id)

              expect(result.billingAccountAddress.billingAccountId).to.equal(billingAccount.id)
              expect(result.billingAccountAddress.addressId).to.not.equal(address.id)
              expect(result.billingAccountAddress.addressId).to.exist()
              expect(result.billingAccountAddress.companyId).to.not.equal(company.id)
              expect(result.billingAccountAddress.companyId).to.exist()
              expect(result.billingAccountAddress.contactId).to.not.exist()
              expect(result.address.uprn).to.equal(sessionData.addressJourney.address.uprn)
              expect(result.address.address1).to.equal(sessionData.addressJourney.address.addressLine1)
              expect(result.address.address2).to.equal(sessionData.addressJourney.address.addressLine2)
              expect(result.address.address3).to.equal(sessionData.addressJourney.address.addressLine3)
              expect(result.address.address4).to.equal(sessionData.addressJourney.address.addressLine4)
              expect(result.address.postcode).to.equal(sessionData.addressJourney.address.postcode)
              expect(result.agentCompany.id).to.not.equal(company.id)
              expect(result.agentCompany.type).to.equal('organisation')
              expect(result.agentCompany.companyNumber).to.equal(companySearchResult.number)
              expect(result.agentCompany.name).to.equal(companySearchResult.title)
              expect(result.contact).to.not.exist()
            })
          })

          describe('and selected an existing contact as an FAO', () => {
            beforeEach(async () => {
              sessionData.fao = 'yes'
              sessionData.contactSelected = contact.id

              session = SessionModelStub.build(Sinon, sessionData)

              Sinon.stub(FetchSessionDal, 'go').resolves(session)
            })

            it('creates a new billing account address', async () => {
              const result = await SubmitCheckService.go(session.id)

              expect(result.billingAccountAddress.billingAccountId).to.equal(billingAccount.id)
              expect(result.billingAccountAddress.addressId).to.not.equal(address.id)
              expect(result.billingAccountAddress.addressId).to.exist()
              expect(result.billingAccountAddress.companyId).to.not.equal(company.id)
              expect(result.billingAccountAddress.companyId).to.exist()
              expect(result.billingAccountAddress.contactId).to.not.equal(contact.id)
              expect(result.billingAccountAddress.contactId).to.exist()
              expect(result.address.uprn).to.equal(sessionData.addressJourney.address.uprn)
              expect(result.address.address1).to.equal(sessionData.addressJourney.address.addressLine1)
              expect(result.address.address2).to.equal(sessionData.addressJourney.address.addressLine2)
              expect(result.address.address3).to.equal(sessionData.addressJourney.address.addressLine3)
              expect(result.address.address4).to.equal(sessionData.addressJourney.address.addressLine4)
              expect(result.address.postcode).to.equal(sessionData.addressJourney.address.postcode)
              expect(result.agentCompany.id).to.not.equal(company.id)
              expect(result.agentCompany.type).to.equal('organisation')
              expect(result.agentCompany.companyNumber).to.equal(companySearchResult.number)
              expect(result.agentCompany.name).to.equal(companySearchResult.title)
              expect(result.contact.contactType).to.equal('department')
              expect(result.contact.department).to.equal(contact.$name())
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

              session = SessionModelStub.build(Sinon, sessionData)

              Sinon.stub(FetchSessionDal, 'go').resolves(session)
            })

            it('creates a new billing account address', async () => {
              const result = await SubmitCheckService.go(session.id)

              expect(result.billingAccountAddress.billingAccountId).to.equal(billingAccount.id)
              expect(result.billingAccountAddress.addressId).to.equal(address.id)
              expect(result.billingAccountAddress.companyId).to.not.equal(company.id)
              expect(result.billingAccountAddress.companyId).to.exist()
              expect(result.billingAccountAddress.contactId).to.not.equal(contact.id)
              expect(result.billingAccountAddress.contactId).to.exist()
              expect(result.address.id).to.equal(address.id)
              expect(result.agentCompany.id).to.not.equal(company.id)
              expect(result.agentCompany.type).to.equal('person')
              expect(result.agentCompany.companyNumber).to.not.exist()
              expect(result.agentCompany.name).to.equal(sessionData.individualName)
              expect(result.contact.contactType).to.equal('department')
              expect(result.contact.department).to.equal(sessionData.contactName)
            })
          })

          describe('and has not added an FAO', () => {
            beforeEach(async () => {
              sessionData.fao = 'no'
              sessionData.contactName = null
              sessionData.contactSelected = null

              session = SessionModelStub.build(Sinon, sessionData)

              Sinon.stub(FetchSessionDal, 'go').resolves(session)
            })

            it('creates a new billing account address', async () => {
              const result = await SubmitCheckService.go(session.id)

              expect(result.billingAccountAddress.billingAccountId).to.equal(billingAccount.id)
              expect(result.billingAccountAddress.addressId).to.equal(address.id)
              expect(result.billingAccountAddress.companyId).to.not.equal(company.id)
              expect(result.billingAccountAddress.companyId).to.exist()
              expect(result.billingAccountAddress.contactId).to.not.exist()
              expect(result.address.id).to.equal(address.id)
              expect(result.agentCompany.id).to.not.equal(company.id)
              expect(result.agentCompany.type).to.equal('person')
              expect(result.agentCompany.companyNumber).to.not.exist()
              expect(result.agentCompany.name).to.equal(sessionData.individualName)
              expect(result.contact).to.not.exist()
            })
          })

          describe('and selected an existing contact as an FAO', () => {
            beforeEach(async () => {
              sessionData.fao = 'yes'
              sessionData.contactSelected = contact.id

              session = SessionModelStub.build(Sinon, sessionData)

              Sinon.stub(FetchSessionDal, 'go').resolves(session)
            })

            it('creates a new billing account address', async () => {
              const result = await SubmitCheckService.go(session.id)

              expect(result.billingAccountAddress.billingAccountId).to.equal(billingAccount.id)
              expect(result.billingAccountAddress.addressId).to.equal(address.id)
              expect(result.billingAccountAddress.companyId).to.not.equal(company.id)
              expect(result.billingAccountAddress.companyId).to.exist()
              expect(result.billingAccountAddress.contactId).to.not.equal(contact.id)
              expect(result.billingAccountAddress.contactId).to.exist()
              expect(result.address.id).to.equal(address.id)
              expect(result.agentCompany.id).to.not.equal(company.id)
              expect(result.agentCompany.type).to.equal('person')
              expect(result.agentCompany.companyNumber).to.not.exist()
              expect(result.agentCompany.name).to.equal(sessionData.individualName)
              expect(result.contact.contactType).to.equal('department')
              expect(result.contact.department).to.equal(contact.$name())
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

              session = SessionModelStub.build(Sinon, sessionData)

              Sinon.stub(FetchSessionDal, 'go').resolves(session)
            })

            it('creates a new billing account address', async () => {
              const result = await SubmitCheckService.go(session.id)

              expect(result.billingAccountAddress.billingAccountId).to.equal(billingAccount.id)
              expect(result.billingAccountAddress.addressId).to.not.equal(address.id)
              expect(result.billingAccountAddress.addressId).to.exist()
              expect(result.billingAccountAddress.companyId).to.not.equal(company.id)
              expect(result.billingAccountAddress.companyId).to.exist()
              expect(result.billingAccountAddress.contactId).to.not.equal(contact.id)
              expect(result.billingAccountAddress.contactId).to.exist()
              expect(result.address.uprn).to.equal(sessionData.addressJourney.address.uprn)
              expect(result.address.address1).to.equal(sessionData.addressJourney.address.addressLine1)
              expect(result.address.address2).to.equal(sessionData.addressJourney.address.addressLine2)
              expect(result.address.address3).to.equal(sessionData.addressJourney.address.addressLine3)
              expect(result.address.address4).to.equal(sessionData.addressJourney.address.addressLine4)
              expect(result.address.postcode).to.equal(sessionData.addressJourney.address.postcode)
              expect(result.agentCompany.id).to.not.equal(company.id)
              expect(result.agentCompany.type).to.equal('person')
              expect(result.agentCompany.companyNumber).to.not.exist()
              expect(result.agentCompany.name).to.equal(sessionData.individualName)
              expect(result.contact.contactType).to.equal('department')
              expect(result.contact.department).to.equal(sessionData.contactName)
            })
          })

          describe('and has not added an FAO', () => {
            beforeEach(async () => {
              sessionData.fao = 'no'
              sessionData.contactName = null
              sessionData.contactSelected = null

              session = SessionModelStub.build(Sinon, sessionData)

              Sinon.stub(FetchSessionDal, 'go').resolves(session)
            })

            it('creates a new billing account address', async () => {
              const result = await SubmitCheckService.go(session.id)

              expect(result.billingAccountAddress.billingAccountId).to.equal(billingAccount.id)
              expect(result.billingAccountAddress.addressId).to.not.equal(address.id)
              expect(result.billingAccountAddress.addressId).to.exist()
              expect(result.billingAccountAddress.companyId).to.not.equal(company.id)
              expect(result.billingAccountAddress.companyId).to.exist()
              expect(result.billingAccountAddress.contactId).to.not.exist()
              expect(result.address.uprn).to.equal(sessionData.addressJourney.address.uprn)
              expect(result.address.address1).to.equal(sessionData.addressJourney.address.addressLine1)
              expect(result.address.address2).to.equal(sessionData.addressJourney.address.addressLine2)
              expect(result.address.address3).to.equal(sessionData.addressJourney.address.addressLine3)
              expect(result.address.address4).to.equal(sessionData.addressJourney.address.addressLine4)
              expect(result.address.postcode).to.equal(sessionData.addressJourney.address.postcode)
              expect(result.agentCompany.id).to.not.equal(company.id)
              expect(result.agentCompany.type).to.equal('person')
              expect(result.agentCompany.companyNumber).to.not.exist()
              expect(result.agentCompany.name).to.equal(sessionData.individualName)
              expect(result.contact).to.not.exist()
            })
          })

          describe('and selected an existing contact as an FAO', () => {
            beforeEach(async () => {
              sessionData.fao = 'yes'
              sessionData.contactSelected = contact.id

              session = SessionModelStub.build(Sinon, sessionData)

              Sinon.stub(FetchSessionDal, 'go').resolves(session)
            })

            it('creates a new billing account address', async () => {
              const result = await SubmitCheckService.go(session.id)

              expect(result.billingAccountAddress.billingAccountId).to.equal(billingAccount.id)
              expect(result.billingAccountAddress.addressId).to.not.equal(address.id)
              expect(result.billingAccountAddress.addressId).to.exist()
              expect(result.billingAccountAddress.companyId).to.not.equal(company.id)
              expect(result.billingAccountAddress.companyId).to.exist()
              expect(result.billingAccountAddress.contactId).to.not.equal(contact.id)
              expect(result.billingAccountAddress.contactId).to.exist()
              expect(result.address.uprn).to.equal(sessionData.addressJourney.address.uprn)
              expect(result.address.address1).to.equal(sessionData.addressJourney.address.addressLine1)
              expect(result.address.address2).to.equal(sessionData.addressJourney.address.addressLine2)
              expect(result.address.address3).to.equal(sessionData.addressJourney.address.addressLine3)
              expect(result.address.address4).to.equal(sessionData.addressJourney.address.addressLine4)
              expect(result.address.postcode).to.equal(sessionData.addressJourney.address.postcode)
              expect(result.agentCompany.id).to.not.equal(company.id)
              expect(result.agentCompany.type).to.equal('person')
              expect(result.agentCompany.companyNumber).to.not.exist()
              expect(result.agentCompany.name).to.equal(sessionData.individualName)
              expect(result.contact.contactType).to.equal('department')
              expect(result.contact.department).to.equal(contact.$name())
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
