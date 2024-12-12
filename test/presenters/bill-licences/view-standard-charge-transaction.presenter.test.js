'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ViewStandardChargeTransactionPresenter = require('../../../app/presenters/bill-licences/view-standard-charge-transaction.presenter.js')

describe('View Standard Charge Transaction presenter', () => {
  let transaction

  describe('when provided with an SROC standard charge transaction', () => {
    beforeEach(() => {
      transaction = _srocTransaction()
    })

    describe('that is a credit', () => {
      beforeEach(() => {
        transaction.credit = true
      })

      it('returns the credit and debit properties correctly', () => {
        const result = ViewStandardChargeTransactionPresenter.go(transaction)

        expect(result.creditAmount).to.equal('£1,162.00')
        expect(result.debitAmount).to.equal('')
      })
    })

    describe('that is a debit', () => {
      beforeEach(() => {
        transaction.credit = false
      })

      it('returns the credit and debit properties correctly', () => {
        const result = ViewStandardChargeTransactionPresenter.go(transaction)

        expect(result.creditAmount).to.equal('')
        expect(result.debitAmount).to.equal('£1,162.00')
      })
    })

    describe('"additionalCharges" property', () => {
      describe('when supported source is set', () => {
        beforeEach(() => {
          transaction.supportedSourceName = 'Candover'
          transaction.supportedSourceChargeValue = '14567'
        })

        it('returns "Supported source Candover (£14567.00)"', () => {
          const result = ViewStandardChargeTransactionPresenter.go(transaction)

          expect(result.additionalCharges).to.equal('Supported source Candover (£14567.00)')
        })
      })

      describe('when is a water company charge is true', () => {
        beforeEach(() => {
          transaction.waterCompanyCharge = true
          transaction.waterCompanyChargeValue = '2498'
        })

        it('returns "Public Water Supply (£2498.00)"', () => {
          const result = ViewStandardChargeTransactionPresenter.go(transaction)

          expect(result.additionalCharges).to.equal('Public Water Supply (£2498.00)')
        })
      })

      describe('when both supported source and is a water company charge are set', () => {
        beforeEach(() => {
          transaction.supportedSourceName = 'Candover'
          transaction.supportedSourceChargeValue = '14567'
          transaction.waterCompanyCharge = true
          transaction.waterCompanyChargeValue = '2498'
        })

        it('returns "Supported source Candover (£14567.00), Public Water Supply (£2498.00)"', () => {
          const result = ViewStandardChargeTransactionPresenter.go(transaction)

          expect(result.additionalCharges).to.equal(
            'Supported source Candover (£14567.00), Public Water Supply (£2498.00)'
          )
        })
      })
    })

    describe('"adjustments" property', () => {
      describe('when the aggregate factor is not 1', () => {
        beforeEach(() => {
          transaction.aggregateFactor = 0.75
        })

        it('returns "Aggregate factor (0.75)"', () => {
          const result = ViewStandardChargeTransactionPresenter.go(transaction)

          expect(result.adjustments).to.equal('Aggregate factor (0.75)')
        })
      })

      describe('when the adjustment factor is not 1', () => {
        beforeEach(() => {
          transaction.adjustmentFactor = 0.75
        })

        it('returns "Adjustment factor (0.75)"', () => {
          const result = ViewStandardChargeTransactionPresenter.go(transaction)

          expect(result.adjustments).to.equal('Adjustment factor (0.75)')
        })
      })

      describe('when the section 126 factor is not 1', () => {
        beforeEach(() => {
          transaction.section126Factor = 0.75
        })

        it('returns "Abatement factor (0.75)"', () => {
          const result = ViewStandardChargeTransactionPresenter.go(transaction)

          expect(result.adjustments).to.equal('Abatement factor (0.75)')
        })
      })

      describe('when the section 127 agreement is true', () => {
        beforeEach(() => {
          transaction.section127Agreement = true
        })

        it('returns "Two-part tariff (0.5)"', () => {
          const result = ViewStandardChargeTransactionPresenter.go(transaction)

          expect(result.adjustments).to.equal('Two-part tariff (0.5)')
        })
      })

      describe('when the section 130 agreement is "true " (they stored it as a string!)', () => {
        beforeEach(() => {
          transaction.section130Agreement = 'true '
        })

        it('returns "Canal and River Trust (0.5)"', () => {
          const result = ViewStandardChargeTransactionPresenter.go(transaction)

          expect(result.adjustments).to.equal('Canal and River Trust (0.5)')
        })
      })

      describe('when is winter only is true', () => {
        beforeEach(() => {
          transaction.winterOnly = true
        })

        it('returns "Winter discount (0.5)"', () => {
          const result = ViewStandardChargeTransactionPresenter.go(transaction)

          expect(result.adjustments).to.equal('Winter discount (0.5)')
        })
      })

      describe('when more than one adjustment is set', () => {
        beforeEach(() => {
          transaction.adjustmentFactor = 0.75
          transaction.section127Agreement = true
          transaction.winterOnly = true
        })

        it('returns the adjustment descriptions combined', () => {
          const result = ViewStandardChargeTransactionPresenter.go(transaction)

          expect(result.adjustments).to.equal('Adjustment factor (0.75), Two-part tariff (0.5), Winter discount (0.5)')
        })
      })
    })

    describe('"chargeElements" property', () => {
      it('returns the purpose, abstraction period and volume for each element linked via the charge reference', () => {
        const result = ViewStandardChargeTransactionPresenter.go(transaction)

        expect(result.chargeElements).to.equal([
          {
            purpose: 'Spray Irrigation - Direct',
            abstractionPeriod: '1 April to 30 April',
            volume: '5ML'
          },
          {
            purpose: 'Spray Irrigation - Direct',
            abstractionPeriod: '1 May to 30 September',
            volume: '24ML'
          }
        ])
      })
    })

    describe("'chargeReference' property", () => {
      it("returns the charge category combined with the base line charge '4.5.13 (£1162.00)'", () => {
        const result = ViewStandardChargeTransactionPresenter.go(transaction)

        expect(result.chargeReference).to.equal('4.5.13 (£1162.00)')
      })
    })

    it('correctly presents the data', () => {
      const result = ViewStandardChargeTransactionPresenter.go(transaction)

      expect(result).to.equal({
        additionalCharges: '',
        adjustments: '',
        billableDays: '153/214',
        chargeCategoryDescription: 'Medium loss, non-tidal, greater than 83 up to and including 142 ML/yr',
        chargeElements: [
          {
            purpose: 'Spray Irrigation - Direct',
            abstractionPeriod: '1 April to 30 April',
            volume: '5ML'
          },
          {
            purpose: 'Spray Irrigation - Direct',
            abstractionPeriod: '1 May to 30 September',
            volume: '24ML'
          }
        ],
        chargePeriod: '1 April 2023 to 31 March 2024',
        chargeReference: '4.5.13 (£1162.00)',
        chargeType: 'standard',
        creditAmount: '',
        debitAmount: '£1,162.00',
        description: 'Water abstraction charge: Testing',
        quantity: '100ML'
      })
    })
  })

  describe('when provided with a PRESROC standard charge transaction', () => {
    beforeEach(() => {
      transaction = _presrocTransaction()
    })

    describe('that is a credit', () => {
      beforeEach(() => {
        transaction.credit = true
      })

      it('returns the credit property populated and the debit empty', () => {
        const result = ViewStandardChargeTransactionPresenter.go(transaction)

        expect(result.creditAmount).to.equal('£1,162.00')
        expect(result.debitAmount).to.equal('')
      })
    })

    describe('that is a debit', () => {
      beforeEach(() => {
        transaction.credit = false
      })

      it('returns the debit property populated and the credit empty', () => {
        const result = ViewStandardChargeTransactionPresenter.go(transaction)

        expect(result.creditAmount).to.equal('')
        expect(result.debitAmount).to.equal('£1,162.00')
      })
    })

    describe('the "agreement" property', () => {
      describe('when the transaction is two-part tariff', () => {
        beforeEach(() => {
          transaction.section127Agreement = true
        })

        it('returns "Two-part tariff"', () => {
          const result = ViewStandardChargeTransactionPresenter.go(transaction)

          expect(result.agreement).to.equal('Two-part tariff')
        })
      })

      describe('when the transaction is not two-part tariff', () => {
        beforeEach(() => {
          transaction.section127Agreement = false
        })

        it('returns null', () => {
          const result = ViewStandardChargeTransactionPresenter.go(transaction)

          expect(result.agreement).to.be.null()
        })
      })
    })

    describe('the "chargeElement" property', () => {
      it('returns the purpose, abstraction period, source, season and loss for the transaction', () => {
        const result = ViewStandardChargeTransactionPresenter.go(transaction)

        expect(result.chargeElement).to.equal({
          purpose: 'Trickle Irrigation - Direct',
          abstractionPeriod: '1 May to 31 August',
          source: 'Unsupported',
          season: 'Summer',
          loss: 'High'
        })
      })
    })

    it('correctly presents the data', () => {
      const result = ViewStandardChargeTransactionPresenter.go(transaction)

      expect(result).to.equal({
        agreement: null,
        billableDays: '153/214',
        chargeElement: {
          purpose: 'Trickle Irrigation - Direct',
          abstractionPeriod: '1 May to 31 August',
          source: 'Unsupported',
          season: 'Summer',
          loss: 'High'
        },
        chargePeriod: '1 April 2023 to 31 March 2024',
        chargeType: 'standard',
        creditAmount: '',
        debitAmount: '£1,162.00',
        description: 'Water abstraction charge: Testing',
        quantity: '12ML'
      })
    })
  })
})

