// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import BillingAccountsFixture from '../../support/fixtures/billing-accounts.fixture.js'
import { generateUUID } from '../../../app/lib/general.lib.js'

// Thing under test
import ViewBillingAccountPresenter from '../../../app/presenters/billing-accounts/view-billing-account.presenter.js'

describe('Billing Accounts - View Billing Account presenter', () => {
  let billingAccountData
  let chargeVersionId
  let companyId
  let licenceId

  beforeEach(() => {
    billingAccountData = BillingAccountsFixture.billingAccount()
    chargeVersionId = generateUUID()
    companyId = generateUUID()
    licenceId = generateUUID()
  })

  describe('when provided with a populated billing account', () => {
    it('returns the correctly presents the data', () => {
      const result = ViewBillingAccountPresenter(billingAccountData, licenceId, chargeVersionId, companyId)

      expect(result).toEqual({
        address: [
          'Ferns Surfacing Limited',
          'Test Testingson',
          'Tutsham Farm',
          'West Farleigh',
          'Maidstone',
          'Kent',
          'ME15 0NE'
        ],
        backLink: {
          href: `/licences/${licenceId}/charge-information/${chargeVersionId}/view`,
          text: 'Go back to charge information'
        },
        billingAccountId: billingAccountData.billingAccount.id,
        bills: [
          {
            billId: billingAccountData.bills[0].id,
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
        pageTitleCaption: `Billing account ${billingAccountData.billingAccount.accountNumber}`
      })
    })
  })

  describe('the "backLink" property', () => {
    describe('when the licenceId, chargeVersionId and companyId are undefined', () => {
      beforeEach(() => {
        chargeVersionId = undefined
        companyId = undefined
        licenceId = undefined
      })

      it('returns the title "Go back to search" and the link to search page', () => {
        const result = ViewBillingAccountPresenter(billingAccountData, licenceId, chargeVersionId, companyId)

        expect(result.backLink).toEqual({
          href: '/',
          text: 'Go back to search'
        })
      })
    })

    describe('when the licenceId and chargeVersionId are not undefined', () => {
      it('returns the title "Go back to charge information" and the link to the charge information page', () => {
        const result = ViewBillingAccountPresenter(billingAccountData, licenceId, chargeVersionId, companyId)

        expect(result.backLink).toEqual({
          href: `/licences/${licenceId}/charge-information/${chargeVersionId}/view`,
          text: 'Go back to charge information'
        })
      })
    })

    describe('when the chargeVersionId is undefined but the licenceId is populated', () => {
      beforeEach(() => {
        chargeVersionId = undefined
      })

      it('returns the title "Go back to bills" and the link to the licence bills page', () => {
        const result = ViewBillingAccountPresenter(billingAccountData, licenceId, chargeVersionId, companyId)

        expect(result.backLink).toEqual({
          href: `/system/licences/${licenceId}/bills`,
          text: 'Go back to bills'
        })
      })
    })

    describe('when the chargeVersionId and the licenceId are undefined but the companyId is populated', () => {
      beforeEach(() => {
        chargeVersionId = undefined
        licenceId = undefined
      })

      it('returns the title "Go back to customer" and the link to the customer page', () => {
        const result = ViewBillingAccountPresenter(billingAccountData, licenceId, chargeVersionId, companyId)

        expect(result.backLink).toEqual({
          href: `/system/companies/${companyId}/billing-accounts`,
          text: 'Go back to customer'
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
          const result = ViewBillingAccountPresenter(billingAccountData, licenceId, chargeVersionId, companyId)

          expect(result.bills[0].billNumber).toEqual('Test123')
        })
      })

      describe('when the "invoiceNumber" is null', () => {
        it('returns the string "Zero value bill"', () => {
          const result = ViewBillingAccountPresenter(billingAccountData, licenceId, chargeVersionId, companyId)

          expect(result.bills[0].billNumber).toEqual('Zero value bill')
        })
      })
    })

    describe('the "bills.billTotal" property', () => {
      describe('when the "bill.credit" property is true', () => {
        beforeEach(() => {
          billingAccountData.bills[0].credit = true
        })

        it('returns the formatted "bill.netAmount" value followed by the string "Credit"', () => {
          const result = ViewBillingAccountPresenter(billingAccountData, licenceId, chargeVersionId, companyId)

          expect(result.bills[0].billTotal).toEqual('£103.84 Credit')
        })
      })

      describe('when the "bill.credit" property is false', () => {
        it('returns the formatted "bill.netAmount" value', () => {
          const result = ViewBillingAccountPresenter(billingAccountData, licenceId, chargeVersionId, companyId)

          expect(result.bills[0].billTotal).toEqual('£103.84')
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
        const result = ViewBillingAccountPresenter(billingAccountData, licenceId, chargeVersionId, companyId)

        expect(result.lastUpdated).toEqual('14 December 2023')
      })
    })

    describe('when the "lastTransactionFileCreatedAt" is null', () => {
      it('returns null', () => {
        const result = ViewBillingAccountPresenter(billingAccountData, licenceId, chargeVersionId, companyId)

        expect(result.lastUpdated).toBeNull()
      })
    })
  })
})
