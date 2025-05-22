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
  let licenceId

  beforeEach(() => {
    billingAccountData = BillingAccountsFixture.billingAccount()
    licenceId = '634aecc9-1086-41b1-a1cd-37247f8d321b'
  })

  describe('when provided with a populated billing account', () => {
    it('returns the correctly presents the data', () => {
      const result = ViewBillingAccountPresenter.go(billingAccountData, licenceId)

      expect(result).to.equal({
        accountNumber: 'S88897992A',
        address: ['Ferns Surfacing Limited', 'Tutsham Farm', 'West Farleigh', 'Maidstone', 'Kent', 'ME15 0NE'],
        backLink: {
          title: 'Go back to bills',
          link: `/system/licences/${licenceId}/bills`
        },
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
        const result = ViewBillingAccountPresenter.go(billingAccountData, licenceId)

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
        const result = ViewBillingAccountPresenter.go(billingAccountData, licenceId)

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

  describe('the "backLink" property', () => {
    describe('when the licenceId is undefined', () => {
      beforeEach(() => {
        licenceId = undefined
      })

      it('returns the title "Go back to search" and the link to search page', () => {
        const result = ViewBillingAccountPresenter.go(billingAccountData, licenceId)

        expect(result.backLink).to.equal({
          title: 'Go back to search',
          link: '/licences'
        })
      })
    })

    describe('when the licenceId is not undefined', () => {
      it('returns the title "Go back to bills" and the link to licence bills page', () => {
        const result = ViewBillingAccountPresenter.go(billingAccountData, licenceId)

        expect(result.backLink).to.equal({
          title: 'Go back to bills',
          link: `/system/licences/${licenceId}/bills`
        })
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
          const result = ViewBillingAccountPresenter.go(billingAccountData, licenceId)

          expect(result.bills[0].billNumber).to.equal('Test123')
        })
      })

      describe('when the "invoiceNumber" is null', () => {
        it('returns the string "Zero value bill"', () => {
          const result = ViewBillingAccountPresenter.go(billingAccountData, licenceId)

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
          const result = ViewBillingAccountPresenter.go(billingAccountData, licenceId)

          expect(result.bills[0].billTotal).to.equal('£103.84 Credit')
        })
      })

      describe('when the "bill.credit" property is false', () => {
        it('returns the formatted "bill.netAmount" value', () => {
          const result = ViewBillingAccountPresenter.go(billingAccountData, licenceId)

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
        const result = ViewBillingAccountPresenter.go(billingAccountData, licenceId)

        expect(result.lastUpdated).to.equal('14 December 2023')
      })
    })

    describe('when the "lastTransactionFileCreatedAt" is null', () => {
      it('returns null', () => {
        const result = ViewBillingAccountPresenter.go(billingAccountData, licenceId)

        expect(result.lastUpdated).to.be.null()
      })
    })
  })
})
