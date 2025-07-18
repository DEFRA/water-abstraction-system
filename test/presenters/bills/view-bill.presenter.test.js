'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillingAccountModel = require('../../../app/models/billing-account.model.js')

// Things we need to stub
const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')

// Thing under test
const ViewBillPresenter = require('../../../app/presenters/bills/view-bill.presenter.js')

describe('View Bill presenter', () => {
  let bill
  let billingAccount

  describe('when provided with a populated bill run', () => {
    beforeEach(() => {
      bill = _testBill()
      billingAccount = _testBillingAccount()
      Sinon.stub(FeatureFlagsConfig, 'enableBillingAccountView').value(true)
    })

    afterEach(() => {
      Sinon.restore()
    })

    it('correctly presents the data', () => {
      const result = ViewBillPresenter.go(bill, billingAccount)

      expect(result).to.equal({
        accountName: 'Wessex Water Services Ltd',
        accountNumber: 'E88888888A',
        addressLines: ['86 Oxford Road', 'WOOTTON', 'COURTENAY', 'TA24 8NX'],
        billId: '64924759-8142-4a08-9d1e-1e902cd9d316',
        billingAccountId: 'ee3f5562-26ad-4d58-9b59-5c388a13d7d0',
        billingAccountLink: '/system/billing-accounts/ee3f5562-26ad-4d58-9b59-5c388a13d7d0',
        billNumber: 'EAI0000007T',
        billRunId: '2c80bd22-a005-4cf4-a2a2-73812a9861de',
        billRunNumber: 10003,
        billRunStatus: 'sent',
        billRunType: 'Annual',
        billTotal: '£213,178.00',
        chargeScheme: 'Current',
        contactName: null,
        credit: false,
        creditsTotal: '£0.00',
        dateCreated: '7 March 2023',
        debitsTotal: '£213,178.00',
        deminimis: false,
        displayCreditDebitTotals: false,
        financialYear: '2022 to 2023',
        flaggedForReissue: false,
        pageTitle: 'Bill for Wessex Water Services Ltd',
        region: 'South West',
        transactionFile: 'nalei50002t'
      })
    })

    describe('the "billingAccountLink" property', () => {
      describe('when enableBillingAccountView is false', () => {
        beforeEach(() => {
          Sinon.stub(FeatureFlagsConfig, 'enableBillingAccountView').value(false)
        })

        it('returns the link to the legacy billing account page', () => {
          const result = ViewBillPresenter.go(bill, billingAccount)

          expect(result.billingAccountLink).to.equal('/billing-accounts/ee3f5562-26ad-4d58-9b59-5c388a13d7d0')
        })
      })

      describe('when enableBillingAccountView is true', () => {
        it('returns the link to the legacy billing account page', () => {
          const result = ViewBillPresenter.go(bill, billingAccount)

          expect(result.billingAccountLink).to.equal('/system/billing-accounts/ee3f5562-26ad-4d58-9b59-5c388a13d7d0')
        })
      })
    })

    describe('the "billTotal" property', () => {
      describe('when the bill is a debit', () => {
        it('returns just the bill total formatted as money', () => {
          const result = ViewBillPresenter.go(bill, billingAccount)

          expect(result.billTotal).to.equal('£213,178.00')
        })
      })

      describe('when the bill is a credit', () => {
        beforeEach(() => {
          bill.credit = true
        })

        it('returns the bill total formatted as money plus "credit" as a suffix', () => {
          const result = ViewBillPresenter.go(bill, billingAccount)

          expect(result.billTotal).to.equal('£213,178.00 credit')
        })
      })
    })

    describe('the "creditsTotal" property', () => {
      describe('when the bill run was created in WRLS', () => {
        it('returns the "creditNoteValue" of the bill (£0.00)', () => {
          const result = ViewBillPresenter.go(bill, billingAccount)

          expect(result.creditsTotal).to.equal('£0.00')
        })
      })

      describe('when the bill run was created in NALD', () => {
        beforeEach(() => {
          bill.billRun.source = 'nald'
        })

        describe('and "netAmount" on the bill is 21317800', () => {
          it('returns £0.00', () => {
            const result = ViewBillPresenter.go(bill, billingAccount)

            expect(result.creditsTotal).to.equal('£0.00')
          })
        })

        describe('and "netAmount" on the bill is -21317800', () => {
          beforeEach(() => {
            bill.netAmount = -21317800
          })

          it('returns £213,178.00', () => {
            const result = ViewBillPresenter.go(bill, billingAccount)

            expect(result.creditsTotal).to.equal('£213,178.00')
          })
        })

        describe('and "netAmount" on the bill is 0', () => {
          beforeEach(() => {
            bill.netAmount = 0
          })

          it('returns £0.00', () => {
            const result = ViewBillPresenter.go(bill, billingAccount)

            expect(result.creditsTotal).to.equal('£0.00')
          })
        })
      })
    })

    describe('the "debitsTotal" property', () => {
      describe('when the bill run was created in WRLS', () => {
        it('returns the "invoiceValue" of the bill (£213,178.00)', () => {
          const result = ViewBillPresenter.go(bill, billingAccount)

          expect(result.debitsTotal).to.equal('£213,178.00')
        })
      })

      describe('when the bill run was created in NALD', () => {
        beforeEach(() => {
          bill.billRun.source = 'nald'
        })

        describe('and "netAmount" on the bill is 21317800', () => {
          it('returns £213,178.00', () => {
            const result = ViewBillPresenter.go(bill, billingAccount)

            expect(result.debitsTotal).to.equal('£213,178.00')
          })
        })

        describe('and "netAmount" on the bill is -21317800', () => {
          beforeEach(() => {
            bill.netAmount = -21317800
          })

          it('returns £0.00', () => {
            const result = ViewBillPresenter.go(bill, billingAccount)

            expect(result.debitsTotal).to.equal('£0.00')
          })
        })

        describe('and "netAmount" on the bill is 0', () => {
          beforeEach(() => {
            bill.netAmount = 0
          })

          it('returns £0.00', () => {
            const result = ViewBillPresenter.go(bill, billingAccount)

            expect(result.debitsTotal).to.equal('£0.00')
          })
        })
      })
    })
  })
})

