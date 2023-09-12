'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const MockBillRunPresenter = require('../../../app/presenters//data/mock-bill-run.presenter.js')

describe('Mock Bill Run presenter', () => {
  describe('when provided with a mocked bill run', () => {
    it('correctly presents the bill run', () => {
      const result = MockBillRunPresenter.go(mockedBillRun)

      expect(result.dateCreated).to.equal('9 August 2023')
      expect(result.status).to.equal('sent')
      expect(result.region).to.equal('Thames')
      expect(result.type).to.equal('supplementary')
      expect(result.chargeScheme).to.equal('Current')
      expect(result.transactionFile).to.equal('nalti50013t')
      expect(result.billRunNumber).to.equal(10029)
      expect(result.financialYear).to.equal('2023 to 2024')
      expect(result.debit).to.equal('840.00')
    })

    it('correctly presents a billing invoice', () => {
      const { bills: results } = MockBillRunPresenter.go(mockedBillRun)

      expect(results[0].id).to.equal('86e5841a-81a9-4207-97ce-cee0917c0975')
      expect(results[0].account).to.equal('Z11895994A')
      expect(results[0].number).to.equal('ZZI0000013T')
      expect(results[0].accountAddress).to.be.an.array()
      expect(results[0].accountAddress[0]).to.be.a.string()
      expect(results[0].contact).to.be.a.string()
      expect(results[0].isWaterCompany).to.be.false()
      expect(results[0].credit).to.equal('0.00')
      expect(results[0].debit).to.equal('840.00')
      expect(results[0].netTotal).to.equal('840.00')
    })

    it('correctly presents a bill licence', () => {
      const { licences: results } = MockBillRunPresenter.go(mockedBillRun).bills[0]

      expect(results[0].id).to.equal('bedd5971-4491-4c6f-a8cd-b75592ab4328')
      expect(results[0].licence).to.equal('TH/037/0051/002')
      expect(results[0].licenceHolder).to.be.a.string()
      expect(results[0].credit).to.equal('0.00')
      expect(results[0].debit).to.equal('840.00')
      expect(results[0].netTotal).to.equal('840.00')
    })

    it('correctly presents a billing transaction', () => {
      const { transactions: results } = MockBillRunPresenter.go(mockedBillRun).bills[0].licences[0]

      expect(results[0].type).to.equal('Water abstraction charge')
      expect(results[0].lineDescription).to.equal('Water abstraction charge: Chris data thingy')
      expect(results[0].billableDays).to.equal(151)
      expect(results[0].authorisedDays).to.equal(151)
      expect(results[0].chargeQuantity).to.equal(100)
      expect(results[0].credit).to.equal('0.00')
      expect(results[0].debit).to.equal('840.00')
      expect(results[0].chargePeriod).to.equal('1 April 2022 to 31 March 2023')
      expect(results[0].chargeRefNumber).to.equal('4.5.13 (£1162.00)')
      expect(results[0].chargeDescription).to.equal('Medium loss, non-tidal, greater than 83 up to and including 142 ML/yr')
      expect(results[0].addCharges).to.equal(['Supported source Thames (£518.00)'])
      expect(results[0].adjustments).to.equal(['Winter discount (0.5)'])
    })

    it('correctly presents a charge purpose', () => {
      const { elements: results } = MockBillRunPresenter.go(mockedBillRun).bills[0].licences[0].transactions[0]

      expect(results[0].id).to.equal('30c31312-59ef-4818-8e78-20ac115c39f7')
      expect(results[0].purpose).to.equal('Make-Up Or Top Up Water')
      expect(results[0].abstractionPeriod).to.equal('1 November to 31 March')
      expect(results[0].authorisedQuantity).to.equal(10.22)
    })
  })
})

