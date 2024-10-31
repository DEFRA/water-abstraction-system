'use strict'

// Test framework dependencies

const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = Code

// Test helpers
const BillingAccountModel = require('../../../app/models/billing-account.model.js')

// Things we need to stub
const FetchBillSummaryService = require('../../../app/services/bills/fetch-bill-summary.service.js')

// Thing under test
const RemoveBillService = require('../../../app/services/bills/remove-bill.service.js')

describe('Remove Bill service', () => {
  const testId = '71d03336-f683-42fe-b67c-c861f25f1fbd'

  beforeEach(() => {
    Sinon.stub(FetchBillSummaryService, 'go').resolves(_billSummary())
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await RemoveBillService.go(testId)

      expect(result).to.equal({
        accountName: 'Example Trading Ltd',
        accountNumber: 'T65757520A',
        billId: testId,
        billRunNumber: 10010,
        billRunStatus: 'ready',
        billRunType: 'Supplementary',
        chargeScheme: 'Current',
        dateCreated: '1 November 2023',
        financialYear: '2023 to 2024',
        licences: '01/01/26/9400, 01/02/26/9400',
        licencesText: 'Licences',
        pageTitle: "You're about to remove the bill for T65757520A from the bill run",
        supplementaryMessage: 'The licences will go into the next supplementary bill run.',
        region: 'Stormlands',
        total: '£10.45'
      })
    })
  })
})

function _billSummary () {
  const billingAccount = BillingAccountModel.fromJson({
    id: 'e2b35a4a-7368-425f-9990-faa23efc0a25',
    accountNumber: 'T65757520A',
    company: {
      id: '3b60ddd0-654f-4012-a349-000aab3e49c3',
      name: 'Example Trading Ltd',
      type: 'organisation'
    },
    billingAccountAddresses: [{
      id: '1d440029-745a-47ec-a43e-9f4a36014126',
      company: null,
      contact: {
        id: '95ba53be-543f-415b-90b1-08f58f63ff74',
        contactType: 'person',
        dataSource: 'wrls',
        department: null,
        firstName: 'Amara',
        initials: null,
        lastName: 'Gupta',
        middleInitials: null,
        salutation: null,
        suffix: null
      }
    }]
  })

  return {
    id: '71d03336-f683-42fe-b67c-c861f25f1fbd',
    netAmount: 1045,
    billingAccount,
    billLicences: [
      {
        id: '9304f6b8-0664-4fec-98e1-8fd16144315c',
        licenceRef: '01/01/26/9400'
      },
      {
        id: 'b390d178-3a39-4c27-81ba-c2a3ce442a8d',
        licenceRef: '01/02/26/9400'
      }
    ],
    billRun: {
      id: '0e61c36f-f22f-4534-8247-b73a97f551b5',
      batchType: 'supplementary',
      billRunNumber: 10010,
      createdAt: new Date('2023-11-01'),
      scheme: 'sroc',
      source: 'wrls',
      status: 'ready',
      toFinancialYearEnding: 2024,
      region: {
        id: '4ad8ce03-48a8-447e-bce2-3c317d0aeaf6',
        displayName: 'Stormlands'
      }
    }
  }
}
