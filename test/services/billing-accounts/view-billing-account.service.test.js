'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const FetchViewBillingAccountService = require('../../../app/services/billing-accounts/fetch-view-billing-account.service.js')

// Thing under test
const ViewBillingAccountService = require('../../../app/services/billing-accounts/view-billing-account.service.js')

describe('View Billing Account service', () => {
  beforeEach(() => {
    Sinon.stub(FetchViewBillingAccountService, 'go').returns(_testFetchBillingAccount())
  })

  describe('when a billing account with a matching ID exists', () => {
    it('correctly presents the data', async () => {
      const result = await ViewBillingAccountService.go('64d7fc10-f046-4444-ba32-bb917dd8cde6', 1)

      expect(result).to.equal({
        activeNavBar: 'search',
        accountNumber: 'T53153094A',
        address: ['Example Trading Ltd', 'Environment Agency', 'Horizon House', 'Deanery Road', 'Bristol', 'BS1 5AH'],
        billingAccountId: '64d7fc10-f046-4444-ba32-bb917dd8cde6',
        bills: [
          {
            billId: '94bfb1dd-20df-4415-99c3-7dce17520c2e',
            billNumber: 'Zero value bill',
            billRunNumber: null,
            billRunType: 'Supplementary',
            billTotal: '£0.00',
            dateCreated: '7 May 2025',
            financialYear: null
          }
        ],
        createdDate: '7 May 2025',
        customerFile: null,
        lastUpdated: null,
        licenceId: 'd1cec4c1-3c81-4f5e-8268-d354c8a324ee',
        pageTitle: 'Billing account for Example Trading Ltd',
        pagination: { numberOfPages: 1 }
      })
    })
  })
})

function _testFetchBillingAccount() {
  return {
    billingAccount: {
      id: '64d7fc10-f046-4444-ba32-bb917dd8cde6',
      accountNumber: 'T53153094A',
      createdAt: new Date('2025-05-07T12:15:21.950Z'),
      lastTransactionFile: null,
      lastTransactionFileCreatedAt: null,
      billingAccountAddresses: [
        {
          id: 'bfea53ba-f7f4-46c4-953f-048696f4bf4f',
          address: {
            id: '574aa765-916b-475b-ba63-fe08faf1aa16',
            address1: 'ENVIRONMENT AGENCY',
            address2: 'HORIZON HOUSE',
            address3: 'DEANERY ROAD',
            address4: 'BRISTOL',
            address5: null,
            address6: null,
            postcode: 'BS1 5AH'
          }
        }
      ],
      company: {
        id: '0fcaaeb0-851e-4ac3-9530-9930563b7660',
        name: 'Example Trading Ltd'
      }
    },
    bills: [
      {
        id: '94bfb1dd-20df-4415-99c3-7dce17520c2e',
        createdAt: new Date('2025-05-07T12:15:21.950Z'),
        credit: null,
        invoiceNumber: null,
        netAmount: null,
        financialYear: null,
        billRun: {
          id: '1577fe1a-7f5f-4bb1-a39e-d18c4bb8ac60',
          batchType: 'supplementary',
          billRunNumber: null,
          scheme: 'sroc',
          source: 'wrls',
          summer: false
        }
      }
    ],
    licenceId: 'd1cec4c1-3c81-4f5e-8268-d354c8a324ee',
    pagination: { total: 1 }
  }
}
