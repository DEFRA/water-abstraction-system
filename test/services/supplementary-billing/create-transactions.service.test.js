'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const CreateTransactionsService = require('../../../app/services/supplementary-billing/create-transactions.service.js')

describe('Create Transactions service', () => {
  const billingPeriod = {
    startDate: new Date('2022-04-01'),
    endDate: new Date('2023-03-31')
  }
  let chargeElements

  describe('when there is one chargeElement', () => {
    describe('containing one chargePurpose', () => {
      beforeEach(() => {
        chargeElements = [
          {
            billingChargeCategory: { reference: '1.2.3' },
            chargePurposes: [
              {
                abstractionPeriodStartDay: 1,
                abstractionPeriodStartMonth: 4,
                abstractionPeriodEndDay: 30,
                abstractionPeriodEndMonth: 9
              }
            ]
          }
        ]
      })

      it('returns a correctly calculated array of transaction lines', () => {
        const result = CreateTransactionsService.go(billingPeriod, chargeElements)

        expect(result).to.be.an.array()

        expect(result[0].reference).to.equal(chargeElements[0].billingChargeCategory.reference)
        expect(result[0].billableDays).to.equal(183)
      })
    })

    describe('containing two chargePurposes', () => {
      beforeEach(() => {
        chargeElements = [
          {
            billingChargeCategory: { reference: '1.2.3' },
            chargePurposes: [
              {
                abstractionPeriodStartDay: 1,
                abstractionPeriodStartMonth: 4,
                abstractionPeriodEndDay: 30,
                abstractionPeriodEndMonth: 9
              },
              {
                abstractionPeriodStartDay: 1,
                abstractionPeriodStartMonth: 10,
                abstractionPeriodEndDay: 31,
                abstractionPeriodEndMonth: 3
              }
            ]
          }
        ]
      })

      it('returns a correctly calculated array of transaction lines', () => {
        const result = CreateTransactionsService.go(billingPeriod, chargeElements)

        expect(result).to.be.an.array()

        expect(result[0].reference).to.equal(chargeElements[0].billingChargeCategory.reference)
        expect(result[0].billableDays).to.equal(365)
      })
    })
  })

  describe('when there are multiple chargeElements', () => {
    beforeEach(() => {
      chargeElements = [
        {
          billingChargeCategory: { reference: '1.2.3' },
          chargePurposes: [
            {
              abstractionPeriodStartDay: 1,
              abstractionPeriodStartMonth: 4,
              abstractionPeriodEndDay: 30,
              abstractionPeriodEndMonth: 9
            },
            {
              abstractionPeriodStartDay: 1,
              abstractionPeriodStartMonth: 10,
              abstractionPeriodEndDay: 31,
              abstractionPeriodEndMonth: 3
            }
          ]
        },
        {
          billingChargeCategory: { reference: '4.5.6' },
          chargePurposes: [
            {
              abstractionPeriodStartDay: 1,
              abstractionPeriodStartMonth: 4,
              abstractionPeriodEndDay: 28,
              abstractionPeriodEndMonth: 2
            }
          ]
        }
      ]
    })

    it('returns a correctly calculated array of transaction lines', () => {
      const result = CreateTransactionsService.go(billingPeriod, chargeElements)

      expect(result).to.be.an.array()

      expect(result[0].reference).to.equal(chargeElements[0].billingChargeCategory.reference)
      expect(result[0].billableDays).to.equal(365)

      expect(result[1].reference).to.equal(chargeElements[1].billingChargeCategory.reference)
      expect(result[1].billableDays).to.equal(334)
    })
  })
})
