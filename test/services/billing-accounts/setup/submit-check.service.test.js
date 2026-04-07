'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AddressHelper = require('../../../support/helpers/address.helper.js')
const AddressModel = require('../../../../app/models/address.model.js')
const BillingAccountsFixture = require('../../../support/fixtures/billing-accounts.fixture.js')
const BillingAccountHelper = require('../../../support/helpers/billing-account.helper.js')
const BillingAccountAddressHelper = require('../../../support/helpers/billing-account-address.helper.js')
const ChangeAddressService = require('../../../../app/services/billing-accounts/change-address.service.js')
const CompanyHelper = require('../../../support/helpers/company.helper.js')
const ContactHelper = require('../../../support/helpers/contact.helper.js')
const ContactModel = require('../../../../app/models/contact.model.js')
const CustomersFixture = require('../../../support/fixtures/customers.fixture.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Things to stub
const FetchCompanyService = require('../../../../app/services/billing-accounts/setup/fetch-company.service.js')
const FetchCompanyContactsService = require('../../../../app/services/billing-accounts/setup/fetch-company-contacts.service.js')
const FetchCompaniesService = require('../../../../app/services/billing-accounts/setup/fetch-companies.service.js')

// Thing under test
const SubmitCheckService = require('../../../../app/services/billing-accounts/setup/submit-check.service.js')

describe.only('Billing Accounts - Setup - Submit Check Service', () => {
  let address
  let billingAccount
  let billingAccountAddress
  let company
  let companyContacts
  let contact
  let session
  let sessionData

  const exampleContacts = CustomersFixture.companyContacts()

  const companies = [
    {
      address: 'HORIZON HOUSE, DEANERY ROAD, BRISTOL, BS1 5AH',
      number: '12345678',
      title: 'ENVIRONMENT AGENCY'
    }
  ]

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
      billingAccount: BillingAccountsFixture.billingAccount().billingAccount
    }

    companyContacts = {
      company: billingAccount.company,
      contacts: [contact]
    }

    Sinon.stub(FetchCompanyService, 'go').returns(companies)
    Sinon.stub(FetchCompanyContactsService, 'go').resolves(companyContacts)
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

  describe.only('when called', () => {
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

            session = await SessionHelper.add({ data: sessionData })
          })

          it.only('creates a new billing account address', async () => {
            const result = await SubmitCheckService.go(session.id)

            expect(result.billingAccountAddress.billingAccountId).to.equal(billingAccount.id)
            expect(result.billingAccountAddress.addressId).to.equal(address.id)
            expect(result.billingAccountAddress.companyId).to.equal(company.id)
            expect(result.billingAccountAddress.contactId).to.equal(address.id)
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

            session = await SessionHelper.add({ data: sessionData })
          })

          it('creates a new billing account address', async () => {
            const result = await SubmitCheckService.go(session.id)

            expect(result).to.equal({})
          })
        })

        describe('and selected an existing contact as an FAO', () => {
          beforeEach(async () => {
            sessionData.fao = 'yes'
            sessionData.contactSelected = contact.id

            session = await SessionHelper.add({ data: sessionData })
          })

          it.only('creates a new billing account address', async () => {
            const result = await SubmitCheckService.go(session.id)

            expect(result).to.equal({})
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

            session = await SessionHelper.add({ data: sessionData })
          })

          it('creates a new billing account address', async () => {
            const result = await SubmitCheckService.go(session.id)

            expect(result).to.equal({})
          })
        })

        describe('and has not added an FAO', () => {
          beforeEach(async () => {
            sessionData.fao = 'no'
            sessionData.contactName = null
            sessionData.contactSelected = null

            session = await SessionHelper.add({ data: sessionData })
          })

          it('creates a new billing account address', async () => {
            const result = await SubmitCheckService.go(session.id)

            expect(result).to.equal({})
          })
        })

        describe('and selected an existing contact as an FAO', () => {
          beforeEach(async () => {
            sessionData.fao = 'yes'
            sessionData.contactSelected = contact.id

            session = await SessionHelper.add({ data: sessionData })
          })

          it.only('creates a new billing account address', async () => {
            const result = await SubmitCheckService.go(session.id)

            expect(result).to.equal({})
          })
        })
      })
    })

    describe('and the user has searched for and chosen an existing billing account', () => {
      beforeEach(async () => {
        sessionData.accountSelected = 'another'
        sessionData.existingAccount = billingAccount.company.id
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

            session = await SessionHelper.add({ data: sessionData })
          })

          it('creates a new billing account address', async () => {
            const result = await SubmitCheckService.go(session.id)

            expect(result).to.equal({})
          })
        })

        describe('and has not added an FAO', () => {
          beforeEach(async () => {
            sessionData.fao = 'no'
            sessionData.contactName = null
            sessionData.contactSelected = null

            session = await SessionHelper.add({ data: sessionData })
          })

          it('creates a new billing account address', async () => {
            const result = await SubmitCheckService.go(session.id)

            expect(result).to.equal({})
          })
        })

        describe('and selected an existing contact as an FAO', () => {
          beforeEach(async () => {
            sessionData.fao = 'yes'
            sessionData.contactSelected = contact.id

            session = await SessionHelper.add({ data: sessionData })
          })

          it.only('creates a new billing account address', async () => {
            const result = await SubmitCheckService.go(session.id)

            expect(result).to.equal({})
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

            session = await SessionHelper.add({ data: sessionData })
          })

          it('creates a new billing account address', async () => {
            const result = await SubmitCheckService.go(session.id)

            expect(result).to.equal({})
          })
        })

        describe('and has not added an FAO', () => {
          beforeEach(async () => {
            sessionData.fao = 'no'
            sessionData.contactName = null
            sessionData.contactSelected = null

            session = await SessionHelper.add({ data: sessionData })
          })

          it('creates a new billing account address', async () => {
            const result = await SubmitCheckService.go(session.id)

            expect(result).to.equal({})
          })
        })

        describe('and selected an existing contact as an FAO', () => {
          beforeEach(async () => {
            sessionData.fao = 'yes'
            sessionData.contactSelected = contact.id

            session = await SessionHelper.add({ data: sessionData })
          })

          it.only('creates a new billing account address', async () => {
            const result = await SubmitCheckService.go(session.id)

            expect(result).to.equal({})
          })
        })
      })
    })

    describe('and the user has searched for an existing billing account but chose to create a new one', () => {
      beforeEach(async () => {
        sessionData.accountSelected = 'another'
        sessionData.existingAccount = 'new'
      })

      describe('and selected "company" as the account type', () => {
        beforeEach(async () => {
          sessionData.accountType = 'company'
          sessionData.existingAccount = 'new'
        })

        describe('and selected an existing address', () => {
          describe('and added an FAO', () => {
            beforeEach(async () => {
              sessionData.fao = 'yes'
              sessionData.contactName = 'Contact Name'
              sessionData.contactSelected = 'new'

              session = await SessionHelper.add({ data: sessionData })
            })

            it('creates a new billing account address', async () => {
              const result = await SubmitCheckService.go(session.id)

              expect(result).to.equal({})
            })
          })

          describe('and has not added an FAO', () => {
            beforeEach(async () => {
              sessionData.fao = 'no'
              sessionData.contactName = null
              sessionData.contactSelected = null

              session = await SessionHelper.add({ data: sessionData })
            })

            it('creates a new billing account address', async () => {
              const result = await SubmitCheckService.go(session.id)

              expect(result).to.equal({})
            })
          })

          describe('and selected an existing contact as an FAO', () => {
            beforeEach(async () => {
              sessionData.fao = 'yes'
              sessionData.contactSelected = contact.id

              session = await SessionHelper.add({ data: sessionData })
            })

            it.only('creates a new billing account address', async () => {
              const result = await SubmitCheckService.go(session.id)

              expect(result).to.equal({})
            })
          })
        })

        describe('and selected to create a new address', () => {
          describe('and added an FAO', () => {
            beforeEach(async () => {
              sessionData.fao = 'yes'
              sessionData.contactName = 'Contact Name'
              sessionData.contactSelected = 'new'

              session = await SessionHelper.add({ data: sessionData })
            })

            it('creates a new billing account address', async () => {
              const result = await SubmitCheckService.go(session.id)

              expect(result).to.equal({})
            })
          })

          describe('and has not added an FAO', () => {
            beforeEach(async () => {
              sessionData.fao = 'no'
              sessionData.contactName = null
              sessionData.contactSelected = null

              session = await SessionHelper.add({ data: sessionData })
            })

            it('creates a new billing account address', async () => {
              const result = await SubmitCheckService.go(session.id)

              expect(result).to.equal({})
            })
          })

          describe('and selected an existing contact as an FAO', () => {
            beforeEach(async () => {
              sessionData.fao = 'yes'
              sessionData.contactSelected = contact.id

              session = await SessionHelper.add({ data: sessionData })
            })

            it.only('creates a new billing account address', async () => {
              const result = await SubmitCheckService.go(session.id)

              expect(result).to.equal({})
            })
          })
        })
      })

      describe('and selected "individual" as the account type', () => {
        describe('and selected an existing address', () => {
          describe('and added an FAO', () => {
            beforeEach(async () => {
              sessionData.fao = 'yes'
              sessionData.contactName = 'Contact Name'
              sessionData.contactSelected = 'new'

              session = await SessionHelper.add({ data: sessionData })
            })

            it('creates a new billing account address', async () => {
              const result = await SubmitCheckService.go(session.id)

              expect(result).to.equal({})
            })
          })

          describe('and has not added an FAO', () => {
            beforeEach(async () => {
              sessionData.fao = 'no'
              sessionData.contactName = null
              sessionData.contactSelected = null

              session = await SessionHelper.add({ data: sessionData })
            })

            it('creates a new billing account address', async () => {
              const result = await SubmitCheckService.go(session.id)

              expect(result).to.equal({})
            })
          })

          describe('and selected an existing contact as an FAO', () => {
            beforeEach(async () => {
              sessionData.fao = 'yes'
              sessionData.contactSelected = contact.id

              session = await SessionHelper.add({ data: sessionData })
            })

            it.only('creates a new billing account address', async () => {
              const result = await SubmitCheckService.go(session.id)

              expect(result).to.equal({})
            })
          })
        })

        describe('and selected to create a new address', () => {
          describe('and added an FAO', () => {
            beforeEach(async () => {
              sessionData.fao = 'yes'
              sessionData.contactName = 'Contact Name'
              sessionData.contactSelected = 'new'

              session = await SessionHelper.add({ data: sessionData })
            })

            it('creates a new billing account address', async () => {
              const result = await SubmitCheckService.go(session.id)

              expect(result).to.equal({})
            })
          })

          describe('and has not added an FAO', () => {
            beforeEach(async () => {
              sessionData.fao = 'no'
              sessionData.contactName = null
              sessionData.contactSelected = null

              session = await SessionHelper.add({ data: sessionData })
            })

            it('creates a new billing account address', async () => {
              const result = await SubmitCheckService.go(session.id)

              expect(result).to.equal({})
            })
          })

          describe('and selected an existing contact as an FAO', () => {
            beforeEach(async () => {
              sessionData.fao = 'yes'
              sessionData.contactSelected = contact.id

              session = await SessionHelper.add({ data: sessionData })
            })

            it.only('creates a new billing account address', async () => {
              const result = await SubmitCheckService.go(session.id)

              expect(result).to.equal({})
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
