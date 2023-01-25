'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const AbstractionBillingPeriodService = require('../../../app/services/supplementary-billing/abstraction-billing-period.service.js')

describe('Abstraction Billing Period service', () => {
  const billingPeriod = {
    startDate: new Date('2022-04-01'),
    endDate: new Date('2023-03-31')
  }
  let chargePurpose

  describe('when the chargePurpose has an in-year abstraction period (end after start)', () => {
    describe('and the start and end months are different', () => {
      describe('and the start date is before the billing period start date', () => {
        beforeEach(() => {
          chargePurpose = {
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 1,
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 5
          }
        })

        it('returns a correctly calculated array of abstraction billing periods', () => {
          const result = AbstractionBillingPeriodService.go(billingPeriod, chargePurpose)

          expect(result).to.be.an.array()

          expect(result[0].startDate).to.equal(new Date('2022-01-01'))
          expect(result[0].endDate).to.equal(new Date('2022-05-31'))
          expect(result[0].billableStartDate).to.equal(new Date('2022-04-01'))
          expect(result[0].billableEndDate).to.equal(new Date('2022-05-31'))
          expect(result[0].billableDays).to.equal(61)

          expect(result[1].startDate).to.equal(new Date('2023-01-01'))
          expect(result[1].endDate).to.equal(new Date('2023-05-31'))
          expect(result[1].billableStartDate).to.equal(new Date('2023-01-01'))
          expect(result[1].billableEndDate).to.equal(new Date('2023-03-31'))
          expect(result[1].billableDays).to.equal(90)
        })
      })

      describe('and the start date is after the billing period start date', () => {
        beforeEach(() => {
          chargePurpose = {
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 5,
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 10
          }
        })

        it('returns a correctly calculated array of abstraction billing periods', () => {
          const result = AbstractionBillingPeriodService.go(billingPeriod, chargePurpose)

          expect(result).to.be.an.array()

          expect(result[0].startDate).to.equal(new Date('2022-05-01'))
          expect(result[0].endDate).to.equal(new Date('2022-10-31'))
          expect(result[0].billableStartDate).to.equal(new Date('2022-05-01'))
          expect(result[0].billableEndDate).to.equal(new Date('2022-10-31'))
          expect(result[0].billableDays).to.equal(184)

          expect(result[1]).to.be.undefined()
        })
      })

      describe('and the start date is equal to the billing period start date', () => {
        beforeEach(() => {
          chargePurpose = {
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 4,
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 10
          }
        })

        it('returns a correctly calculated array of abstraction billing periods', () => {
          const result = AbstractionBillingPeriodService.go(billingPeriod, chargePurpose)

          expect(result).to.be.an.array()

          expect(result[0].startDate).to.equal(new Date('2022-04-01'))
          expect(result[0].endDate).to.equal(new Date('2022-10-31'))
          expect(result[0].billableStartDate).to.equal(new Date('2022-04-01'))
          expect(result[0].billableEndDate).to.equal(new Date('2022-10-31'))
          expect(result[0].billableDays).to.equal(214)

          expect(result[1]).to.be.undefined()
        })
      })
    })

    describe('and the start and end months are the same', () => {
      describe('and the start date is before the billing period start date', () => {
        beforeEach(() => {
          chargePurpose = {
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 3,
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 3
          }
        })

        it('returns a correctly calculated array of abstraction billing periods', () => {
          const result = AbstractionBillingPeriodService.go(billingPeriod, chargePurpose)

          expect(result).to.be.an.array()

          expect(result[0].startDate).to.equal(new Date('2023-03-01'))
          expect(result[0].endDate).to.equal(new Date('2023-03-31'))
          expect(result[0].billableStartDate).to.equal(new Date('2023-03-01'))
          expect(result[0].billableEndDate).to.equal(new Date('2023-03-31'))
          expect(result[0].billableDays).to.equal(31)

          expect(result[1]).to.be.undefined()
        })
      })

      describe('and the start date is after the billing period start date', () => {
        beforeEach(() => {
          chargePurpose = {
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 5,
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 5
          }
        })

        it('returns a correctly calculated array of abstraction billing periods', () => {
          const result = AbstractionBillingPeriodService.go(billingPeriod, chargePurpose)

          expect(result).to.be.an.array()

          expect(result[0].startDate).to.equal(new Date('2022-05-01'))
          expect(result[0].endDate).to.equal(new Date('2022-05-31'))
          expect(result[0].billableStartDate).to.equal(new Date('2022-05-01'))
          expect(result[0].billableEndDate).to.equal(new Date('2022-05-31'))
          expect(result[0].billableDays).to.equal(31)

          expect(result[1]).to.be.undefined()
        })
      })

      describe('and the start date is equal to the billing period start date', () => {
        beforeEach(() => {
          chargePurpose = {
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 4,
            abstractionPeriodEndDay: 30,
            abstractionPeriodEndMonth: 4
          }
        })

        it('returns a correctly calculated array of abstraction billing periods', () => {
          const result = AbstractionBillingPeriodService.go(billingPeriod, chargePurpose)

          expect(result).to.be.an.array()

          expect(result[0].startDate).to.equal(new Date('2022-04-01'))
          expect(result[0].endDate).to.equal(new Date('2022-04-30'))
          expect(result[0].billableStartDate).to.equal(new Date('2022-04-01'))
          expect(result[0].billableEndDate).to.equal(new Date('2022-04-30'))
          expect(result[0].billableDays).to.equal(30)

          expect(result[1]).to.be.undefined()
        })
      })
    })
  })

  describe('when the chargePurpose has an out-year abstraction period (end before start)', () => {
    describe('and the start and end months are different', () => {
      describe('and the start date is before the billing period start date', () => {
        beforeEach(() => {
          chargePurpose = {
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 3,
            abstractionPeriodEndDay: 28,
            abstractionPeriodEndMonth: 2
          }
        })

        it('returns a correctly calculated array of abstraction billing periods', () => {
          const result = AbstractionBillingPeriodService.go(billingPeriod, chargePurpose)

          expect(result).to.be.an.array()

          expect(result[0].startDate).to.equal(new Date('2022-03-01'))
          expect(result[0].endDate).to.equal(new Date('2023-02-28'))
          expect(result[0].billableStartDate).to.equal(new Date('2022-04-01'))
          expect(result[0].billableEndDate).to.equal(new Date('2023-02-28'))
          expect(result[0].billableDays).to.equal(334)

          expect(result[1]).to.be.undefined()
        })
      })

      describe('and the start date is after the billing period start date', () => {
        beforeEach(() => {
          chargePurpose = {
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 10,
            abstractionPeriodEndDay: 30,
            abstractionPeriodEndMonth: 9
          }
        })

        it('returns a correctly calculated array of abstraction billing periods', () => {
          const result = AbstractionBillingPeriodService.go(billingPeriod, chargePurpose)

          expect(result).to.be.an.array()

          expect(result[0].startDate).to.equal(new Date('2021-10-01'))
          expect(result[0].endDate).to.equal(new Date('2022-09-30'))
          expect(result[0].billableStartDate).to.equal(new Date('2022-04-01'))
          expect(result[0].billableEndDate).to.equal(new Date('2022-09-30'))
          expect(result[0].billableDays).to.equal(183)

          expect(result[1].startDate).to.equal(new Date('2022-10-01'))
          expect(result[1].endDate).to.equal(new Date('2023-09-30'))
          expect(result[1].billableStartDate).to.equal(new Date('2022-10-01'))
          expect(result[1].billableEndDate).to.equal(new Date('2023-03-31'))
          expect(result[1].billableDays).to.equal(182)
        })
      })

      describe('and the start date is equal to the billing period start date', () => {
        beforeEach(() => {
          chargePurpose = {
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 4,
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 3
          }
        })

        it('returns a correctly calculated array of abstraction billing periods', () => {
          const result = AbstractionBillingPeriodService.go(billingPeriod, chargePurpose)

          expect(result).to.be.an.array()

          expect(result[0].startDate).to.equal(new Date('2022-04-01'))
          expect(result[0].endDate).to.equal(new Date('2023-03-31'))
          expect(result[0].billableStartDate).to.equal(new Date('2022-04-01'))
          expect(result[0].billableEndDate).to.equal(new Date('2023-03-31'))
          expect(result[0].billableDays).to.equal(365)

          expect(result[1]).to.be.undefined()
        })
      })
    })

    describe('and the start and end months are the same', () => {
      describe('and the start date is before the billing period start date', () => {
        beforeEach(() => {
          chargePurpose = {
            abstractionPeriodStartDay: 31,
            abstractionPeriodStartMonth: 3,
            abstractionPeriodEndDay: 1,
            abstractionPeriodEndMonth: 3
          }
        })

        it('returns a correctly calculated array of abstraction billing periods', () => {
          const result = AbstractionBillingPeriodService.go(billingPeriod, chargePurpose)

          expect(result).to.be.an.array()

          expect(result[0].startDate).to.equal(new Date('2022-03-31'))
          expect(result[0].endDate).to.equal(new Date('2023-03-01'))
          expect(result[0].billableStartDate).to.equal(new Date('2022-04-01'))
          expect(result[0].billableEndDate).to.equal(new Date('2023-03-01'))
          expect(result[0].billableDays).to.equal(335)

          expect(result[1]).to.be.undefined()
        })
      })

      describe('and the start date is after the billing period start date', () => {
        beforeEach(() => {
          chargePurpose = {
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 10,
            abstractionPeriodEndDay: 30,
            abstractionPeriodEndMonth: 9
          }
        })

        it('returns a correctly calculated array of abstraction billing periods', () => {
          const result = AbstractionBillingPeriodService.go(billingPeriod, chargePurpose)

          expect(result).to.be.an.array()

          expect(result[0].startDate).to.equal(new Date('2021-10-01'))
          expect(result[0].endDate).to.equal(new Date('2022-09-30'))
          expect(result[0].billableStartDate).to.equal(new Date('2022-04-01'))
          expect(result[0].billableEndDate).to.equal(new Date('2022-09-30'))
          expect(result[0].billableDays).to.equal(183)

          expect(result[1].startDate).to.equal(new Date('2022-10-01'))
          expect(result[1].endDate).to.equal(new Date('2023-09-30'))
          expect(result[1].billableStartDate).to.equal(new Date('2022-10-01'))
          expect(result[1].billableEndDate).to.equal(new Date('2023-03-31'))
          expect(result[1].billableDays).to.equal(182)
        })
      })
    })
  })

  describe('when the chargePurpose has an abstraction period where start and end is the same', () => {
    beforeEach(() => {
      chargePurpose = {
        abstractionPeriodStartDay: 1,
        abstractionPeriodStartMonth: 4,
        abstractionPeriodEndDay: 1,
        abstractionPeriodEndMonth: 4
      }
    })

    it('returns a correctly calculated array of abstraction billing periods', () => {
      const result = AbstractionBillingPeriodService.go(billingPeriod, chargePurpose)

      expect(result).to.be.an.array()

      expect(result[0].startDate).to.equal(new Date('2022-04-01'))
      expect(result[0].endDate).to.equal(new Date('2022-04-01'))
      expect(result[0].billableStartDate).to.equal(new Date('2022-04-01'))
      expect(result[0].billableEndDate).to.equal(new Date('2022-04-01'))
      expect(result[0].billableDays).to.equal(1)

      expect(result[1]).to.be.undefined()
    })
  })
})