const mockedBillRun = {
  billingBatchId: '6e9eb9f6-cf4d-40ea-929c-e8a915d84ef5',
  batchType: 'supplementary',
  billRunNumber: 10029,
  fromFinancialYearEnding: 2023,
  netTotal: 84000,
  scheme: 'sroc',
  status: 'sent',
  toFinancialYearEnding: 2024,
  transactionFileReference: 'nalti50013t',
  createdAt: new Date(2023, 7, 9, 15, 2, 24, 783),
  region: {
    name: 'Thames'
  },
  bills: [
    {
      billingInvoiceId: '86e5841a-81a9-4207-97ce-cee0917c0975',
      creditNoteValue: 0,
      invoiceAccountNumber: 'Z11895994A',
      invoiceNumber: 'ZZI0000013T',
      invoiceValue: 84000,
      netAmount: 84000,
      billLicences: [
        {
          billingInvoiceLicenceId: 'bedd5971-4491-4c6f-a8cd-b75592ab4328',
          licenceRef: 'TH/037/0051/002',
          licence: {
            isWaterUndertaker: false
          },
          transactions: [
            {
              authorisedDays: 151,
              billableDays: 151,
              billableQuantity: 100,
              chargeCategoryCode: '4.5.13',
              chargeCategoryDescription: 'Medium loss, non-tidal, greater than 83 up to and including 142 ML/yr',
              chargeType: 'standard',
              description: 'Water abstraction charge: Chris data thingy',
              endDate: new Date(2023, 2, 31, 2),
              grossValuesCalculated: {
                baselineCharge: 1162,
                supportedSourceCharge: 518
              },
              isCredit: false,
              netAmount: 84000,
              startDate: new Date(2022, 3, 1, 2),
              supportedSourceName: 'Thames',
              chargeElement: {
                adjustments: {
                  s126: null,
                  s127: false,
                  s130: false,
                  charge: null,
                  winter: true,
                  aggregate: null
                },
                chargePurposes: [
                  {
                    chargePurposeId: '30c31312-59ef-4818-8e78-20ac115c39f7',
                    abstractionPeriodStartDay: 1,
                    abstractionPeriodStartMonth: 11,
                    abstractionPeriodEndDay: 31,
                    abstractionPeriodEndMonth: 3,
                    authorisedAnnualQuantity: 10.22,
                    purposesUse: {
                      description: 'Make-Up Or Top Up Water'
                    }
                  }
                ]
              }
            },
            {
              authorisedDays: 151,
              billableDays: 151,
              billableQuantity: 100,
              chargeCategoryCode: '4.5.13',
              chargeCategoryDescription: 'Medium loss, non-tidal, greater than 83 up to and including 142 ML/yr',
              chargeType: 'compensation',
              description: 'Compensation charge: calculated from the charge reference, activity description and regional environmental improvement charge; excludes any supported source additional charge and two-part tariff charge agreement',
              endDate: new Date(2023, 2, 31, 2),
              grossValuesCalculated: {
                baselineCharge: 1162,
                supportedSourceCharge: 0
              },
              isCredit: false,
              netAmount: 0,
              startDate: new Date(2022, 3, 1, 2),
              supportedSourceName: 'Thames',
              chargeElement: {
                adjustments: {
                  s126: null,
                  s127: false,
                  s130: false,
                  charge: null,
                  winter: true,
                  aggregate: null
                },
                chargePurposes: [
                  {
                    chargePurposeId: '30c31312-59ef-4818-8e78-20ac115c39f7',
                    abstractionPeriodStartDay: 1,
                    abstractionPeriodStartMonth: 11,
                    abstractionPeriodEndDay: 31,
                    abstractionPeriodEndMonth: 3,
                    authorisedAnnualQuantity: 10.22,
                    purposesUse: {
                      description: 'Make-Up Or Top Up Water'
                    }
                  }
                ]
              }
            }
          ],
          licenceHolder: 'Stuart Barrett',
          credit: 0,
          debit: 84000,
          netTotal: 84000
        }
      ],
      accountAddress: [
        '2 Fake Street',
        'Fakechester',
        'XM53 3UX'
      ],
      contact: 'Rebecca Adair'
    }
  ]
}
