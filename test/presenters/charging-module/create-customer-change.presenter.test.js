'use strict'

const { describe, it, beforeEach } = require('@jest/globals')
const { expect } = require('@jest/globals')

// Test helpers
const AddressModel = require('../../../app/models/crm-v2/address.model.js')
const CompanyModel = require('../../../app/models/crm-v2/company.model.js')
const ContactModel = require('../../../app/models/crm-v2/contact.model.js')
const InvoiceAccountModel = require('../../../app/models/crm-v2/invoice-account.model.js')

// Thing under test
const CreateCustomerChangePresenter = require('../../../app/presenters/charging-module/create-customer-change.presenter.js')

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
        const result = CreateCustomerChangePresenter.go(
          invoiceAccount,
          address,
          company,
          contact
        )

        expect(result.region).toEqual('B')
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
      const result = CreateCustomerChangePresenter.go(
        invoiceAccount,
        address,
        company,
        contact
      )

      expect(result.customerReference).toEqual('B19120000A')
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
          const result = CreateCustomerChangePresenter.go(
            invoiceAccount,
            address,
            company,
            contact
          )

          expect(result.customerName).toEqual('AGENT COMPANY')
        })
      })

      describe('has not been set', () => {
        beforeEach(() => {
          company = CompanyModel.fromJson({})
        })

        it("returns the name of the invoice account's company for customer name", () => {
          const result = CreateCustomerChangePresenter.go(
            invoiceAccount,
            address,
            company,
            contact
          )

          expect(result.customerName).toEqual('INVOICE ACCOUNT COMPANY')
        })
      })
    })
  })

  describe('addressLine1:', () => {
    describe("when the 'contact'", () => {
      beforeEach(() => {
        company = CompanyModel.fromJson({})
      })

      describe('has been set', () => {
        beforeEach(() => {
          contact = ContactModel.fromJson({
            firstName: 'Margherita',
            lastName: 'Villar'
          })
        })

        describe('and the address has all 4 lines populated', () => {
          beforeEach(() => {
            address = AddressModel.fromJson({
              ...standardAddress,
              address4: 'COLLEGE GREEN'
            })
          })

          it('returns the contact name as an FAO and address1 for addressLine1', () => {
            const result = CreateCustomerChangePresenter.go(
              invoiceAccount,
              address,
              company,
              contact
            )

            expect(result.addressLine1).toEqual(
              'FAO Margherita Villar, ENVIRONMENT AGENCY'
            )
          })
        })

        describe('and not all 4 lines in the address are populated', () => {
          beforeEach(() => {
            address = AddressModel.fromJson({ ...standardAddress })
          })

          it('returns the contact name as an FAO only for addressLine1', () => {
            const result = CreateCustomerChangePresenter.go(
              invoiceAccount,
              address,
              company,
              contact
            )

            expect(result.addressLine1).toEqual('FAO Margherita Villar')
          })
        })
      })

      describe('has not been set', () => {
        beforeEach(() => {
          contact = ContactModel.fromJson({})
        })

        describe('and address1 is populated', () => {
          beforeEach(() => {
            address = AddressModel.fromJson({ ...standardAddress })
          })

          it('returns address1 for addressLine1', () => {
            const result = CreateCustomerChangePresenter.go(
              invoiceAccount,
              address,
              company,
              contact
            )

            expect(result.addressLine1).toEqual('ENVIRONMENT AGENCY')
          })
        })

        describe('and address1 is not populated', () => {
          beforeEach(() => {
            address = AddressModel.fromJson({
              ...standardAddress,
              address1: null
            })
          })

          it('returns the first populated address property for addressLine1', () => {
            const result = CreateCustomerChangePresenter.go(
              invoiceAccount,
              address,
              company,
              contact
            )

            expect(result.addressLine1).toEqual('HORIZON HOUSE')
          })
        })
      })
    })
  })

  // Other test cases follow here...
})
