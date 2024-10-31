'use strict'

// Test framework dependencies

const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = Code

// Thing under test
const RemoveBillLicencePresenter = require('../../../app/presenters/bill-licences/remove-bill-licence.presenter.js')

describe('Remove Bill Licence presenter', () => {
  let billLicence

  afterEach(() => {
    Sinon.restore()
  })

  describe('when provided with a populated bill licence', () => {
    beforeEach(() => {
      billLicence = _billLicenceSummary()
    })

    it('correctly presents the data', () => {
      const result = RemoveBillLicencePresenter.go(billLicence)

      expect(result).to.equal({
        accountName: 'Example Trading Ltd',
        accountNumber: 'T65757520A',
        billLicenceId: billLicence.id,
        billRunNumber: 10010,
        billRunStatus: 'ready',
        billRunType: 'Supplementary',
        chargeScheme: 'Current',
        dateCreated: '1 November 2023',
        financialYear: '2023 to 2024',
        licenceRef: 'WA/055/0017/013',
        pageTitle: "You're about to remove WA/055/0017/013 from the bill run",
        region: 'Stormlands',
        transactionsTotal: '£288.37'
      })
    })

    describe('the "accountName" property', () => {
      describe('when the billing account is not linked to an agent', () => {
        it('returns the name of the company linked to the billing account', () => {
          const result = RemoveBillLicencePresenter.go(billLicence)

          expect(result.accountName).to.equal('Example Trading Ltd')
        })
      })

      describe('when the billing account is linked to an agent', () => {
        beforeEach(() => {
          billLicence.bill.billingAccount.billingAccountAddresses[0].company = {
            companyId: 'b0d35412-f76c-44ca-9d63-c6350337e03d',
            type: 'person',
            name: 'Alan Broke'
          }
        })

        it('returns the name of the agent company', () => {
          const result = RemoveBillLicencePresenter.go(billLicence)

          expect(result.accountName).to.equal('Alan Broke')
        })
      })
    })

    describe('the "pageTitle" property', () => {
      it('returns the licence reference as part of the title', () => {
        const result = RemoveBillLicencePresenter.go(billLicence)

        expect(result.pageTitle).to.equal("You're about to remove WA/055/0017/013 from the bill run")
      })
    })
  })
})

function _billLicenceSummary () {
  return {
    id: 'a4fbaa27-a91c-4328-a1b8-774ade11027b',
    licenceId: '2eaa831d-7bd6-4b0a-aaf1-3aacafec6bf2',
    licenceRef: 'WA/055/0017/013',
    bill: {
      id: '5a5b313b-e707-490a-a693-799339941e4f',
      accountNumber: 'T65757520A',
      billingAccount: {
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
      },
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
    },
    transactions: [
      {
        id: '5858e36f-5a8e-4f5c-84b3-cbca26624d67',
        credit: false,
        netAmount: 29837
      },
      {
        id: '5858e36f-5a8e-4f5c-84b3-cbca26624d67',
        credit: true,
        netAmount: -1000
      },
      {
        id: '14d6d530-7f07-4e4b-ac17-b8ade9f5b21a',
        credit: false,
        netAmount: 0
      },
      {
        id: '23f43d51-8880-4e30-89da-40231cb8dea2',
        credit: false,
        netAmount: 0
      }
    ]
  }
}
