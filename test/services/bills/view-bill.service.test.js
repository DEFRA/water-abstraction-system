'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers

// Things we need to stub
const FetchBillService = require('../../../app/services/bills/fetch-bill-service.js')
const FetchBillingAccountService = require('../../../app/services/bills/fetch-billing-account.service.js')

// Thing under test
const ViewBillService = require('../../../app/services/bills/view-bill.service.js')

describe('View Bill service', () => {
  const testId = '64924759-8142-4a08-9d1e-1e902cd9d316'

  afterEach(() => {
    Sinon.restore()
  })

  describe('when a bill with a matching ID exists', () => {
    beforeEach(() => {
      Sinon.stub(FetchBillService, 'go').resolves(
        {
          bill: _testBill(),
          licenceSummaries: _testLicenceSummaries()
        }
      )

      Sinon.stub(FetchBillingAccountService, 'go').resolves(_testBillingAccount())
    })

    it('returns the data formatted for use in the view', async () => {
      const result = await ViewBillService.go(testId)

      expect(result).to.equal({
        accountName: 'Wessex Water Services Ltd',
        accountNumber: 'E88888888A',
        addressLines: ['86 Oxford Road', 'WOOTTON', 'COURTENAY', 'TA24 8NX'],
        billId: '64924759-8142-4a08-9d1e-1e902cd9d316',
        billingAccountId: 'ee3f5562-26ad-4d58-9b59-5c388a13d7d0',
        billLicences: [
          {
            id: 'e37320ba-10c8-4954-8bc4-6982e56ded41',
            reference: '01/735',
            total: '£6,222.18'
          },
          {
            id: '127377ea-24ea-4578-8b96-ef9a8625a313',
            reference: '01/466',
            total: '£7,066.55'
          },
          {
            id: 'af709c49-54ac-4a4f-a167-8b152c9f44fb',
            reference: '01/638',
            total: '£8,239.07'
          }
        ],
        billNumber: 'EAI0000007T',
        billRunId: '2c80bd22-a005-4cf4-a2a2-73812a9861de',
        billRunNumber: 10003,
        billRunStatus: 'sent',
        billRunType: 'Annual',
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
        region: 'South West',
        tableCaption: '3 licences',
        total: '£213,178.00',
        transactionFile: 'nalei50002t'
      })
    })
  })

  describe('when a bill with a matching ID does not exist', () => {
    beforeEach(() => {
      Sinon.stub(FetchBillService, 'go').resolves(
        {
          bill: undefined,
          licenceSummaries: []
        }
      )

      Sinon.stub(FetchBillingAccountService, 'go').resolves(undefined)
    })

    it('throws an exception', async () => {
      await expect(ViewBillService.go('testId'))
        .to
        .reject()
    })
  })
})

function _testBill () {
  return {
    billingInvoiceId: '64924759-8142-4a08-9d1e-1e902cd9d316',
    creditNoteValue: 0,
    invoiceAccountId: 'ee3f5562-26ad-4d58-9b59-5c388a13d7d0',
    invoiceNumber: 'EAI0000007T',
    invoiceValue: 21317800,
    isCredit: false,
    isFlaggedForRebilling: false,
    netAmount: 21317800,
    rebillingState: null,
    isDeMinimis: false,
    createdAt: new Date('2023-03-07'),
    billRun: {
      billingBatchId: '2c80bd22-a005-4cf4-a2a2-73812a9861de',
      batchType: 'annual',
      fromFinancialYearEnding: 2022,
      toFinancialYearEnding: 2023,
      status: 'sent',
      billRunNumber: 10003,
      transactionFileReference: 'nalei50002t',
      scheme: 'sroc',
      isSummer: false,
      source: 'wrls',
      createdAt: new Date('2023-03-07'),
      region: {
        regionId: 'adca5dd3-114d-4477-8cdd-684081429f4b',
        displayName: 'South West'
      }
    }
  }
}

function _testLicenceSummaries () {
  return [
    {
      billingInvoiceLicenceId: 'e37320ba-10c8-4954-8bc4-6982e56ded41',
      licenceRef: '01/735',
      total: 622218
    },
    {
      billingInvoiceLicenceId: '127377ea-24ea-4578-8b96-ef9a8625a313',
      licenceRef: '01/466',
      total: 706655
    },
    {
      billingInvoiceLicenceId: 'af709c49-54ac-4a4f-a167-8b152c9f44fb',
      licenceRef: '01/638',
      total: 823907
    }
  ]
}

function _testBillingAccount () {
  return {
    invoiceAccountId: 'ee3f5562-26ad-4d58-9b59-5c388a13d7d0',
    invoiceAccountNumber: 'E88888888A',
    company: {
      type: 'organisation',
      name: 'Wessex Water Services Ltd'
    },
    invoiceAccountAddresses: [
      {
        invoiceAccountAddressId: 'b0e53215-b73a-4570-992b-2a724944ea19',
        invoiceAccountId: 'ee3f5562-26ad-4d58-9b59-5c388a13d7d0',
        addressId: 'f3360183-8002-4802-a6d4-80d7e7160a50',
        startDate: new Date('1999-10-01'),
        endDate: null,
        isTest: false,
        agentCompanyId: null,
        contactId: null,
        createdAt: new Date('2022-06-15'),
        updatedAt: new Date('2023-10-17'),
        agentCompany: null,
        contact: null,
        address: {
          addressId: 'f3360183-8002-4802-a6d4-80d7e7160a50',
          address1: '86 Oxford Road',
          address2: 'WOOTTON',
          address3: null,
          address4: null,
          town: 'COURTENAY',
          county: null,
          postcode: 'TA24 8NX',
          country: null
        }
      }
    ]
  }
}
