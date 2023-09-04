'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const AddressHelper = require('../../support/helpers/crm-v2/address.helper.js')
const AddressModel = require('../../../app/models/crm-v2/address.model.js')
const CompanyHelper = require('../../support/helpers/crm-v2/company.helper.js')
const CompanyModel = require('../../../app/models/crm-v2/company.model.js')
const ContactModel = require('../../../app/models/crm-v2/contact.model.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const InvoiceAccountHelper = require('../../support/helpers/crm-v2/invoice-account.helper.js')
const InvoiceAccountAddressHelper = require('../../support/helpers/crm-v2/invoice-account-address.helper.js')
const InvoiceAccountAddressModel = require('../../../app/models/crm-v2/invoice-account-address.model.js')

// Things we need to stub
const SendCustomerChangeService = require('../../../app/services/billing-accounts/send-customer-change.service.js')

// Thing under test
const ChangeAddressService = require('../../../app/services/billing-accounts/change-address.service.js')

describe('Change address service', () => {
  const addressFromLookup = {
    addressLine1: 'NATURAL ENGLAND', addressLine2: 'HORIZON HOUSE', town: 'BRISTOL', postcode: 'BS1 5AH', uprn: 340116
  }
  const addressFromManual = {
    addressLine1: '62 High St', town: 'Harpenden', postcode: 'AL5 2SP'
  }
  const companyCompaniesHouse = {
    type: 'organisation', name: 'SCP Foundation', companyNumber: '04296934', organisationType: 'limitedCompany'
  }
  const contactDepartment = {
    type: 'department', department: 'Humanoid Risk Assessment'
  }
  const contactIndividual = {
    type: 'person', firstName: 'Margherita', lastName: 'Villar'
  }
  const invoiceAccountId = '2e72bd15-1412-4329-bf92-5217f83d19c0'

  let address
  let agentCompany
  let contact
  let invoiceAccount

  beforeEach(async () => {
    await DatabaseHelper.clean()

    invoiceAccount = await InvoiceAccountHelper.add({ invoiceAccountId })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the request to the Charging Module API succeeds', () => {
    beforeEach(async () => {
      Sinon.stub(SendCustomerChangeService, 'go').resolves()
    })

    describe('and the address provided', () => {
      describe('was selected from OS Places results (has a UPRN)', () => {
        beforeEach(() => {
          address = { ...addressFromLookup }
        })

        describe('and a matching address already exists', () => {
          let existingAddress

          beforeEach(async () => {
            existingAddress = await AddressHelper.add()
          })

          it('overwrites the existing address with the latest OS Places details', async () => {
            await ChangeAddressService.go(invoiceAccountId, address, agentCompany, contact)

            const reFetchedExistingAddress = await existingAddress.$query()

            expect(reFetchedExistingAddress.addressId).to.equal(existingAddress.addressId)
            expect(reFetchedExistingAddress.createdAt).to.equal(existingAddress.createdAt)
            expect(reFetchedExistingAddress.address1).to.equal('NATURAL ENGLAND')
            expect(reFetchedExistingAddress.updatedAt).not.to.equal(existingAddress.updatedAt)
          })

          it('links the invoice account address record to the existing address', async () => {
            const result = await ChangeAddressService.go(invoiceAccountId, address, agentCompany, contact)

            expect(result.invoiceAccountAddress.addressId).to.equal(existingAddress.addressId)
          })
        })

        describe('and a matching address does not exist', () => {
          it('creates a new address record', async () => {
            await ChangeAddressService.go(invoiceAccountId, address, agentCompany, contact)

            const result = await AddressModel.query()

            expect(result.length).to.equal(1)
            expect(result[0].address1).to.equal('NATURAL ENGLAND')
            expect(result[0].uprn).to.equal(340116)
          })

          it('links the invoice account address record to the new address', async () => {
            const result = await ChangeAddressService.go(invoiceAccountId, address, agentCompany, contact)

            const newAddress = await AddressModel.query().first()

            expect(result.invoiceAccountAddress.addressId).to.equal(newAddress.addressId)
          })
        })
      })

      describe('was entered manually (does not have a UPRN)', () => {
        beforeEach(() => {
          address = { ...addressFromManual }
        })

        it('creates a new address record', async () => {
          await ChangeAddressService.go(invoiceAccountId, address, agentCompany, contact)

          const result = await AddressModel.query()

          expect(result.length).to.equal(1)
          expect(result[0].address1).to.equal('62 High St')
        })

        it('links the invoice account address record to the new address', async () => {
          const result = await ChangeAddressService.go(invoiceAccountId, address, agentCompany, contact)

          const newAddress = await AddressModel.query().first()

          expect(result.invoiceAccountAddress.addressId).to.equal(newAddress.addressId)
        })
      })

      describe('was selected from previously used addresses (has an ID)', () => {
        let existingAddress

        beforeEach(async () => {
          existingAddress = await AddressHelper.add()

          address = { addressId: existingAddress.addressId }
        })

        it('makes no changes to the existing address record', async () => {
          await ChangeAddressService.go(invoiceAccountId, address, agentCompany, contact)

          const reFetchedExistingAddress = await existingAddress.$query()

          expect(reFetchedExistingAddress.addressId).to.equal(existingAddress.addressId)
          expect(reFetchedExistingAddress.address1).to.equal(existingAddress.address1)
          expect(reFetchedExistingAddress.createdAt).to.equal(existingAddress.createdAt)
          expect(reFetchedExistingAddress.updatedAt).to.equal(existingAddress.updatedAt)
        })

        it('links the invoice account address record to the existing address', async () => {
          const result = await ChangeAddressService.go(invoiceAccountId, address, agentCompany, contact)

          expect(result.invoiceAccountAddress.addressId).to.equal(existingAddress.addressId)
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
          existingCompany = await CompanyHelper.add()
        })

        it('overwrites the existing company with the latest Companies House details', async () => {
          await ChangeAddressService.go(invoiceAccountId, address, agentCompany, contact)

          const reFetchedExistingCompany = await existingCompany.$query()

          expect(reFetchedExistingCompany.companyId).to.equal(existingCompany.companyId)
          expect(reFetchedExistingCompany.createdAt).to.equal(existingCompany.createdAt)
          expect(reFetchedExistingCompany.name).to.equal('SCP Foundation')
          expect(reFetchedExistingCompany.updatedAt).not.to.equal(existingCompany.updatedAt)
        })

        it('links the invoice account address record to the existing company', async () => {
          const result = await ChangeAddressService.go(invoiceAccountId, address, agentCompany, contact)

          expect(result.invoiceAccountAddress.agentCompanyId).to.equal(existingCompany.companyId)
        })
      })

      describe('has a company number that does not match an existing record', () => {
        it('creates a new company record', async () => {
          await ChangeAddressService.go(invoiceAccountId, address, agentCompany, contact)

          const result = await CompanyModel.query()

          expect(result.length).to.equal(1)
          expect(result[0].name).to.equal('SCP Foundation')
          expect(result[0].companyNumber).to.equal('04296934')
        })

        it('links the invoice account address record to the new company', async () => {
          const result = await ChangeAddressService.go(invoiceAccountId, address, agentCompany, contact)

          const newCompany = await CompanyModel.query().first()

          expect(result.invoiceAccountAddress.agentCompanyId).to.equal(newCompany.companyId)
        })
      })

      describe('was selected from companies matching the provided search', () => {
        let existingCompany

        beforeEach(async () => {
          existingCompany = await CompanyHelper.add()

          agentCompany = { companyId: existingCompany.companyId }
        })

        it('makes no changes to the existing company record', async () => {
          await ChangeAddressService.go(invoiceAccountId, address, agentCompany, contact)

          const reFetchedExistingCompany = await existingCompany.$query()

          expect(reFetchedExistingCompany.companyId).to.equal(existingCompany.companyId)
          expect(reFetchedExistingCompany.name).to.equal(existingCompany.name)
          expect(reFetchedExistingCompany.createdAt).to.equal(existingCompany.createdAt)
          expect(reFetchedExistingCompany.updatedAt).to.equal(existingCompany.updatedAt)
        })

        it('links the invoice account address record to the existing company', async () => {
          const result = await ChangeAddressService.go(invoiceAccountId, address, agentCompany, contact)

          expect(result.invoiceAccountAddress.agentCompanyId).to.equal(existingCompany.companyId)
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
          await ChangeAddressService.go(invoiceAccountId, address, agentCompany, contact)

          const result = await ContactModel.query()

          expect(result.length).to.equal(1)
          expect(result[0].department).to.equal('Humanoid Risk Assessment')
        })

        it('links the invoice account address record to the new contact', async () => {
          const result = await ChangeAddressService.go(invoiceAccountId, address, agentCompany, contact)

          const newContact = await ContactModel.query().first()

          expect(result.invoiceAccountAddress.contactId).to.equal(newContact.contactId)
        })
      })

      describe('is an individual', () => {
        beforeEach(() => {
          contact = { ...contactIndividual }
        })

        it('creates a new contact record', async () => {
          await ChangeAddressService.go(invoiceAccountId, address, agentCompany, contact)

          const result = await ContactModel.query()

          expect(result.length).to.equal(1)
          expect(result[0].firstName).to.equal('Margherita')
          expect(result[0].lastName).to.equal('Villar')
        })

        it('links the invoice account address record to the new contact', async () => {
          const result = await ChangeAddressService.go(invoiceAccountId, address, agentCompany, contact)

          const newContact = await ContactModel.query().first()

          expect(result.invoiceAccountAddress.contactId).to.equal(newContact.contactId)
        })
      })
    })

    describe("and the 'current' invoice account address", () => {
      const testDate = new Date(Date.UTC(2023, 8, 4, 10, 31, 57))

      let clock
      let existingInvoiceAccountAddress

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

          existingInvoiceAccountAddress = await InvoiceAccountAddressHelper.add({
            invoiceAccountId,
            startDate,
            createdAt: timestamp,
            updatedAt: timestamp
          })
        })

        it('overwrites the existing record and ensures the end date is null', async () => {
          const result = await ChangeAddressService.go(invoiceAccountId, address, agentCompany, contact)

          const newInvoiceAccountAddress = await InvoiceAccountAddressModel.query()
            .findById(result.invoiceAccountAddress.invoiceAccountAddressId)

          expect(newInvoiceAccountAddress.invoiceAccountAddressId)
            .to.equal(existingInvoiceAccountAddress.invoiceAccountAddressId)
          expect(newInvoiceAccountAddress.addressId).not.to.equal(existingInvoiceAccountAddress.addressId)
          expect(newInvoiceAccountAddress.endDate).to.be.null()
          expect(newInvoiceAccountAddress.createdAt).to.equal(existingInvoiceAccountAddress.createdAt)
          expect(newInvoiceAccountAddress.updatedAt).to.be.above(existingInvoiceAccountAddress.updatedAt)
        })
      })

      describe('has a different start date', () => {
        beforeEach(async () => {
          const startDate = new Date(2023, 7, 3)
          const timestamp = new Date(2023, 7, 3, 14, 46, 3, 18)

          existingInvoiceAccountAddress = await InvoiceAccountAddressHelper.add({
            invoiceAccountId,
            startDate,
            createdAt: timestamp,
            updatedAt: timestamp
          })
        })

        it('creates a new invoice account record with a null end date', async () => {
          const result = await ChangeAddressService.go(invoiceAccountId, address, agentCompany, contact)

          const newInvoiceAccountAddress = await InvoiceAccountAddressModel.query()
            .findById(result.invoiceAccountAddress.invoiceAccountAddressId)

          expect(newInvoiceAccountAddress.invoiceAccountAddressId)
            .not.to.equal(existingInvoiceAccountAddress.invoiceAccountAddressId)
          expect(newInvoiceAccountAddress.addressId).not.to.equal(existingInvoiceAccountAddress.addressId)
          expect(newInvoiceAccountAddress.endDate).to.be.null()
          expect(newInvoiceAccountAddress.createdAt).to.be.above(existingInvoiceAccountAddress.createdAt)
          expect(newInvoiceAccountAddress.updatedAt).to.be.above(existingInvoiceAccountAddress.updatedAt)
        })

        it("updates the end date of the existing record to yesterday's date", async () => {
          await ChangeAddressService.go(invoiceAccountId, address, agentCompany, contact)

          const reFetchedExistingInvoiceAccountAddress = await existingInvoiceAccountAddress.$query()
          const yesterday = new Date(2023, 8, 3)

          expect(reFetchedExistingInvoiceAccountAddress.endDate).to.equal(yesterday)
          expect(reFetchedExistingInvoiceAccountAddress.updatedAt).to.be.above(existingInvoiceAccountAddress.updatedAt)
        })
      })
    })
  })

  describe('when the request to the Charging Module API fails', () => {
    beforeEach(() => {
      Sinon.stub(SendCustomerChangeService, 'go').rejects()
    })

    it('throws an error', async () => {
      await expect(ChangeAddressService.go(invoiceAccount, address, agentCompany, contact)).to.reject()
    })
  })

  describe('when persisting the changes fails', () => {
    beforeEach(() => {
      address = { ...addressFromManual }
      agentCompany = { ...companyCompaniesHouse }
      contact = { ...contactDepartment }

      // We just need something within the transaction to go bang. `fromJson() is ideal because a) we can stub it!, and
      // b) it gets called after we have supposedly persisted the address, company and contact records.
      Sinon.stub(InvoiceAccountAddressModel, 'fromJson').rejects()
    })

    it('throws an error', async () => {
      await expect(ChangeAddressService.go(invoiceAccount, address, agentCompany, contact)).to.reject()
    })

    it('no changes are made to the DB', async () => {
      await expect(ChangeAddressService.go(invoiceAccount, address, agentCompany, contact)).to.reject()

      const resultAddresses = await AddressModel.query()
      const resultCompanies = await CompanyModel.query()
      const resultContacts = await ContactModel.query()
      const resultInvoiceAccountAddresses = await InvoiceAccountAddressModel.query()

      expect(resultAddresses).to.be.empty()
      expect(resultCompanies).to.be.empty()
      expect(resultContacts).to.be.empty()
      expect(resultInvoiceAccountAddresses).to.be.empty()
    })
  })
})