function _baseTransaction() {
  return {
    billingTransactionId: '3ca5221c-94c4-4246-8e96-41084cad1429',
    authorisedDays: 214,
    billableDays: 153,
    chargeType: 'standard',
    description: 'Water abstraction charge: Testing',
    endDate: new Date('2024-03-31'),
    credit: false,
    netAmount: 116200,
    startDate: new Date('2023-04-01'),
    volume: 100,
    chargeReference: {
      chargeElementId: 'ce404dc9-181e-4539-b604-e0aa1b294e18'
    }
  }
}

function _presrocTransaction() {
  const transaction = {
    ..._baseTransaction(),
    loss: 'high',
    scheme: 'alcs',
    season: 'summer',
    section127Agreement: false,
    source: 'unsupported',
    volume: 12,
    abstractionPeriodStartDay: 1,
    abstractionPeriodStartMonth: 5,
    abstractionPeriodEndDay: 31,
    abstractionPeriodEndMonth: 8
  }

  transaction.chargeReference.purpose = {
    purposeUseId: 'd146914e-7866-40f6-bfe4-9095e783a535',
    description: 'Trickle Irrigation - Direct'
  }

  return transaction
}

function _srocTransaction() {
  const transaction = {
    ..._baseTransaction(),
    aggregateFactor: 1,
    adjustmentFactor: 1,
    chargeCategoryCode: '4.5.13',
    chargeCategoryDescription: 'Medium loss, non-tidal, greater than 83 up to and including 142 ML/yr',
    waterCompanyCharge: false,
    winterOnly: false,
    scheme: 'sroc',
    section126Factor: 1,
    section127Agreement: false,
    section130Agreement: 'false',
    supportedSourceName: null,
    baselineCharge: 1162,
    supportedSourceChargeValue: 0,
    waterCompanyChargeValue: 0
  }

  transaction.chargeReference.chargeElements = [
    {
      chargePurposeId: 'fd2f0260-aa18-473a-ab20-70efc0aef9f9',
      abstractionPeriodStartDay: 1,
      abstractionPeriodStartMonth: 4,
      abstractionPeriodEndDay: 30,
      abstractionPeriodEndMonth: 4,
      authorisedAnnualQuantity: 5,
      purpose: {
        purposeUseId: 'b1e0ef46-b1f6-4607-8642-d916d5b76b44',
        description: 'Spray Irrigation - Direct'
      }
    },
    {
      chargePurposeId: 'c79f8e0e-71f7-404c-a19a-11a8fc4cfae4',
      abstractionPeriodStartDay: 1,
      abstractionPeriodStartMonth: 5,
      abstractionPeriodEndDay: 30,
      abstractionPeriodEndMonth: 9,
      authorisedAnnualQuantity: 24,
      purpose: {
        purposeUseId: 'b1e0ef46-b1f6-4607-8642-d916d5b76b44',
        description: 'Spray Irrigation - Direct'
      }
    }
  ]

  return transaction
}
