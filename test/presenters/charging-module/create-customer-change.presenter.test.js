'use strict'

// Test framework dependencies
const { describe, it, beforeEach } = require('node:test')
const { expect } = require('@hapi/code')

// Test helpers
const AddressModel = require('../../../app/models/address.model.js')
const BillingAccountModel = require('../../../app/models/billing-account.model.js')
const CompanyModel = require('../../../app/models/company.model.js')
const ContactModel = require('../../../app/models/contact.model.js')

// Thing under test
const CreateCustomerChangePresenter = require('../../../app/presenters/charging-module/create-customer-change.presenter.js')

// NOTE: We are currently required to replicate what the legacy code is doing and unfortunately the conversion of a
// WRLS billing billing account's address to the format required by the Charging Module is convoluted to say the least!
// In an effort to describe just how each property of the request data we send to the Charging Module can be affected by
// what is passed in the tests include a `describe()` block for each property. Within each block we then demonstrate
// what scenarios we face when converting the WRLS data.
describe('Charging Module Create Transaction presenter', () => {
  const billingAccount = BillingAccountModel.fromJson({
    accountNumber: 'B19120000A',
    company: {
      name: 'BILLING ACCOUNT COMPANY'
    }
  })
  const standardAddress = {
    address1: 'ENVIRONMENT AGENCY',
    address2: 'HORIZON HOUSE',
    address3: 'DEANERY ROAD',
    address4: null,
    address5: 'BRISTOL',
    address6: null,
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

    describe('whatever letter the billing account number starts with', () => {
      it('returns as the region', () => {
        const result = CreateCustomerChangePresenter.go(billingAccount, address, company, contact)

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

    it('returns the billing account number for customer reference', () => {
      const result = CreateCustomerChangePresenter.go(billingAccount, address, company, contact)

      expect(result.customerReference).to.equal('B19120000A')
    })
  })

  describe('customerName:', () => {
    describe('when the "company"', () => {
      beforeEach(() => {
        address = AddressModel.fromJson({ ...standardAddress })
        contact = ContactModel.fromJson({})
      })

      describe('has been set', () => {
        beforeEach(() => {
          company = CompanyModel.fromJson({ name: 'AGENT COMPANY' })
        })

        it('returns the name of the "company" for customer name', () => {
          const result = CreateCustomerChangePresenter.go(billingAccount, address, company, contact)

          expect(result.customerName).to.equal('AGENT COMPANY')
        })
      })

      describe('has not been set', () => {
        beforeEach(() => {
          company = CompanyModel.fromJson({})
        })

        it("returns the name of the billing account's company for customer name", () => {
          const result = CreateCustomerChangePresenter.go(billingAccount, address, company, contact)

          expect(result.customerName).to.equal('BILLING ACCOUNT COMPANY')
        })
      })
    })
  })

  describe('addressLine1:', () => {
    describe('when the "contact"', () => {
      beforeEach(() => {
        company = CompanyModel.fromJson({})
      })

      describe('has been set', () => {
        beforeEach(() => {
          contact = ContactModel.fromJson({ firstName: 'Margherita', lastName: 'Villar' })
        })

        describe('and the address has all 4 lines populated', () => {
          beforeEach(() => {
            address = AddressModel.fromJson({
              ...standardAddress,
              address4: 'COLLEGE GREEN'
            })
          })

          it('returns the contact name as an FAO and address1 for addressLine1', () => {
            const result = CreateCustomerChangePresenter.go(billingAccount, address, company, contact)

            expect(result.addressLine1).to.equal('FAO Margherita Villar, ENVIRONMENT AGENCY')
          })
        })

        describe('and not all 4 lines in the address are populated', () => {
          beforeEach(() => {
            address = AddressModel.fromJson({ ...standardAddress })
          })

          it('returns the contact name as an FAO only for addressLine1', () => {
            const result = CreateCustomerChangePresenter.go(billingAccount, address, company, contact)

            expect(result.addressLine1).to.equal('FAO Margherita Villar')
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
            const result = CreateCustomerChangePresenter.go(billingAccount, address, company, contact)

            expect(result.addressLine1).to.equal('ENVIRONMENT AGENCY')
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
            const result = CreateCustomerChangePresenter.go(billingAccount, address, company, contact)

            expect(result.addressLine1).to.equal('HORIZON HOUSE')
          })
        })
      })
    })
  })

  describe('addressLine2: to addressLine4:', () => {
    describe('when the "contact"', () => {
      beforeEach(() => {
        company = CompanyModel.fromJson({})
      })

      describe('has been set', () => {
        beforeEach(() => {
          contact = ContactModel.fromJson({ firstName: 'Margherita', lastName: 'Villar' })
        })

        describe('and the address has all 4 lines populated', () => {
          beforeEach(() => {
            address = AddressModel.fromJson({
              ...standardAddress,
              address4: 'COLLEGE GREEN'
            })
          })

          it('returns address2 to address4 for addressLine2 to addressLine4', () => {
            const result = CreateCustomerChangePresenter.go(billingAccount, address, company, contact)

            expect(result.addressLine2).to.equal('HORIZON HOUSE')
            expect(result.addressLine3).to.equal('DEANERY ROAD')
            expect(result.addressLine4).to.equal('COLLEGE GREEN')
          })
        })

        describe('and the address only has address4 populated', () => {
          beforeEach(() => {
            address = AddressModel.fromJson({
              ...standardAddress,
              address1: null,
              address2: null,
              address3: null,
              address4: 'COLLEGE GREEN'
            })
          })

          it('returns address4 for addressLine2 and null for the rest', () => {
            const result = CreateCustomerChangePresenter.go(billingAccount, address, company, contact)

            expect(result.addressLine2).to.equal('COLLEGE GREEN')
            expect(result.addressLine3).to.be.null()
            expect(result.addressLine4).to.be.null()
          })
        })
      })

      describe('has not been set', () => {
        beforeEach(() => {
          contact = ContactModel.fromJson({})
        })

        describe('and all 4 address properties are set', () => {
          beforeEach(() => {
            address = AddressModel.fromJson({
              ...standardAddress,
              address4: 'COLLEGE GREEN'
            })
          })

          it('returns address2 to address4 for addressLine2 to addressLine4', () => {
            const result = CreateCustomerChangePresenter.go(billingAccount, address, company, contact)

            expect(result.addressLine2).to.equal('HORIZON HOUSE')
            expect(result.addressLine3).to.equal('DEANERY ROAD')
            expect(result.addressLine4).to.equal('COLLEGE GREEN')
          })
        })

        describe('and only 2 address properties are set', () => {
          beforeEach(() => {
            address = AddressModel.fromJson({
              ...standardAddress,
              address1: null,
              address2: null,
              address3: 'DEANERY ROAD',
              address4: 'COLLEGE GREEN'
            })
          })

          it('returns the second property as addressLine2 and addressLine3 to addressLine4 are null', () => {
            const result = CreateCustomerChangePresenter.go(billingAccount, address, company, contact)

            expect(result.addressLine2).to.equal('COLLEGE GREEN')
            expect(result.addressLine3).to.be.null()
            expect(result.addressLine4).to.be.null()
          })
        })

        describe('and only 1 address property is set', () => {
          beforeEach(() => {
            address = AddressModel.fromJson({
              ...standardAddress,
              address1: null,
              address2: null,
              address3: null,
              address4: 'COLLEGE GREEN'
            })
          })

          it('returns null for addressLine2 to addressLine4', () => {
            const result = CreateCustomerChangePresenter.go(billingAccount, address, company, contact)

            expect(result.addressLine2).to.be.null()
            expect(result.addressLine3).to.be.null()
            expect(result.addressLine4).to.be.null()
          })
        })
      })
    })
  })

  describe('addressLine5:', () => {
    beforeEach(() => {
      company = CompanyModel.fromJson({})
      contact = ContactModel.fromJson({})
    })

    describe('when address5 is set in the address', () => {
      beforeEach(() => {
        address = AddressModel.fromJson({ ...standardAddress })
      })

      it('returns address for addressLine5', () => {
        const result = CreateCustomerChangePresenter.go(billingAccount, address, company, contact)

        expect(result.addressLine5).to.equal('BRISTOL')
      })
    })

    describe('when address5 is not set in the address', () => {
      beforeEach(() => {
        address = AddressModel.fromJson({ ...standardAddress, address5: null })
      })

      it('returns null for addressLine5', () => {
        const result = CreateCustomerChangePresenter.go(billingAccount, address, company, contact)

        expect(result.addressLine5).to.be.null()
      })
    })
  })

  describe('addressLine6:', () => {
    beforeEach(() => {
      company = CompanyModel.fromJson({})
      contact = ContactModel.fromJson({})
    })

    describe('when both address6 and country are set', () => {
      beforeEach(() => {
        address = AddressModel.fromJson({
          ...standardAddress,
          address6: 'AVON'
        })
      })

      it('returns both address6 and country for addressLine6', () => {
        const result = CreateCustomerChangePresenter.go(billingAccount, address, company, contact)

        expect(result.addressLine6).to.equal('AVON, United Kingdom')
      })
    })

    describe('when neither address6 and country are set', () => {
      beforeEach(() => {
        address = AddressModel.fromJson({
          ...standardAddress,
          country: null
        })
      })

      it('returns an empty string for addressLine6', () => {
        const result = CreateCustomerChangePresenter.go(billingAccount, address, company, contact)

        expect(result.addressLine6).to.equal('')
      })
    })

    describe('when only address6 is set', () => {
      beforeEach(() => {
        address = AddressModel.fromJson({
          ...standardAddress,
          address6: 'AVON',
          country: null
        })
      })

      it('returns just address for addressLine6', () => {
        const result = CreateCustomerChangePresenter.go(billingAccount, address, company, contact)

        expect(result.addressLine6).to.equal('AVON')
      })
    })

    describe('when only country is set', () => {
      beforeEach(() => {
        address = AddressModel.fromJson({ ...standardAddress })
      })

      it('returns just the country for addressLine6', () => {
        const result = CreateCustomerChangePresenter.go(billingAccount, address, company, contact)

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
      const result = CreateCustomerChangePresenter.go(billingAccount, address, company, contact)

      expect(result.postcode).to.equal('BS1 5AH')
    })
  })

  describe('when any address line is too long', () => {
    beforeEach(() => {
      address = AddressModel.fromJson({
        ...standardAddress,
        address5: 'Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch Town'
      })
      company = CompanyModel.fromJson({})
      contact = ContactModel.fromJson({})
    })

    it('truncates it and replaces the last 3 characters with ...', () => {
      const result = CreateCustomerChangePresenter.go(billingAccount, address, company, contact)

      expect(result.addressLine5).to.equal('Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoc...')
    })
  })
})