function _testBill() {
  return {
    id: '64924759-8142-4a08-9d1e-1e902cd9d316',
    creditNoteValue: 0,
    financialYearEnding: 2023,
    billingAccountId: 'ee3f5562-26ad-4d58-9b59-5c388a13d7d0',
    invoiceNumber: 'EAI0000007T',
    invoiceValue: 21317800,
    credit: false,
    flaggedForRebilling: false,
    netAmount: 21317800,
    rebillingState: null,
    deminimis: false,
    createdAt: new Date('2023-03-07'),
    billRun: {
      id: '2c80bd22-a005-4cf4-a2a2-73812a9861de',
      batchType: 'annual',
      status: 'sent',
      billRunNumber: 10003,
      transactionFileReference: 'nalei50002t',
      scheme: 'sroc',
      summer: false,
      source: 'wrls',
      createdAt: new Date('2023-03-07'),
      region: {
        id: 'adca5dd3-114d-4477-8cdd-684081429f4b',
        displayName: 'South West'
      }
    }
  }
}

function _testBillingAccount() {
  const data = {
    id: 'ee3f5562-26ad-4d58-9b59-5c388a13d7d0',
    accountNumber: 'E88888888A',
    company: {
      type: 'organisation',
      name: 'Wessex Water Services Ltd'
    },
    billingAccountAddresses: [
      {
        id: 'b0e53215-b73a-4570-992b-2a724944ea19',
        billingAccountId: 'ee3f5562-26ad-4d58-9b59-5c388a13d7d0',
        addressId: 'f3360183-8002-4802-a6d4-80d7e7160a50',
        startDate: new Date('1999-10-01'),
        endDate: null,
        companyId: null,
        contactId: null,
        createdAt: new Date('2022-06-15'),
        updatedAt: new Date('2023-10-17'),
        company: null,
        contact: null,
        address: {
          id: 'f3360183-8002-4802-a6d4-80d7e7160a50',
          address1: '86 Oxford Road',
          address2: 'WOOTTON',
          address3: null,
          address4: null,
          address5: 'COURTENAY',
          address6: null,
          postcode: 'TA24 8NX',
          country: null
        }
      }
    ]
  }

  return BillingAccountModel.fromJson(data)
}
