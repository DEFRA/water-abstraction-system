'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillingAccountsFixture = require('../../fixtures/billing-accounts.fixtures.js')

// Thing under test
const ViewBillingAccountPresenter = require('../../../app/presenters/billing-account/view-billing-account.presenter.js')

describe('View Billing Account presenter', () => {
  let billingAccountData

  beforeEach(() => {
    billingAccountData = BillingAccountsFixture.billingAccount()
  })

  describe('when provided with a populated billing account', () => {
    it('returns the correctly presents the data', () => {
      const result = ViewBillingAccountPresenter.go(billingAccountData)

      expect(result).to.equal({
        accountNumber: 'S88897992A',
        address: ['Ferns Surfacing Limited', 'Tutsham Farm', 'West Farleigh', 'Maidstone', 'Kent', 'ME15 0NE'],
        billingAccountId: '9b03843e-848b-497e-878e-4a6628d4f683',
        bills: [
          {
            billId: '3d1b5d1f-9b57-4a28-bde1-1d57cd77b203',
            billNumber: 'Zero value bill',
            billRunNumber: 607,
            billRunType: 'Annual',
            billTotal: '£103.84',
            dateCreated: '14 December 2023',
            financialYear: 2021
          }
        ],
        createdDate: '14 December 2023',
        customerFile: null,
        lastUpdated: null,
        licenceId: '1c26e4f8-bce8-427f-8a88-72e704a4ca04',
        pageTitle: 'Billing account for Ferns Surfacing Limited',
        pagination: { total: 1 }
      })
    })
  })

  describe('the "address" property', () => {
    describe('when all address lines are populated', () => {
      beforeEach(() => {
        billingAccountData.billingAccount.billingAccountAddresses[0].address.address3 = 'test road'
        billingAccountData.billingAccount.billingAccountAddresses[0].address.address4 = 'test town'
      })

      it('returns an array of address lines title cased with the postcode capitalised', () => {
        const result = ViewBillingAccountPresenter.go(billingAccountData)

        expect(result.address).to.equal([
          'Ferns Surfacing Limited',
          'Tutsham Farm',
          'West Farleigh',
          'Test Road',
          'Test Town',
          'Maidstone',
          'Kent',
          'ME15 0NE'
        ])
      })
    })

    describe('when some address lines are null', () => {
      it('returns an array of populated address lines title cased with the postcode capitalised', () => {
        const result = ViewBillingAccountPresenter.go(billingAccountData)

        expect(result.address).to.equal([
          'Ferns Surfacing Limited',
          'Tutsham Farm',
          'West Farleigh',
          'Maidstone',
          'Kent',
          'ME15 0NE'
        ])
      })
    })
  })

  describe('the "bills" property', () => {
    describe('the "bills.billNumber" property', () => {
      describe('when the "invoiceNumber" is populated', () => {
        beforeEach(() => {
          billingAccountData.bills[0].invoiceNumber = 'Test123'
        })

        it('returns the "invoiceNumber" value', () => {
          const result = ViewBillingAccountPresenter.go(billingAccountData)

          expect(result.bills[0].billNumber).to.equal('Test123')
        })
      })

      describe('when the "invoiceNumber" is null', () => {
        it('returns the string "Zero value bill"', () => {
          const result = ViewBillingAccountPresenter.go(billingAccountData)

          expect(result.bills[0].billNumber).to.equal('Zero value bill')
        })
      })
    })

    describe('the "bills.billTotal" property', () => {
      describe('when the "bill.credit" property is true', () => {
        beforeEach(() => {
          billingAccountData.bills[0].credit = true
        })

        it('returns the formatted "bill.netAmount" value followed by the string "Credit"', () => {
          const result = ViewBillingAccountPresenter.go(billingAccountData)

          expect(result.bills[0].billTotal).to.equal('£103.84 Credit')
        })
      })

      describe('when the "bill.credit" property is false', () => {
        it('returns the formatted "bill.netAmount" value', () => {
          const result = ViewBillingAccountPresenter.go(billingAccountData)

          expect(result.bills[0].billTotal).to.equal('£103.84')
        })
      })
    })
  })

  describe('the "lastUpdated" property', () => {
    describe('when the "lastTransactionFileCreatedAt" is populated', () => {
      beforeEach(() => {
        billingAccountData.billingAccount.lastTransactionFileCreatedAt = new Date('2023-12-14T18:42:59.659Z')
      })

      it('returns the formatted "lastTransactionFileCreatedAt" date value', () => {
        const result = ViewBillingAccountPresenter.go(billingAccountData)

        expect(result.lastUpdated).to.equal('14 December 2023')
      })
    })

    describe('when the "lastTransactionFileCreatedAt" is null', () => {
      it('returns null', () => {
        const result = ViewBillingAccountPresenter.go(billingAccountData)

        expect(result.lastUpdated).to.be.null()
      })
    })
  })
})
