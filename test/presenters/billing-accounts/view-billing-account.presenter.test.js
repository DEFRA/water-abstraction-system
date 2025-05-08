'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ViewBillingAccountPresenter = require('../../../app/presenters/billing-account/view-billing-account.presenter.js')

describe('View Billing Account presenter', () => {
  let billingAccountData

  beforeEach(() => {
    billingAccountData = _testBillingAccountData()
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
        licenceId: '91aff99a-3204-4727-86bd-7bdf3ef24533',
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

function _testBillingAccountData() {
  return {
    billingAccount: {
      id: '9b03843e-848b-497e-878e-4a6628d4f683',
      accountNumber: 'S88897992A',
      createdAt: new Date('2023-12-14T18:42:59.659Z'),
      lastTransactionFile: null,
      lastTransactionFileCreatedAt: null,
      billingAccountAddresses: [
        {
          id: '04ba8291-fb58-40a9-9581-cfedc136eef7',
          address: {
            id: '310ae9a7-69c1-49b3-a29f-0ba46e6cfa7b',
            address1: 'Tutsham Farm',
            address2: 'West Farleigh',
            address3: null,
            address4: null,
            address5: 'Maidstone',
            address6: 'Kent',
            postcode: 'ME15 0NE'
          }
        }
      ],
      company: {
        id: '55a71eb5-e0e1-443e-9a25-c529cccfd6df',
        name: 'Ferns Surfacing Limited'
      }
    },
    bills: [
      {
        id: '3d1b5d1f-9b57-4a28-bde1-1d57cd77b203',
        createdAt: new Date('2023-12-14T18:42:59.659Z'),
        credit: false,
        invoiceNumber: false,
        netAmount: 10384,
        financialYear: 2021,
        billRun: {
          id: 'eee30072-ad12-426a-9d69-c712f38e581d',
          batchType: 'annual',
          billRunNumber: 607,
          scheme: 'alcs',
          source: 'nald',
          summer: false
        }
      }
    ],
    licenceId: '91aff99a-3204-4727-86bd-7bdf3ef24533',
    pagination: { total: 1 }
  }
}
