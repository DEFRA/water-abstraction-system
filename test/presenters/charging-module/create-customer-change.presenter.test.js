'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const AddressModel = require('../../../app/models/crm-v2/address.model.js')
const CompanyModel = require('../../../app/models/crm-v2/company.model.js')
const ContactModel = require('../../../app/models/crm-v2/contact.model.js')
const InvoiceAccountModel = require('../../../app/models/crm-v2/invoice-account.model.js')

// Thing under test
const CreateCustomerChangePresenter = require('../../../app/presenters/charging-module/create-customer-change.presenter.js')

// NOTE: We are currently required to replicate what the legacy code is doing and unfortunately the conversion of a
// WRLS billing invoice account's address to the format required by the Charging Module is convoluted to say the least!
// In an effort to describe just how each property of the request data we send to the Charging Module can be affected by
// what is passed in the tests include a `describe()` block for each property. Within each block we then demonstrate
// what scenarios we face when converting the WRLS data.
describe('Charging Module Create Transaction presenter', () => {
  const invoiceAccount = InvoiceAccountModel.fromJson({
    invoiceAccountNumber: 'B19120000A',
    company: {
      name: 'INVOICE ACCOUNT COMPANY'
    }
  })
  const standardAddress = {
    address1: 'ENVIRONMENT AGENCY',
    address2: 'HORIZON HOUSE',
    address3: 'DEANERY ROAD',
    address4: null,
    town: 'BRISTOL',
    county: null,
    country: 'United Kingdom',
    postcode: 'BS1 5AH'
  }

  let address
  let company
  let contact

  describe('region:', () => {
    beforeEach(() => {
      address = AddressModel.fromJson({ ...standardAddress })
      company = CompanyModel.fromJson({})
      contact = ContactModel.fromJson({})
    })

    describe('whatever letter the invoice account number starts with', () => {
      it('returns as the region', () => {
        const result = CreateCustomerChangePresenter.go(invoiceAccount, address, company, contact)

        expect(result.region).to.equal('B')
      })
    })
  })

  describe('customerReference:', () => {
    beforeEach(() => {
      address = AddressModel.fromJson({ ...standardAddress })
      company = CompanyModel.fromJson({})
      contact = ContactModel.fromJson({})
    })

    it('returns the invoice account number for customer reference', () => {
      const result = CreateCustomerChangePresenter.go(invoiceAccount, address, company, contact)

      expect(result.customerReference).to.equal('B19120000A')
    })
  })

  describe('customerName:', () => {
    describe("when the 'company'", () => {
      beforeEach(() => {
        address = AddressModel.fromJson({ ...standardAddress })
        contact = ContactModel.fromJson({})
      })

      describe('has been set', () => {
        beforeEach(() => {
          company = CompanyModel.fromJson({ name: 'AGENT COMPANY' })
        })

        it("returns the name of the 'company' for customer name", () => {
          const result = CreateCustomerChangePresenter.go(invoiceAccount, address, company, contact)

          expect(result.customerName).to.equal('AGENT COMPANY')
        })
      })

      describe('has not been set', () => {
        beforeEach(() => {
          company = CompanyModel.fromJson({})
        })

        it("returns the name of the invoice account's company for customer name", () => {
          const result = CreateCustomerChangePresenter.go(invoiceAccount, address, company, contact)

          expect(result.customerName).to.equal('INVOICE ACCOUNT COMPANY')
        })
      })
    })
  })

  describe('addressLine1:', () => {
    describe("when the 'contact'", () => {
      beforeEach(() => {
        address = AddressModel.fromJson({ ...standardAddress })
        company = CompanyModel.fromJson({})
      })

      describe('has been set', () => {
        beforeEach(() => {
          contact = ContactModel.fromJson({ firstName: 'Margherita', lastName: 'Villar' })
        })

        it('returns the contact name as an FAO for addressLine1', () => {
          const result = CreateCustomerChangePresenter.go(invoiceAccount, address, company, contact)

          expect(result.addressLine1).to.equal('FAO Margherita Villar')
        })
      })

      describe('has not been set', () => {
        beforeEach(() => {
          contact = ContactModel.fromJson({})
        })

        it('returns address 1 for addressLine1', () => {
          const result = CreateCustomerChangePresenter.go(invoiceAccount, address, company, contact)

          expect(result.addressLine1).to.equal('ENVIRONMENT AGENCY')
        })
      })
    })
  })

  describe('addressLine5:', () => {
    beforeEach(() => {
      address = AddressModel.fromJson({ ...standardAddress })
      company = CompanyModel.fromJson({})
      contact = ContactModel.fromJson({})
    })

    it('returns the town for addressLine5', () => {
      const result = CreateCustomerChangePresenter.go(invoiceAccount, address, company, contact)

      expect(result.addressLine5).to.equal('BRISTOL')
    })
  })

  describe('addressLine6:', () => {
    beforeEach(() => {
      company = CompanyModel.fromJson({})
      contact = ContactModel.fromJson({})
    })

    describe('when both county and country are set', () => {
      beforeEach(() => {
        address = AddressModel.fromJson({
          ...standardAddress,
          county: 'AVON'
        })
      })

      it('returns both county and country for addressLine6', () => {
        const result = CreateCustomerChangePresenter.go(invoiceAccount, address, company, contact)

        expect(result.addressLine6).to.equal('AVON, United Kingdom')
      })
    })

    describe('when neither county and country are set', () => {
      beforeEach(() => {
        address = AddressModel.fromJson({
          ...standardAddress,
          country: null
        })
      })

      it('returns an empty string for addressLine6', () => {
        const result = CreateCustomerChangePresenter.go(invoiceAccount, address, company, contact)

        expect(result.addressLine6).to.equal('')
      })
    })

    describe('when only county is set', () => {
      beforeEach(() => {
        address = AddressModel.fromJson({
          ...standardAddress,
          county: 'AVON',
          country: null
        })
      })

      it('returns just the county for addressLine6', () => {
        const result = CreateCustomerChangePresenter.go(invoiceAccount, address, company, contact)

        expect(result.addressLine6).to.equal('AVON')
      })
    })

    describe('when only country is set', () => {
      beforeEach(() => {
        address = AddressModel.fromJson({ ...standardAddress })
      })

      it('returns just the country for addressLine6', () => {
        const result = CreateCustomerChangePresenter.go(invoiceAccount, address, company, contact)

        expect(result.addressLine6).to.equal('United Kingdom')
      })
    })
  })

  describe('postcode:', () => {
    beforeEach(() => {
      address = AddressModel.fromJson({ ...standardAddress })
      company = CompanyModel.fromJson({})
      contact = ContactModel.fromJson({})
    })

    it('returns the postcode for postcode', () => {
      const result = CreateCustomerChangePresenter.go(invoiceAccount, address, company, contact)

      expect(result.postcode).to.equal('BS1 5AH')
    })
  })

  describe('when any address line is too long', () => {
    beforeEach(() => {
      address = AddressModel.fromJson({
        ...standardAddress,
        town: 'Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch Town'
      })
      company = CompanyModel.fromJson({})
      contact = ContactModel.fromJson({})
    })

    it('truncates it and replaces the last 3 characters with ...', () => {
      const result = CreateCustomerChangePresenter.go(invoiceAccount, address, company, contact)

      expect(result.addressLine5).to.equal('Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoc...')
    })
  })
})
