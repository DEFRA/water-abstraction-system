'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const AddressHelper = require('../../support/helpers/address.helper.js')
const AddressModel = require('../../../app/models/address.model.js')
const BillingAccountAddressHelper = require('../../support/helpers/billing-account-address.helper.js')
const BillingAccountAddressModel = require('../../../app/models/billing-account-address.model.js')
const BillingAccountHelper = require('../../support/helpers/billing-account.helper.js')
const CompanyHelper = require('../../support/helpers/company.helper.js')
const CompanyModel = require('../../../app/models/company.model.js')
const ContactModel = require('../../../app/models/contact.model.js')
const DatabaseSupport = require('../../support/database.js')

// Things we need to stub
const SendCustomerChangeService = require('../../../app/services/billing-accounts/send-customer-change.service.js')

// Thing under test
const ChangeAddressService = require('../../../app/services/billing-accounts/change-address.service.js')

describe('Change address service', () => {
  const addressFromLookup = {
    addressLine1: 'NATURAL ENGLAND',
    addressLine2: 'HORIZON HOUSE',
    town: 'BRISTOL',
    postcode: 'BS1 5AH',
    uprn: AddressHelper.generateUprn()
  }
  const addressFromManual = {
    addressLine1: '62 High St', town: 'Harpenden', postcode: 'AL5 2SP'
  }
  const companyCompaniesHouse = {
    type: 'organisation',
    name: 'SCP Foundation',
    companyNumber: CompanyHelper.generateCompanyNumber(),
    organisationType: 'limitedCompany'
  }
  const contactDepartment = {
    type: 'department', department: 'Humanoid Risk Assessment'
  }
  const contactIndividual = {
    type: 'person', firstName: 'Margherita', lastName: 'Villar'
  }
  const billingAccountId = '2e72bd15-1412-4329-bf92-5217f83d19c0'

  let address
  let agentCompany
  let billingAccount
  let contact

  beforeEach(async () => {
    await DatabaseSupport.clean()

    billingAccount = await BillingAccountHelper.add({ id: billingAccountId })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the request to the Charging Module API succeeds', () => {
    beforeEach(async () => {
      Sinon.stub(SendCustomerChangeService, 'go').resolves()
    })

    describe('and only an address is provided', () => {
      beforeEach(() => {
        address = { ...addressFromManual }
      })

      it('creates the billing account address and address records and handles the null agent and contact', async () => {
        const result = await ChangeAddressService.go(billingAccountId, address, agentCompany, contact)

        const newAddress = await AddressModel.query().first()

        expect(result.billingAccountAddress.addressId).to.equal(newAddress.id)
        expect(result.address.address1).to.equal('62 High St')
        expect(result.agentCompany).to.be.null()
        expect(result.contact).to.be.null()
      })
    })

    describe('and the address provided', () => {
      describe('was selected from OS Places results (has a UPRN)', () => {
        beforeEach(() => {
          address = { ...addressFromLookup }
        })

        describe('and a matching address already exists', () => {
          let existingAddress

          beforeEach(async () => {
            const { uprn } = address

            existingAddress = await AddressHelper.add({ uprn })
          })

          it('overwrites the existing address with the latest OS Places details', async () => {
            await ChangeAddressService.go(billingAccountId, address, agentCompany, contact)

            const reFetchedExistingAddress = await existingAddress.$query()

            expect(reFetchedExistingAddress.id).to.equal(existingAddress.id)
            expect(reFetchedExistingAddress.createdAt).to.equal(existingAddress.createdAt)
            expect(reFetchedExistingAddress.address1).to.equal(address.addressLine1)
            expect(reFetchedExistingAddress.updatedAt).not.to.equal(existingAddress.updatedAt)
          })

          it('links the billing account address record to the existing address', async () => {
            const result = await ChangeAddressService.go(billingAccountId, address, agentCompany, contact)

            expect(result.billingAccountAddress.addressId).to.equal(existingAddress.id)
          })
        })

        describe('and a matching address does not exist', () => {
          it('creates a new address record', async () => {
            await ChangeAddressService.go(billingAccountId, address, agentCompany, contact)

            const result = await AddressModel.query()

            expect(result.length).to.equal(1)
            expect(result[0].address1).to.equal(address.addressLine1)
            expect(result[0].uprn).to.equal(address.uprn)
          })

          it('links the billing account address record to the new address', async () => {
            const result = await ChangeAddressService.go(billingAccountId, address, agentCompany, contact)

            const newAddress = await AddressModel.query().first()

            expect(result.billingAccountAddress.addressId).to.equal(newAddress.id)
          })
        })
      })

      describe('was entered manually (does not have a UPRN)', () => {
        beforeEach(() => {
          address = { ...addressFromManual }
        })

        it('creates a new address record', async () => {
          await ChangeAddressService.go(billingAccountId, address, agentCompany, contact)

          const result = await AddressModel.query()

          expect(result.length).to.equal(1)
          expect(result[0].address1).to.equal('62 High St')
        })

        it('links the billing account address record to the new address', async () => {
          const result = await ChangeAddressService.go(billingAccountId, address, agentCompany, contact)

          const newAddress = await AddressModel.query().first()

          expect(result.billingAccountAddress.addressId).to.equal(newAddress.id)
        })
      })

      describe('was selected from previously used addresses (has an ID)', () => {
        let existingAddress

        beforeEach(async () => {
          existingAddress = await AddressHelper.add()

          address = { addressId: existingAddress.id }
        })

        it('makes no changes to the existing address record', async () => {
          await ChangeAddressService.go(billingAccountId, address, agentCompany, contact)

          const reFetchedExistingAddress = await existingAddress.$query()

          expect(reFetchedExistingAddress.id).to.equal(existingAddress.id)
          expect(reFetchedExistingAddress.address1).to.equal(existingAddress.address1)
          expect(reFetchedExistingAddress.createdAt).to.equal(existingAddress.createdAt)
          expect(reFetchedExistingAddress.updatedAt).to.equal(existingAddress.updatedAt)
        })

        it('links the billing account address record to the existing address', async () => {
          const result = await ChangeAddressService.go(billingAccountId, address, agentCompany, contact)

          expect(result.billingAccountAddress.addressId).to.equal(existingAddress.id)
        })
      })
    })

    describe('and the company provided', () => {
      beforeEach(() => {
        address = { ...addressFromManual }
        agentCompany = { ...companyCompaniesHouse }
      })

      describe('has a company number that matches an existing record', () => {
        let existingCompany

        beforeEach(async () => {
          const { companyNumber } = agentCompany

          existingCompany = await CompanyHelper.add({ companyNumber })
        })

        it('overwrites the existing company with the latest Companies House details', async () => {
          await ChangeAddressService.go(billingAccountId, address, agentCompany, contact)

          const reFetchedExistingCompany = await existingCompany.$query()

          expect(reFetchedExistingCompany.id).to.equal(existingCompany.id)
          expect(reFetchedExistingCompany.createdAt).to.equal(existingCompany.createdAt)
          expect(reFetchedExistingCompany.name).to.equal(agentCompany.name)
          expect(reFetchedExistingCompany.updatedAt).not.to.equal(existingCompany.updatedAt)
        })

        it('links the billing account address record to the existing company', async () => {
          const result = await ChangeAddressService.go(billingAccountId, address, agentCompany, contact)

          expect(result.billingAccountAddress.companyId).to.equal(existingCompany.id)
        })
      })

      describe('has a company number that does not match an existing record', () => {
        it('creates a new company record', async () => {
          await ChangeAddressService.go(billingAccountId, address, agentCompany, contact)

          const result = await CompanyModel.query()

          expect(result.length).to.equal(1)
          expect(result[0].name).to.equal(agentCompany.name)
          expect(result[0].companyNumber).to.equal(agentCompany.companyNumber)
        })

        it('links the billing account address record to the new company', async () => {
          const result = await ChangeAddressService.go(billingAccountId, address, agentCompany, contact)

          const newCompany = await CompanyModel.query().first()

          expect(result.billingAccountAddress.companyId).to.equal(newCompany.id)
        })
      })

      describe('was selected from companies matching the provided search', () => {
        let existingCompany

        beforeEach(async () => {
          existingCompany = await CompanyHelper.add()

          agentCompany = { companyId: existingCompany.id }
        })

        it('makes no changes to the existing company record', async () => {
          await ChangeAddressService.go(billingAccountId, address, agentCompany, contact)

          const reFetchedExistingCompany = await existingCompany.$query()

          expect(reFetchedExistingCompany.id).to.equal(existingCompany.id)
          expect(reFetchedExistingCompany.name).to.equal(existingCompany.name)
          expect(reFetchedExistingCompany.createdAt).to.equal(existingCompany.createdAt)
          expect(reFetchedExistingCompany.updatedAt).to.equal(existingCompany.updatedAt)
        })

        it('links the billing account address record to the existing company', async () => {
          const result = await ChangeAddressService.go(billingAccountId, address, agentCompany, contact)

          expect(result.billingAccountAddress.companyId).to.equal(existingCompany.id)
        })
      })
    })

    describe('and the contact is provided', () => {
      beforeEach(() => {
        address = { ...addressFromManual }
      })

      describe('is a department', () => {
        beforeEach(() => {
          contact = { ...contactDepartment }
        })

        it('creates a new contact record', async () => {
          await ChangeAddressService.go(billingAccountId, address, agentCompany, contact)

          const result = await ContactModel.query()

          expect(result.length).to.equal(1)
          expect(result[0].department).to.equal('Humanoid Risk Assessment')
        })

        it('links the billing account address record to the new contact', async () => {
          const result = await ChangeAddressService.go(billingAccountId, address, agentCompany, contact)

          const newContact = await ContactModel.query().first()

          expect(result.billingAccountAddress.contactId).to.equal(newContact.id)
        })
      })

      describe('is an individual', () => {
        beforeEach(() => {
          contact = { ...contactIndividual }
        })

        it('creates a new contact record', async () => {
          await ChangeAddressService.go(billingAccountId, address, agentCompany, contact)

          const result = await ContactModel.query()

          expect(result.length).to.equal(1)
          expect(result[0].firstName).to.equal('Margherita')
          expect(result[0].lastName).to.equal('Villar')
        })

        it('links the billing account address record to the new contact', async () => {
          const result = await ChangeAddressService.go(billingAccountId, address, agentCompany, contact)

          const newContact = await ContactModel.query().first()

          expect(result.billingAccountAddress.contactId).to.equal(newContact.id)
        })
      })
    })

    describe('and the "current" billing account address', () => {
      let clock
      let existingBillingAccountAddress

      beforeEach(() => {
        address = { ...addressFromManual }

        const testDate = new Date(2023, 8, 4, 10, 31, 57, 2)

        clock = Sinon.useFakeTimers(testDate)
      })

      afterEach(() => {
        clock.restore()
      })

      describe('has a matching start date', () => {
        beforeEach(async () => {
          const startDate = new Date(2023, 8, 4)
          const timestamp = new Date(2023, 8, 4, 9, 22, 57, 13)

          existingBillingAccountAddress = await BillingAccountAddressHelper.add({
            billingAccountId,
            startDate,
            createdAt: timestamp,
            updatedAt: timestamp
          })
        })

        it('overwrites the existing record and ensures the end date is null', async () => {
          const result = await ChangeAddressService.go(billingAccountId, address, agentCompany, contact)

          const newBillingAccountAddress = await BillingAccountAddressModel.query()
            .findById(result.billingAccountAddress.id)

          expect(newBillingAccountAddress.id)
            .to.equal(existingBillingAccountAddress.id)
          expect(newBillingAccountAddress.addressId).not.to.equal(existingBillingAccountAddress.addressId)
          expect(newBillingAccountAddress.endDate).to.be.null()
          expect(newBillingAccountAddress.createdAt).to.equal(existingBillingAccountAddress.createdAt)
          expect(newBillingAccountAddress.updatedAt).to.be.above(existingBillingAccountAddress.updatedAt)
        })
      })

      describe('has a different start date', () => {
        beforeEach(async () => {
          const startDate = new Date(2023, 7, 3)
          const timestamp = new Date(2023, 7, 3, 14, 46, 3, 18)

          existingBillingAccountAddress = await BillingAccountAddressHelper.add({
            billingAccountId,
            startDate,
            createdAt: timestamp,
            updatedAt: timestamp
          })
        })

        it('creates a new billing account record with a null end date', async () => {
          const result = await ChangeAddressService.go(billingAccountId, address, agentCompany, contact)

          const newBillingAccountAddress = await BillingAccountAddressModel.query()
            .findById(result.billingAccountAddress.id)

          expect(newBillingAccountAddress.id)
            .not.to.equal(existingBillingAccountAddress.id)
          expect(newBillingAccountAddress.addressId).not.to.equal(existingBillingAccountAddress.addressId)
          expect(newBillingAccountAddress.endDate).to.be.null()
          expect(newBillingAccountAddress.createdAt).to.be.above(existingBillingAccountAddress.createdAt)
          expect(newBillingAccountAddress.updatedAt).to.be.above(existingBillingAccountAddress.updatedAt)
        })

        it("updates the end date of the existing record to yesterday's date", async () => {
          await ChangeAddressService.go(billingAccountId, address, agentCompany, contact)

          const reFetchedExistingBillingAccountAddress = await existingBillingAccountAddress.$query()
          const yesterday = new Date(2023, 8, 3)

          expect(reFetchedExistingBillingAccountAddress.endDate).to.equal(yesterday)
          expect(reFetchedExistingBillingAccountAddress.updatedAt).to.be.above(existingBillingAccountAddress.updatedAt)
        })
      })
    })
  })

  describe('when the request to the Charging Module API fails', () => {
    beforeEach(() => {
      Sinon.stub(SendCustomerChangeService, 'go').rejects()
    })

    it('throws an error', async () => {
      await expect(ChangeAddressService.go(billingAccount, address, agentCompany, contact)).to.reject()
    })
  })

  describe('when persisting the changes fails', () => {
    beforeEach(() => {
      address = { ...addressFromManual }
      agentCompany = { ...companyCompaniesHouse }
      contact = { ...contactDepartment }

      // We just need something within the transaction to go bang. `fromJson() is ideal because a) we can stub it!, and
      // b) it gets called after we have supposedly persisted the address, company and contact records.
      Sinon.stub(BillingAccountAddressModel, 'fromJson').rejects()
    })

    it('throws an error', async () => {
      await expect(ChangeAddressService.go(billingAccount, address, agentCompany, contact)).to.reject()
    })

    it('no changes are made to the DB', async () => {
      await expect(ChangeAddressService.go(billingAccount, address, agentCompany, contact)).to.reject()

      const resultAddresses = await AddressModel.query()
      const resultCompanies = await CompanyModel.query()
      const resultContacts = await ContactModel.query()
      const resultBillingAccountAddresses = await BillingAccountAddressModel.query()

      expect(resultAddresses).to.be.empty()
      expect(resultCompanies).to.be.empty()
      expect(resultContacts).to.be.empty()
      expect(resultBillingAccountAddresses).to.be.empty()
    })
  })
})
