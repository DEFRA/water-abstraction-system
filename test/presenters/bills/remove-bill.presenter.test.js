'use strict'

// Test framework dependencies

const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = Code

// Test helpers
const BillingAccountModel = require('../../../app/models/billing-account.model.js')

// Thing under test
const RemoveBillPresenter = require('../../../app/presenters/bills/remove-bill.presenter.js')

describe('Remove Bill presenter', () => {
  let bill

  afterEach(() => {
    Sinon.restore()
  })

  describe('when provided with a populated bill', () => {
    beforeEach(() => {
      bill = _billSummary()
    })

    it('correctly presents the data', () => {
      const result = RemoveBillPresenter.go(bill)

      expect(result).to.equal({
        accountName: 'Example Trading Ltd',
        accountNumber: 'T65757520A',
        billId: bill.id,
        billRunNumber: 10010,
        billRunStatus: 'ready',
        billRunType: 'Supplementary',
        chargeScheme: 'Current',
        dateCreated: '1 November 2023',
        financialYear: '2023 to 2024',
        licences: '01/01/26/9400, 01/02/26/9400',
        licencesText: 'Licences',
        pageTitle: "You're about to remove the bill for T65757520A from the bill run",
        region: 'Stormlands',
        supplementaryMessage: 'The licences will go into the next supplementary bill run.',
        total: '£10.45'
      })
    })

    describe('the "accountName" property', () => {
      describe('when the billing account is not linked to an agent', () => {
        it('returns the name of the company linked to the billing account', () => {
          const result = RemoveBillPresenter.go(bill)

          expect(result.accountName).to.equal('Example Trading Ltd')
        })
      })

      describe('when the billing account is linked to an agent', () => {
        beforeEach(() => {
          bill.billingAccount.billingAccountAddresses[0].company = {
            companyId: 'b0d35412-f76c-44ca-9d63-c6350337e03d',
            type: 'person',
            name: 'Alan Broke'
          }
        })

        it('returns the name of the agent company', () => {
          const result = RemoveBillPresenter.go(bill)

          expect(result.accountName).to.equal('Alan Broke')
        })
      })
    })

    describe('the "licences" property', () => {
      describe('when there is more than one licence', () => {
        it('returns them as a comma separated list', () => {
          const result = RemoveBillPresenter.go(bill)

          expect(result.licences).to.equal('01/01/26/9400, 01/02/26/9400')
        })
      })

      describe('when there is only one licence', () => {
        beforeEach(() => {
          bill.billLicences.pop()
        })

        it('returns just the single licence reference', () => {
          const result = RemoveBillPresenter.go(bill)

          expect(result.licences).to.equal('01/01/26/9400')
        })
      })
    })

    describe('the "licencesText" property', () => {
      describe('when there is more than one licence', () => {
        it('returns "Licences" (plural)', () => {
          const result = RemoveBillPresenter.go(bill)

          expect(result.licencesText).to.equal('Licences')
        })
      })

      describe('when there is only one licence', () => {
        beforeEach(() => {
          bill.billLicences.pop()
        })

        it('returns "Licence" (singular)', () => {
          const result = RemoveBillPresenter.go(bill)

          expect(result.licencesText).to.equal('Licence')
        })
      })
    })

    describe('the "pageTitle" property', () => {
      it('returns the account number as part of the title', () => {
        const result = RemoveBillPresenter.go(bill)

        expect(result.pageTitle).to.equal("You're about to remove the bill for T65757520A from the bill run")
      })
    })

    describe('the "supplementaryMessage" property', () => {
      describe('when there is more than one licence', () => {
        it('returns the message with "licences" (plural)', () => {
          const result = RemoveBillPresenter.go(bill)

          expect(result.supplementaryMessage).to.equal('The licences will go into the next supplementary bill run.')
        })
      })

      describe('when there is only one licence', () => {
        beforeEach(() => {
          bill.billLicences.pop()
        })

        it('returns the message with "licence" (singular)', () => {
          const result = RemoveBillPresenter.go(bill)

          expect(result.supplementaryMessage).to.equal('The licence will go into the next supplementary bill run.')
        })
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
