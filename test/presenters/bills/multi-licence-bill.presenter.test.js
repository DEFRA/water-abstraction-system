'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ContactModel = require('../../../app/models/crm-v2/contact.model.js')

// Thing under test
const MultiLicenceBillPresenter = require('../../../app/presenters/bills/multi-licence-bill.presenter.js')

describe('Multi Licence Bill presenter', () => {
  let bill
  let billingAccount
  let licenceSummaries

  describe('when provided with a populated bill run', () => {
    beforeEach(() => {
      bill = _testBill()
      billingAccount = _testBillingAccount()
      licenceSummaries = _testLicenceSummaries()
    })

    it('correctly presents the data', () => {
      const result = MultiLicenceBillPresenter.go(bill, licenceSummaries, billingAccount)

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

    describe("the 'accountName' property", () => {
      describe('when the billing account is not linked to an agent', () => {
        it('returns the name of the company linked to the billing account', () => {
          const result = MultiLicenceBillPresenter.go(bill, licenceSummaries, billingAccount)

          expect(result.accountName).to.equal('Wessex Water Services Ltd')
        })
      })

      describe('when the billing account is linked to an agent', () => {
        beforeEach(() => {
          billingAccount.invoiceAccountAddresses[0].agentCompany = {
            companyId: 'b0d35412-f76c-44ca-9d63-c6350337e03d',
            type: 'person',
            name: 'Alan Broke'
          }
        })

        it('returns the name of the agent company', () => {
          const result = MultiLicenceBillPresenter.go(bill, licenceSummaries, billingAccount)

          expect(result.accountName).to.equal('Alan Broke')
        })
      })
    })

    describe("the 'addressLines' property", () => {
      describe('when the billing account address contains blank elements', () => {
        it('returns an array of only the set elements', () => {
          const result = MultiLicenceBillPresenter.go(bill, licenceSummaries, billingAccount)

          expect(result.addressLines).to.equal(['86 Oxford Road', 'WOOTTON', 'COURTENAY', 'TA24 8NX'])
        })
      })
    })

    describe("the 'billRunType' property", () => {
      describe('when the bill run is annual', () => {
        it('returns Annual', () => {
          const result = MultiLicenceBillPresenter.go(bill, licenceSummaries, billingAccount)

          expect(result.billRunType).to.equal('Annual')
        })
      })

      describe('when the bill run is supplementary', () => {
        beforeEach(() => {
          bill.billRun.batchType = 'supplementary'
        })

        it('returns Supplementary', () => {
          const result = MultiLicenceBillPresenter.go(bill, licenceSummaries, billingAccount)

          expect(result.billRunType).to.equal('Supplementary')
        })
      })

      describe('when the bill run is two_part_tariff', () => {
        beforeEach(() => {
          bill.billRun.batchType = 'two_part_tariff'
        })

        describe('and the scheme is sroc', () => {
          it('returns Supplementary', () => {
            const result = MultiLicenceBillPresenter.go(bill, licenceSummaries, billingAccount)

            expect(result.billRunType).to.equal('Two-part tariff')
          })
        })

        describe('and the scheme is alcs', () => {
          beforeEach(() => {
            bill.billRun.scheme = 'alcs'
          })

          describe('and it is not summer only', () => {
            it('returns Supplementary', () => {
              const result = MultiLicenceBillPresenter.go(bill, licenceSummaries, billingAccount)

              expect(result.billRunType).to.equal('Two-part tariff winter and all year')
            })
          })

          describe('and it is for summer only', () => {
            beforeEach(() => {
              bill.billRun.isSummer = true
            })

            it('returns Supplementary', () => {
              const result = MultiLicenceBillPresenter.go(bill, licenceSummaries, billingAccount)

              expect(result.billRunType).to.equal('Two-part tariff summer')
            })
          })
        })
      })
    })

    describe("the 'chargeScheme' property", () => {
      describe('when the bill run is sroc', () => {
        it('returns Current', () => {
          const result = MultiLicenceBillPresenter.go(bill, licenceSummaries, billingAccount)

          expect(result.chargeScheme).to.equal('Current')
        })
      })

      describe('when the bill run is alcs', () => {
        beforeEach(() => {
          bill.billRun.scheme = 'alcs'
        })

        it('returns Old', () => {
          const result = MultiLicenceBillPresenter.go(bill, licenceSummaries, billingAccount)

          expect(result.chargeScheme).to.equal('Old')
        })
      })
    })

    describe("the 'contactName' property", () => {
      describe('when the billing account is linked not linked to a contact', () => {
        it('returns null', () => {
          const result = MultiLicenceBillPresenter.go(bill, licenceSummaries, billingAccount)

          expect(result.contactName).to.be.null()
        })
      })

      // NOTE: The actual formulation of the contact name happens in ContactModel.$name(). We are interested in if set
      // we contactName is populated which the view will use to determine if an FAO should be shown with the address
      describe('where the billing account is linked to a contact (FAO)', () => {
        beforeEach(() => {
          billingAccount.invoiceAccountAddresses[0].contact = ContactModel.fromJson({
            contactId: '2b00981d-9388-4f0d-8271-8e216b66c971',
            contactType: 'person',
            dataSource: 'wrls',
            department: 'Humanoid Risk Assessment',
            firstName: 'Margherita',
            initials: '',
            lastName: 'Villar',
            middleInitials: 'J',
            salutation: 'Mrs',
            suffix: 'MBE'
          })
        })

        it('returns the properly formatted contact name', () => {
          const result = MultiLicenceBillPresenter.go(bill, licenceSummaries, billingAccount)

          expect(result.contactName).to.equal('Mrs M J Villar MBE')
        })
      })
    })

    describe("the 'displayCreditDebitTotals' property", () => {
      describe('when the bill run is not supplementary', () => {
        it('returns false', () => {
          const result = MultiLicenceBillPresenter.go(bill, licenceSummaries, billingAccount)

          expect(result.displayCreditDebitTotals).to.be.false()
        })
      })

      describe('when the bill run is supplementary', () => {
        describe('and was created in WRLS', () => {
          beforeEach(() => {
            bill.billRun.batchType = 'supplementary'
          })

          it('returns true', () => {
            const result = MultiLicenceBillPresenter.go(bill, licenceSummaries, billingAccount)

            expect(result.displayCreditDebitTotals).to.be.true()
          })
        })

        describe('but was created in NALD', () => {
          beforeEach(() => {
            bill.billRun.batchType = 'supplementary'
            bill.billRun.source = 'nald'
          })

          it('returns false', () => {
            const result = MultiLicenceBillPresenter.go(bill, licenceSummaries, billingAccount)

            expect(result.displayCreditDebitTotals).to.be.false()
          })
        })
      })
    })

    describe("the 'financialYear' property", () => {
      it('returns the bill run start and end financial year', () => {
        const result = MultiLicenceBillPresenter.go(bill, licenceSummaries, billingAccount)

        expect(result.financialYear).to.equal('2022 to 2023')
      })
    })

    describe("the 'region' property", () => {
      it("returns the bill run's region display name capitalized", () => {
        const result = MultiLicenceBillPresenter.go(bill, licenceSummaries, billingAccount)

        expect(result.region).to.equal('South West')
      })
    })

    describe("the 'tableCaption' property", () => {
      describe('when there is only 1 licence summary', () => {
        let singularLicenceSummary

        beforeEach(() => {
          singularLicenceSummary = [licenceSummaries[0]]
        })

        it('returns the count and caption singular', () => {
          const result = MultiLicenceBillPresenter.go(bill, singularLicenceSummary, billingAccount)

          expect(result.tableCaption).to.equal('1 licence')
        })
      })

      describe('when there are multiple licence summaries', () => {
        it('returns the count and caption pluralised', () => {
          const result = MultiLicenceBillPresenter.go(bill, licenceSummaries, billingAccount)

          expect(result.tableCaption).to.equal('3 licences')
        })
      })
    })

    describe("the 'total' property", () => {
      describe('when the bill is a debit', () => {
        it('returns just the bill total formatted as money', () => {
          const result = MultiLicenceBillPresenter.go(bill, licenceSummaries, billingAccount)

          expect(result.total).to.equal('£213,178.00')
        })
      })

      describe('when the bill is a credit', () => {
        beforeEach(() => {
          bill.isCredit = true
        })

        it("returns the bill total formatted as money plus 'credit' as a suffix", () => {
          const result = MultiLicenceBillPresenter.go(bill, licenceSummaries, billingAccount)

          expect(result.total).to.equal('£213,178.00 credit')
        })
      })
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
